import { supabase, isSupabaseEnabled } from './supabaseClient';

const IMAGE_BUCKET = 'property-images';
const VIDEO_BUCKET = 'property-videos';

const MAX_IMAGE_DIMENSION = 1600; // max px length on the longest side
const IMAGE_QUALITY = 0.8;
const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[mime] || 'bin';
}

function randomId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// 🛡️ High-Performance in-browser canvas image compressor
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed'))),
      'image/jpeg',
      IMAGE_QUALITY
    );
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Read failed')));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Compresses and uploads a property image. Falls back to base64 in offline/no-Supabase mode. */
export async function uploadPropertyImage(file: File): Promise<string> {
  if (!isSupabaseEnabled || !supabase) {
    return fileToDataUrl(file);
  }

  const compressed = await compressImage(file);
  const path = `properties/${randomId()}.jpg`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`ছবি আপলোড ব্যর্থ: ${error.message}`);

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Uploads a property video. Falls back to base64 in offline mode. */
export async function uploadPropertyVideo(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error('ভিডিওর সাইজ ২০ মেগাবাইটের বেশি হতে পারবে না!');
  }

  if (!isSupabaseEnabled || !supabase) {
    return fileToDataUrl(file);
  }

  const ext = extFromMime(file.type) || 'mp4';
  const path = `properties/${randomId()}.${ext}`;

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
    contentType: file.type || 'video/mp4',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`ভিডিও আপলোড ব্যর্থ: ${error.message}`);

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Deletes a previously uploaded file from Storage. Safe to use. */
export async function deleteStorageFileByUrl(url: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase || !url) return;

  const bucket = url.includes(`/${IMAGE_BUCKET}/`) ? IMAGE_BUCKET : url.includes(`/${VIDEO_BUCKET}/`) ? VIDEO_BUCKET : null;
  if (!bucket) return;

  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length).split('?')[0];

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`[storage] Failed to delete ${bucket}/${path}:`, error.message);
}