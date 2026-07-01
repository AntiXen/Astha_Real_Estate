import { SiteSettings, Category, Company, Property, Inquiry } from '../types';
import { defaultSettings, defaultCategories, defaultCompanies, defaultProperties } from '../data/seeding';
import { supabase, isSupabaseEnabled } from './supabaseClient';

// Storage Key Constants
const SETTINGS_KEY = 'ast_settings';
const CATEGORIES_KEY = 'ast_categories';
const COMPANIES_KEY = 'ast_companies';
const PROPERTIES_KEY = 'ast_properties';
const INQUIRIES_KEY = 'ast_inquiries';
const CACHE_TIMESTAMP_KEY = 'ast_cache_timestamp';

function logSupabaseError(operation: string, error: any) {
  if (!error) return;
  console.error(`[dbService] Supabase error during ${operation}:`, error.message || error);
}

// 🛡️ CRASH PROOFING: Ensure cache poisoning (null) never breaks the app
function readLocalItem<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed) return fallback;
    
    // Type checking against fallback structures
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && typeof parsed !== 'object') return fallback;
    
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeLocalItem<T>(key: string, value: T): void {
  if (!value) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[dbService] Could not cache "${key}" to localStorage (likely quota exceeded):`, err);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

function updateCacheTimestamp() {
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

// 🛡️ Payload Normalizer: Ensures Supabase upsert arrays have identical keys 
// and filters out local undefined values that cause SQL syntax failures.
function sanitizePayload(data: any): any {
  if (!data) return data;
  
  const cleanObject = (obj: any) => {
    const { inserted_at, updated_at, ...rest } = obj;
    const cleaned: any = {};
    for (const key of Object.keys(rest)) {
      cleaned[key] = rest[key] === undefined ? null : rest[key];
    }
    return cleaned;
  };

  if (Array.isArray(data)) {
    return data.map(cleanObject);
  }
  return cleanObject(data);
}

export const dbService = {
  // --- Site Settings ---
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        updateCacheTimestamp();
        writeLocalItem(SETTINGS_KEY, data);
        return data as SiteSettings;
      }
      logSupabaseError('getSettings', error);
      
      if (error?.code === 'PGRST116') { // No rows found
        await dbService.initializeSettings();
        return defaultSettings;
      }
      
      // If any error other than PGRST116 occurs, propagate it to prevent stale local cache masking
      throw new Error(`Supabase settings fetch failed: ${error?.message || JSON.stringify(error)}`);
    }
    return readLocalItem<SiteSettings>(SETTINGS_KEY, defaultSettings);
  },

  async initializeSettings(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(defaultSettings);
      const { error } = await supabase.from('site_settings').insert(payload);
      if (error && error.code !== '23505') {
        logSupabaseError('initializeSettings', error);
      }
    }
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(settings);
      const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        logSupabaseError('saveSettings', error);
        throw new Error(`Settings save failed: ${error?.message || 'Unknown error'}`);
      }
    }
    writeLocalItem(SETTINGS_KEY, settings);
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        logSupabaseError('getCategories', error);
        throw new Error(`Supabase categories fetch failed: ${error?.message || 'Unknown error'}`);
      }
      
      if (data && data.length > 0) {
        writeLocalItem(CATEGORIES_KEY, data);
        return data as Category[];
      }
      
      // Seed categories server-side if completely empty
      await dbService.initializeCategories();
      return defaultCategories;
    }
    return readLocalItem<Category[]>(CATEGORIES_KEY, defaultCategories);
  },

  async initializeCategories(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(defaultCategories);
      const { error } = await supabase.from('categories').insert(payload);
      if (error && error.code !== '23505') logSupabaseError('initializeCategories', error);
    }
  },

  async saveCategories(categories: Category[]): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(categories);
      const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        logSupabaseError('saveCategories', error);
        throw new Error(`Categories save failed: ${error?.message || 'Unknown error'}`);
      }
    }
    writeLocalItem(CATEGORIES_KEY, categories);
    return categories;
  },

  async deleteCategory(id: string): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        logSupabaseError('deleteCategory', error);
        throw new Error(`Category deletion failed: ${error?.message || 'Unknown error'}`);
      }
      return await this.getCategories();
    }
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    writeLocalItem(CATEGORIES_KEY, filtered);
    return filtered;
  },

  // --- Companies (Developers) ---
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('companies').select('*');
      if (error) {
        logSupabaseError('getCompanies', error);
        throw new Error(`Supabase companies fetch failed: ${error?.message || 'Unknown error'}`);
      }
      
      if (data && data.length > 0) {
        writeLocalItem(COMPANIES_KEY, data);
        return data as Company[];
      }
      
      // Seed companies server-side if completely empty
      await dbService.initializeCompanies();
      return defaultCompanies;
    }
    return readLocalItem<Company[]>(COMPANIES_KEY, defaultCompanies);
  },

  async initializeCompanies(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(defaultCompanies);
      const { error } = await supabase.from('companies').insert(payload);
      if (error && error.code !== '23505') logSupabaseError('initializeCompanies', error);
    }
  },

  async saveCompanies(companies: Company[]): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(companies);
      const { error } = await supabase.from('companies').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        logSupabaseError('saveCompanies', error);
        throw new Error(`Companies save failed: ${error?.message || 'Unknown error'}`);
      }
    }
    writeLocalItem(COMPANIES_KEY, companies);
    return companies;
  },

  async deleteCompany(id: string): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) {
        logSupabaseError('deleteCompany', error);
        throw new Error(`Company deletion failed: ${error?.message || 'Unknown error'}`);
      }
      return await this.getCompanies();
    }
    const companies = await this.getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    writeLocalItem(COMPANIES_KEY, filtered);
    return filtered;
  },

  // --- Properties ---
  async getProperties(): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('properties').select('*');
      if (error) {
        logSupabaseError('getProperties', error);
        throw new Error(`Supabase properties fetch failed: ${error?.message || 'Unknown error'}`);
      }
      
      if (data && data.length > 0) {
        writeLocalItem(PROPERTIES_KEY, data);
        return data as Property[];
      }
      
      // Seed properties server-side if completely empty
      await dbService.initializeProperties();
      return defaultProperties;
    }
    return readLocalItem<Property[]>(PROPERTIES_KEY, defaultProperties);
  },

  async initializeProperties(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(defaultProperties);
      const { error } = await supabase.from('properties').insert(payload);
      if (error && error.code !== '23505') logSupabaseError('initializeProperties', error);
    }
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const properties = await this.getProperties();
    return properties.find((p) => p.id === id);
  },

  async saveProperties(properties: Property[]): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(properties);
      const { error } = await supabase.from('properties').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        logSupabaseError('saveProperties', error);
        throw new Error(`Properties save failed: ${error?.message || 'Unknown error'}`);
      }
    }
    writeLocalItem(PROPERTIES_KEY, properties);
    return properties;
  },

  async deleteProperty(id: string): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        logSupabaseError('deleteProperty', error);
        throw new Error(`Property deletion failed: ${error?.message || 'Unknown error'}`);
      }
      return await this.getProperties();
    }
    const properties = await this.getProperties();
    const filtered = properties.filter((p) => p.id !== id);
    writeLocalItem(PROPERTIES_KEY, filtered);
    return filtered;
  },

  // --- Inquiries (Leads) ---
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) {
        logSupabaseError('getInquiries', error);
        throw new Error(`Supabase inquiries fetch failed: ${error?.message || 'Unknown error'}`);
      }
      writeLocalItem(INQUIRIES_KEY, data || []);
      return (data || []) as Inquiry[];
    }
    return readLocalItem<Inquiry[]>(INQUIRIES_KEY, []);
  },

  async saveInquiry(inquiryData: Omit<Inquiry, 'id' | 'created_at'>): Promise<Inquiry | null> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(inquiryData);
      
      // 🛡️ SECURITY FIX: Do not chain .select() or .single() here!
      // Since anonymous users do not have SELECT permissions, chaining select()
      // triggers an RLS violation. Executing a clean insert() succeeds perfectly
      // while preserving total database privacy.
      const { error } = await supabase.from('inquiries').insert([payload]);
      if (error) {
        logSupabaseError('saveInquiry', error);
        throw new Error(`Inquiry submission failed: ${error?.message || 'Unknown error'}`);
      }
      
      // Return a simulated object since the write succeeded
      return {
        ...inquiryData,
        id: 'temp-inq-id',
        created_at: new Date().toISOString()
      } as Inquiry;
    }
    
    // Local storage fallback
    const inquiries = await this.getInquiries();
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [newInquiry, ...inquiries];
    writeLocalItem(INQUIRIES_KEY, updated);
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: 'new' | 'read'): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) {
        logSupabaseError('updateInquiryStatus', error);
        throw new Error(`Inquiry update failed: ${error?.message || 'Unknown error'}`);
      }
    }
    
    const inquiries = await this.getInquiries();
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status } : inq);
    writeLocalItem(INQUIRIES_KEY, updated);
  },

  // Reset helper to revert database back to original defaults
  async resetToDefaults(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.rpc('reset_to_defaults_rpc', {
        default_settings_json: sanitizePayload(defaultSettings),
        default_categories_json: sanitizePayload(defaultCategories),
        default_companies_json: sanitizePayload(defaultCompanies),
        default_properties_json: sanitizePayload(defaultProperties)
      });
      if (error) {
        logSupabaseError('resetToDefaults', error);
        throw new Error(`System reset failed: ${error?.message || 'Unknown error'}`);
      }
      return;
    }

    writeLocalItem(SETTINGS_KEY, defaultSettings);
    writeLocalItem(CATEGORIES_KEY, defaultCategories);
    writeLocalItem(COMPANIES_KEY, defaultCompanies);
    writeLocalItem(PROPERTIES_KEY, defaultProperties);
    writeLocalItem(INQUIRIES_KEY, []);
  },

  // Initialize database with default data if tables are empty
  async initialize(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data: settingsData, error } = await supabase.from('site_settings').select('id').eq('id', 'default').limit(1).maybeSingle();
        if (!error && !settingsData) {
          await dbService.initializeSettings();
          await dbService.initializeCategories();
          await dbService.initializeCompanies();
          await dbService.initializeProperties();
        }
      } catch (err) {
        console.warn('[dbService] Autoseed check bypassed:', err);
      }
    }
  }
};