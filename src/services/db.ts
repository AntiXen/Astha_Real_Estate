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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

function logSupabaseError(operation: string, error: any) {
  if (!error) return;
  console.warn(`[dbService] Supabase error during ${operation}:`, error);
}

function readLocalItem<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function updateCacheTimestamp() {
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
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
    }
    return readLocalItem<SiteSettings>(SETTINGS_KEY, defaultSettings);
  },

  async initializeSettings(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error: insertError } = await supabase.from('site_settings').insert(defaultSettings).select().single();
      if (insertError && insertError.code !== '23505') logSupabaseError('initializeSettings', insertError);
    }
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('site_settings').upsert(settings, { onConflict: 'id' }).select();
      if (!error) return;
      logSupabaseError('saveSettings', error);
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
      if (data?.length === 0) await dbService.initializeCategories();
    }
    return readLocalItem<Category[]>(CATEGORIES_KEY, defaultCategories);
  },

  async initializeCategories(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('categories').insert(defaultCategories).select();
      if (error && error.code !== '23505') logSupabaseError('initializeCategories', error);
    }
  },

  async saveCategories(categories: Category[]): Promise<Category[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'id' }).select();
      if (!error) return categories;
      logSupabaseError('saveCategories', error);
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

  // --- Companies (Developers) ---
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('companies').select('*');
      if (!error && data) {
        writeLocalItem(COMPANIES_KEY, data);
        return data as Company[];
      }
      logSupabaseError('getCompanies', error);
      if (data?.length === 0) await dbService.initializeCompanies();
    }
    return readLocalItem<Company[]>(COMPANIES_KEY, defaultCompanies);
  },

  async initializeCompanies(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('companies').insert(defaultCompanies).select();
      if (error && error.code !== '23505') logSupabaseError('initializeCompanies', error);
    }
  },

  async saveCompanies(companies: Company[]): Promise<Company[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('companies').upsert(companies, { onConflict: 'id' }).select();
      if (!error) return companies;
      logSupabaseError('saveCompanies', error);
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
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) {
        writeLocalItem(PROPERTIES_KEY, data);
        return data as Property[];
      }
      logSupabaseError('getProperties', error);
      if (data?.length === 0) await dbService.initializeProperties();
    }
    return readLocalItem<Property[]>(PROPERTIES_KEY, defaultProperties);
  },

  async initializeProperties(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('properties').insert(defaultProperties).select();
      if (error && error.code !== '23505') logSupabaseError('initializeProperties', error);
    }
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const properties = await this.getProperties();
    return properties.find((p) => p.id === id);
  },

  async saveProperties(properties: Property[]): Promise<Property[]> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('properties').upsert(properties, { onConflict: 'id' }).select();
      if (!error) return properties;
      logSupabaseError('saveProperties', error);
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

  // --- Inquiries (Leads) ---
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
      const { data, error } = await supabase.from('inquiries').insert([inquiryData]).select().single();
      if (!error && data) return data as Inquiry;
      logSupabaseError('saveInquiry', error);
      return null;
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
      if (error) logSupabaseError('updateInquiryStatus', error);
    }
    
    const inquiries = await this.getInquiries();
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status } : inq);
    writeLocalItem(INQUIRIES_KEY, updated);
  },

  // Reset helper to revert database back to original defaults
  async resetToDefaults(): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      await supabase.from('properties').delete().neq('id', '0');
      await supabase.from('companies').delete().neq('id', '0');
      await supabase.from('categories').delete().neq('id', '0');
      await supabase.from('inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      await supabase.from('site_settings').delete().neq('id', '0');
      await supabase.from('site_settings').insert(defaultSettings);
      
      await supabase.from('categories').insert(defaultCategories);
      await supabase.from('companies').insert(defaultCompanies);
      await supabase.from('properties').insert(defaultProperties);
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
      const { data: settingsData } = await supabase.from('site_settings').select('id').eq('id', 'default').single();
      if (!settingsData) {
        await supabase.from('site_settings').insert(defaultSettings);
      }

      const { data: categoriesData } = await supabase.from('categories').select('id').limit(1);
      if (!categoriesData || categoriesData.length === 0) {
        await supabase.from('categories').insert(defaultCategories);
      }

      const { data: companiesData } = await supabase.from('companies').select('id').limit(1);
      if (!companiesData || companiesData.length === 0) {
        await supabase.from('companies').insert(defaultCompanies);
      }

      const { data: propertiesData } = await supabase.from('properties').select('id').limit(1);
      if (!propertiesData || propertiesData.length === 0) {
        await supabase.from('properties').insert(defaultProperties);
      }
    }
  }
};