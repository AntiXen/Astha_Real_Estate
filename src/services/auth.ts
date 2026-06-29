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
const SUPER_ADMIN_EMAIL_KEY = 'astha_super_admin_email';
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
      // FIX: Use .limit(1) instead of .single() to prevent JSON coerce errors
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

export async function signUpAdmin(name: string, email: string, password: string) {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };
    
    const userId = data?.user?.id;
    if (!userId) {
      return { error: new Error('Unable to create user') };
    }

    let makeSuper = false;
    try {
      const { data: existing, error: countError } = await supabase.from('admin_users').select('*', { count: 'exact' }).limit(1);
      if (!countError && (!existing || existing.length === 0)) {
        makeSuper = true;
      }
    } catch (e) {}

    const { error: profileError } = await supabase.from('admin_users').insert({
      auth_user_id: userId,
      name,
      email,
      is_super: makeSuper
    });
    
    if (profileError) {
      return { error: profileError };
    }
    
    setLocalActiveAdmin(name, email.toLowerCase());
    return { user: { userId, name, email: email.toLowerCase(), isSuper: makeSuper } };
  }

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
  setLocalActiveAdmin(name, newAdmin.email);
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
    
    // FIX: Use .limit(1) instead of .single() to prevent JSON coerce errors
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

export async function deleteAdminUser(email: string) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('admin_users').delete().eq('email', email);
    if (error) return { error };
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