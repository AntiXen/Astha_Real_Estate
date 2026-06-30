import { supabase, isSupabaseEnabled } from './supabaseClient';

export interface AdminUser {
  userId?: string;
  name: string;
  email: string;
  isSuper: boolean;
}

export interface LocalAdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  isSuper?: boolean;
}

const ADMIN_USERS_KEY = 'astha_admins_registered';
const SUPER_ADMIN_CREATED_KEY = 'astha_super_admin_created';
const ACTIVE_ADMIN_EMAIL_KEY = 'astha_active_admin_email';
const ACTIVE_ADMIN_NAME_KEY = 'astha_active_admin_name';

const defaultAdmins: LocalAdminUser[] = [];

function readLocalAdmins(includeDefaults = true): LocalAdminUser[] {
  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  if (!raw) return includeDefaults ? [...defaultAdmins] : [];
  try {
    return JSON.parse(raw) as LocalAdminUser[];
  } catch {
    return includeDefaults ? [...defaultAdmins] : [];
  }
}

function saveLocalAdmins(admins: LocalAdminUser[]) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins));
}

function getLocalActiveAdmin() {
  const email = localStorage.getItem(ACTIVE_ADMIN_EMAIL_KEY);
  const name = localStorage.getItem(ACTIVE_ADMIN_NAME_KEY);
  if (!email || !name) return null;
  return { email, name };
}

function setLocalActiveAdmin(name: string, email: string) {
  localStorage.setItem(ACTIVE_ADMIN_EMAIL_KEY, email);
  localStorage.setItem(ACTIVE_ADMIN_NAME_KEY, name);
}

function clearLocalActiveAdmin() {
  localStorage.removeItem(ACTIVE_ADMIN_EMAIL_KEY);
  localStorage.removeItem(ACTIVE_ADMIN_NAME_KEY);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (isSupabaseEnabled && supabase) {
    // Relies on the admin_users RLS policies: a regular admin will only
    // see their own row, a super admin sees everyone. Both are fine for
    // the UI -- SubAdminsView is only rendered for super admins anyway.
    const { data, error } = await supabase
      .from('admin_users')
      .select('auth_user_id, name, email, is_super')
      .order('created_at', { ascending: true });
    if (!error && data) {
      return data.map((row: any) => ({
        userId: row.auth_user_id || undefined,
        name: row.name,
        email: row.email,
        isSuper: row.is_super
      })) as AdminUser[];
    }
  }
  return readLocalAdmins(false).map((admin) => ({
    userId: admin.id,
    name: admin.name,
    email: admin.email,
    isSuper: !!admin.isSuper
  }));
}

export async function signInAdmin(email: string, password: string) {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    if (data?.session?.user) {
      const { data: profiles, error: profileError } = await supabase
        .from('admin_users')
        .select('name, email, is_super')
        .eq('auth_user_id', data.session.user.id)
        .limit(1);

      const profile = profiles?.[0];

      if (profileError || !profile) {
        return { error: profileError || new Error('Admin profile not found in database') };
      }

      setLocalActiveAdmin(profile.name, profile.email);
      return {
        user: {
          userId: data.session.user.id,
          name: profile.name,
          email: profile.email,
          isSuper: profile.is_super
        }
      };
    }
    return { error: new Error('Login failed') };
  }

  const admins = readLocalAdmins();
  const found = admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password);
  if (!found) {
    return { error: new Error('Invalid credentials') };
  }
  setLocalActiveAdmin(found.name, found.email);
  return { user: { userId: found.id, name: found.name, email: found.email, isSuper: !!found.isSuper } };
}

/**
 * Creates an admin account. Routed through the `create-admin` Edge
 * Function instead of calling `supabase.auth.signUp()` directly.
 *
 * Why: `supabase.auth.signUp()` runs on the *client* SDK and automatically
 * persists whatever session it returns. If a logged-in super admin used it
 * to create a sub-admin, the browser would silently switch sessions to the
 * brand-new sub-admin account instead of staying logged in. Calling the
 * Edge Function (which uses the service-role key) creates the new user
 * entirely server-side, so the caller's own session is never touched.
 *
 * The Edge Function also enforces, server-side, that:
 *  - the very first admin ever created becomes the super admin (bootstrap), and
 *  - every subsequent admin can only be created by an existing super admin.
 * This replaces the old client-only "showSignupOption" UI gate, which was
 * cosmetic and didn't actually stop anyone from calling the API directly.
 */
