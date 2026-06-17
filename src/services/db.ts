import { SiteSettings, Category, Company, Property } from '../types';
import { defaultSettings, defaultCategories, defaultCompanies, defaultProperties } from '../data/seeding';

// Storage Key Constants
const SETTINGS_KEY = 'ast_settings';
const CATEGORIES_KEY = 'ast_categories';
const COMPANIES_KEY = 'ast_companies';
const PROPERTIES_KEY = 'ast_properties';

/**
 * Initialize mock or persistent storage with rich pre-seeded Bengali data if empty.
 */
function initializeDatabase() {
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(COMPANIES_KEY)) {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(defaultCompanies));
  }
  if (!localStorage.getItem(PROPERTIES_KEY)) {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(defaultProperties));
  }
}

// Guarantee database is populated on load
initializeDatabase();

export const dbService = {
  // --- Site Settings ---
  async getSettings(): Promise<SiteSettings> {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings;
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : defaultCategories;
  },

  async saveCategory(category: Category): Promise<Category[]> {
    const categories = await this.getCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    if (existingIndex > -1) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
  },

  async deleteCategory(id: string): Promise<Category[]> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // --- Companies (Developers) ---
  async getCompanies(): Promise<Company[]> {
    const raw = localStorage.getItem(COMPANIES_KEY);
    return raw ? JSON.parse(raw) : defaultCompanies;
  },

  async saveCompany(company: Company): Promise<Company[]> {
    const companies = await this.getCompanies();
    const existingIndex = companies.findIndex((c) => c.id === company.id);
    if (existingIndex > -1) {
      companies[existingIndex] = company;
    } else {
      companies.push(company);
    }
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    return companies;
  },

  async deleteCompany(id: string): Promise<Company[]> {
    const companies = await this.getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // --- Properties ---
  async getProperties(): Promise<Property[]> {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    return raw ? JSON.parse(raw) : defaultProperties;
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const properties = await this.getProperties();
    return properties.find((p) => p.id === id);
  },

  async saveProperty(property: Property): Promise<Property[]> {
    const properties = await this.getProperties();
    const existingIndex = properties.findIndex((p) => p.id === property.id);
    if (existingIndex > -1) {
      properties[existingIndex] = property;
    } else {
      properties.push(property);
    }
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
    return properties;
  },

  async deleteProperty(id: string): Promise<Property[]> {
    const properties = await this.getProperties();
    const filtered = properties.filter((p) => p.id !== id);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // Reset helper to revert database back to original defaults
  async resetToDefaults(): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(defaultCompanies));
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(defaultProperties));
  }
};
