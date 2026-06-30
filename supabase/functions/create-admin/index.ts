// supabase/functions/create-admin/index.ts
//
// Deploy with:
//   supabase functions deploy create-admin
//
// Required secrets (set with `supabase secrets set`):
//   SUPABASE_URL              (auto-provided by the platform)
//   SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API -> service_role)
//
// This function replaces the client-side `supabase.auth.signUp()` call
// that AuthGate/SubAdminsView previously made directly. Doing it this
// way means:
//   1. Creating a new admin user never swaps out the calling admin's
//      session (the old bug where adding a sub-admin logged the
//      current admin out and logged them in as the new account).
//   2. Only an existing super admin can create more admins, enforced
//      server-side -- not just hidden by a UI toggle.
//   3. The very first admin (bootstrap case, when admin_users is
//      empty) can still self-register as the super admin.

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

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return json({ error: "name, email and password are required" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  // service-role client: bypasses RLS, used only for trusted server-side checks
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // How many admins currently exist?
  const { count, error: countError } = await admin
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return json({ error: `Could not check existing admins: ${countError.message}` }, 500);
  }

  const isBootstrap = (count ?? 0) === 0;

  if (!isBootstrap) {
    // Not the first admin -> caller MUST be an authenticated super admin.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const { data: callerData, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !callerData?.user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    const { data: callerProfile, error: callerProfileError } = await admin
      .from("admin_users")
      .select("is_super")
      .eq("auth_user_id", callerData.user.id)
      .limit(1)
      .maybeSingle();

    if (callerProfileError || !callerProfile) {
      return json({ error: "Caller is not a registered admin" }, 403);
    }
    if (!callerProfile.is_super) {
      return json({ error: "Only the super admin can create new admins" }, 403);
    }
  }

  // Create the auth user (does NOT touch the caller's session — this
  // is the service-role admin API, separate from client auth.signUp)
  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !createdUser?.user) {
    return json({ error: createUserError?.message ?? "Failed to create user" }, 400);
  }

  const { error: insertError } = await admin.from("admin_users").insert({
    auth_user_id: createdUser.user.id,
    name,
    email,
    is_super: isBootstrap, // only the very first admin is super by default
  });

  if (insertError) {
    // Roll back the auth user so we don't leave an orphaned account
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return json({ error: `Failed to save admin profile: ${insertError.message}` }, 500);
  }

  return json({
    user: {
      userId: createdUser.user.id,
      name,
      email,
      isSuper: isBootstrap,
    },
  });
});