export async function signUpAdmin(name: string, email: string, password: string) {
  if (isSupabaseEnabled && supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const { data, error } = await supabase.functions.invoke('create-admin', {
      body: { name, email, password },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
    });

    if (error) return { error };
    if (data?.error) return { error: new Error(data.error) };

    const wasBootstrap = !accessToken; // no prior session => this was the first/super admin
    if (wasBootstrap && data?.user) {
      // Bootstrap case: nobody was logged in yet, so it's safe (and expected)
      // to now sign the brand-new super admin in on this device.
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      if (signInResult.error) return { error: signInResult.error };
      setLocalActiveAdmin(data.user.name, data.user.email);
    }

    return { user: data.user as AdminUser };
  }

  // Local-storage fallback (no Supabase configured)
  const admins = readLocalAdmins(false);
  const exists = admins.some((admin) => admin.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { error: new Error('Email already registered') };
  }

  const makeSuperLocal = admins.length === 0;
  const newAdmin: LocalAdminUser = {
    id: `admin-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    isSuper: makeSuperLocal
  };

  const updated = [...admins, newAdmin];
  saveLocalAdmins(updated);

  // Only auto-login for the bootstrap (first/super) admin, matching the
  // Supabase-backed behavior above. A logged-in super admin creating a
  // sub-admin should NOT have their own session swapped out.
  if (makeSuperLocal) {
    setLocalActiveAdmin(name, newAdmin.email);
  }
  return { user: { userId: newAdmin.id, name, email: newAdmin.email, isSuper: makeSuperLocal } };
}

export async function signOutAdmin() {
  if (isSupabaseEnabled && supabase) {
    await supabase.auth.signOut();
  }
  clearLocalActiveAdmin();
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.user) return null;

    const userId = data.session.user.id;

    const { data: profiles, error: profileError } = await supabase
      .from('admin_users')
      .select('name, email, is_super')
      .eq('auth_user_id', userId)
      .limit(1);

    const profile = profiles?.[0];

    if (profileError || !profile) return null;

    setLocalActiveAdmin(profile.name, profile.email);
    return { userId, name: profile.name, email: profile.email, isSuper: profile.is_super };
  }

  const active = getLocalActiveAdmin();
  if (!active) return null;

  const admins = readLocalAdmins(true);
  const found = admins.find((admin) => admin.email.toLowerCase() === active.email.toLowerCase());
  if (!found) {
    clearLocalActiveAdmin();
    return null;
  }
  return { userId: found.id, name: found.name, email: found.email, isSuper: !!found.isSuper };
}

export async function createSubAdmin(name: string, email: string, password: string) {
  return signUpAdmin(name, email, password);
}

/**
 * Deletes an admin. Routed through the `delete-admin` Edge Function so the
 * removal is authorized server-side (caller must be the super admin) and
 * cleans up both the `admin_users` row and the underlying auth.users
 * record, which the client could never do directly (no DELETE policy and
 * no access to auth.admin.* from the browser).
 */
export async function deleteAdminUser(email: string) {
  if (isSupabaseEnabled && supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase.functions.invoke('delete-admin', {
      body: { email },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (error) return { error };
    if (data?.error) return { error: new Error(data.error) };

    const admins = await getAdminUsers();
    return { admins };
  }

  const admins = readLocalAdmins(false);
  const updated = admins.filter((admin) => admin.email.toLowerCase() !== email.toLowerCase());
  saveLocalAdmins(updated);
  return { admins };
}

export function initializeLocalAdmins() {
  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  if (raw) return;
  localStorage.setItem(SUPER_ADMIN_CREATED_KEY, 'false');
}