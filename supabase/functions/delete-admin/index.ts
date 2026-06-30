// supabase/functions/delete-admin/index.ts
//
// Deploy with:
//   supabase functions deploy delete-admin
//
// Required secrets (same as create-admin):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Removes an admin's auth.users record AND their admin_users row.
// Only callable by an authenticated super admin. Prevents a super
// admin from deleting their own only account.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const targetEmail = (body.email ?? "").trim().toLowerCase();
  if (!targetEmail) return json({ error: "email is required" }, 400);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing Authorization header" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !callerData?.user) {
    return json({ error: "Invalid or expired session" }, 401);
  }

  const { data: callerProfile, error: callerProfileError } = await admin
    .from("admin_users")
    .select("is_super, email")
    .eq("auth_user_id", callerData.user.id)
    .limit(1)
    .maybeSingle();

  if (callerProfileError || !callerProfile) {
    return json({ error: "Caller is not a registered admin" }, 403);
  }
  if (!callerProfile.is_super) {
    return json({ error: "Only the super admin can delete admins" }, 403);
  }
  if (callerProfile.email.toLowerCase() === targetEmail) {
    return json({ error: "You cannot delete your own account" }, 400);
  }

  const { data: target, error: targetError } = await admin
    .from("admin_users")
    .select("auth_user_id")
    .eq("email", targetEmail)
    .limit(1)
    .maybeSingle();

  if (targetError || !target) {
    return json({ error: "Admin not found" }, 404);
  }

  const { error: deleteRowError } = await admin
    .from("admin_users")
    .delete()
    .eq("email", targetEmail);

  if (deleteRowError) {
    return json({ error: `Failed to delete admin profile: ${deleteRowError.message}` }, 500);
  }

  if (target.auth_user_id) {
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(target.auth_user_id);
    if (deleteAuthError) {
      // Profile row is already gone; surface this so it can be cleaned up manually if needed
      return json({ error: `Admin profile removed, but failed to delete auth user: ${deleteAuthError.message}` }, 500);
    }
  }

  return json({ success: true });
});