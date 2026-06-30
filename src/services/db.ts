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
    // If parsed is null/empty, force the fallback
    if (!parsed) return fallback;
    
    // If it expects an array but gets an object (or vice versa), force fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && typeof parsed !== 'object') return fallback;
    
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeLocalItem<T>(key: string, value: T): void {
  if (!value) return; // Never save a null value to cache
  localStorage.setItem(key, JSON.stringify(value));
}

function updateCacheTimestamp() {
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

// 🛡️ Supabase strict JSON requires matching keys for bulk array upserts.
// This strips out Postgres timestamps and converts `undefined` to `null`.
function sanitizePayload(data: any | any[]) {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => {
      const { inserted_at, updated_at, ...rest } = item;
      const cleaned: any = {};
      for (const key in rest) {
        cleaned[key] = rest[key] === undefined ? null : rest[key];
      }
      return cleaned;
    });
  }
  const { inserted_at, updated_at, ...rest } = data;
  const cleaned: any = {};
  for (const key in rest) {
    cleaned[key] = rest[key] === undefined ? null : rest[key];
  }
  return cleaned;
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
        await this.initializeSettings();
        return defaultSettings;
      }
    }
    return readLocalItem<SiteSettings>(SETTINGS_KEY, defaultSettings);
  },

  async initializeSettings(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(defaultSettings);
      const { error } = await supabase.from('site_settings').insert(payload);
      if (error && error.code !== '23505') logSupabaseError('initializeSettings', error);
    }
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(settings);
      const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });
      if (error) {
        logSupabaseError('saveSettings', error);
        return;
      }
    }
    writeLocalItem(SETTINGS_KEY, settings);
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) {
        writeLocalItem(CATEGORIES_KEY, data);
        return data as Category[];
      }
      logSupabaseError('getCategories', error);
      if (data?.length === 0 || error?.code === 'PGRST116') await this.initializeCategories();
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
      const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
      if (error) {
        logSupabaseError('saveCategories', error);
        return categories;
      }
    }
    writeLocalItem(CATEGORIES_KEY, categories);
    return categories;
  },

  async deleteCategory(id: string): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        const categories = await this.getCategories();
        return categories.filter((category) => category.id !== id);
      }
      logSupabaseError('deleteCategory', error);
    }
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    writeLocalItem(CATEGORIES_KEY, filtered);
    return filtered;
  },

  // --- Companies ---
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('companies').select('*');
      if (!error && data) {
        writeLocalItem(COMPANIES_KEY, data);
        return data as Company[];
      }
      logSupabaseError('getCompanies', error);
      if (data?.length === 0 || error?.code === 'PGRST116') await this.initializeCompanies();
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
      const { error } = await supabase.from('companies').upsert(payload, { onConflict: 'id' });
      if (error) {
        logSupabaseError('saveCompanies', error);
        return companies;
      }
    }
    writeLocalItem(COMPANIES_KEY, companies);
    return companies;
  },

  async deleteCompany(id: string): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (!error) {
        const companies = await this.getCompanies();
        return companies.filter((company) => company.id !== id);
      }
      logSupabaseError('deleteCompany', error);
    }
    const companies = await this.getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    writeLocalItem(COMPANIES_KEY, filtered);
    return filtered;
  },

  // --- Properties ---
  async getProperties(): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('properties').select('*').order('inserted_at', { ascending: false });
      if (!error && data) {
        writeLocalItem(PROPERTIES_KEY, data);
        return data as Property[];
      }
      logSupabaseError('getProperties', error);
      if (data?.length === 0 || error?.code === 'PGRST116') await this.initializeProperties();
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
      const { error } = await supabase.from('properties').upsert(payload, { onConflict: 'id' });
      if (error) {
        logSupabaseError('saveProperties', error);
        return properties;
      }
    }
    writeLocalItem(PROPERTIES_KEY, properties);
    return properties;
  },

  async deleteProperty(id: string): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) {
        const properties = await this.getProperties();
        return properties.filter((property) => property.id !== id);
      }
      logSupabaseError('deleteProperty', error);
    }
    const properties = await this.getProperties();
    const filtered = properties.filter((p) => p.id !== id);
    writeLocalItem(PROPERTIES_KEY, filtered);
    return filtered;
  },

  // --- Inquiries ---
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        writeLocalItem(INQUIRIES_KEY, data);
        return data as Inquiry[];
      }
      logSupabaseError('getInquiries', error);
    }
    return readLocalItem<Inquiry[]>(INQUIRIES_KEY, []);
  },

  async saveInquiry(inquiryData: Omit<Inquiry, 'id' | 'created_at'>): Promise<Inquiry | null> {
    if (isSupabaseEnabled && supabase) {
      const payload = sanitizePayload(inquiryData);
      const { data, error } = await supabase.from('inquiries').insert([payload]).select().single();
      if (!error && data) return data as Inquiry;
      logSupabaseError('saveInquiry', error);
      return null;
    }
    
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
      if (error) logSupabaseError('updateInquiryStatus', error);
    }
    
    const inquiries = await this.getInquiries();
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status } : inq);
    writeLocalItem(INQUIRIES_KEY, updated);
  },

  // --- Admin functions ---
  async resetToDefaults(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      await supabase.from('properties').delete().neq('id', '0');
      await supabase.from('companies').delete().neq('id', '0');
      await supabase.from('categories').delete().neq('id', '0');
      await supabase.from('inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      await supabase.from('site_settings').delete().neq('id', '0');
      await supabase.from('site_settings').insert(sanitizePayload(defaultSettings));
      
      await supabase.from('categories').insert(sanitizePayload(defaultCategories));
      await supabase.from('companies').insert(sanitizePayload(defaultCompanies));
      await supabase.from('properties').insert(sanitizePayload(defaultProperties));
      return;
    }

    writeLocalItem(SETTINGS_KEY, defaultSettings);
    writeLocalItem(CATEGORIES_KEY, defaultCategories);
    writeLocalItem(COMPANIES_KEY, defaultCompanies);
    writeLocalItem(PROPERTIES_KEY, defaultProperties);
    writeLocalItem(INQUIRIES_KEY, []);
  },

  async initialize(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { data: settingsData } = await supabase.from('site_settings').select('id').eq('id', 'default').single();
      if (!settingsData) {
        await supabase.from('site_settings').insert(sanitizePayload(defaultSettings));
      }

      const { data: categoriesData } = await supabase.from('categories').select('id').limit(1);
      if (!categoriesData || categoriesData.length === 0) {
        await supabase.from('categories').insert(sanitizePayload(defaultCategories));
      }

      const { data: companiesData } = await supabase.from('companies').select('id').limit(1);
      if (!companiesData || companiesData.length === 0) {
        await supabase.from('companies').insert(sanitizePayload(defaultCompanies));
      }

      const { data: propertiesData } = await supabase.from('properties').select('id').limit(1);
      if (!propertiesData || propertiesData.length === 0) {
        await supabase.from('properties').insert(sanitizePayload(defaultProperties));
      }
    }
  }
};