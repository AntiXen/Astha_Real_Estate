/**
 * One-time migration: finds any property image/video still stored as a
 * base64 data URL, uploads it to Supabase Storage, and rewrites the row
 * to reference the new public URL instead.
 *
 * Usage:
 *   npx tsx migrate-media.ts
 *
 * Safe to re-run: rows with no data: URLs left are skipped automatically.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'YOUR_NEW_SERVICE_ROLE_KEY') {
  console.error('Error: Please replace "YOUR_NEW_SERVICE_ROLE_KEY" with your actual Supabase Service Role Key inside your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMAGE_BUCKET = 'property-images';
const VIDEO_BUCKET = 'property-videos';

function isDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:');
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
  if (!match) throw new Error('Malformed data URL');
  const [, mime, base64] = match;
  return { mime, buffer: Buffer.from(base64, 'base64') };
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  };
  return map[mime] || 'bin';
}

async function uploadBase64(dataUrl: string, bucket: string, folder: string): Promise<string> {
  const { mime, buffer } = parseDataUrl(dataUrl);
  const path = `${folder}/${crypto.randomUUID()}.${extFromMime(mime)}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`Upload to ${bucket}/${path} failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function migrate() {
  console.log('Fetching properties from Supabase...');
  const { data: properties, error } = await supabase.from('properties').select('id, images, videoUrl');
  if (error) throw new Error(`Failed to fetch properties: ${error.message}`);

  let migratedCount = 0;

  for (const prop of properties ?? []) {
    let changed = false;
    const newImages: string[] = [];

    for (const img of (prop.images as string[] | null) ?? []) {
      if (isDataUrl(img)) {
        console.log(`[${prop.id}] Uploading image (${(img.length / 1024).toFixed(0)}KB base64)...`);
        try {
          const url = await uploadBase64(img, IMAGE_BUCKET, 'properties');
          newImages.push(url);
          changed = true;
        } catch (uploadErr) {
          console.error(`[${prop.id}] Image upload failed, skipping:`, uploadErr);
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }

    let newVideoUrl = prop.videoUrl as string | null;
    if (isDataUrl(newVideoUrl || '')) {
      console.log(`[${prop.id}] Uploading video (${(newVideoUrl!.length / 1024 / 1024).toFixed(1)}MB base64)...`);
      try {
        newVideoUrl = await uploadBase64(newVideoUrl!, VIDEO_BUCKET, 'properties');
        changed = true;
      } catch (uploadErr) {
        console.error(`[${prop.id}] Video upload failed, skipping:`, uploadErr);
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ images: newImages, videoUrl: newVideoUrl })
        .eq('id', prop.id);
      if (updateError) {
        console.error(`[${prop.id}] Failed to update database row: ${updateError.message}`);
        continue;
      }
      migratedCount++;
      console.log(`[${prop.id}] Successfully Migrated.`);
    }
  }

  console.log(`\nDone. Migrated ${migratedCount} of ${properties?.length ?? 0} properties.`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});