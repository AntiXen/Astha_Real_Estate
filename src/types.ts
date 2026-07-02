/**
 * Types and schema definitions for Asthar Thikana real estate aggregator.
 */

export interface SiteSettings {
  id: string;
  logoText: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImage: string;
  contactPhone: string;
  contactWhatsapp: string;
  officeAddress: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string; // e.g., 'land', 'flat', 'plot', 'project-share'
}

export interface Company {
  id: string;
  companyName: string;
  logoUrl: string;
  established: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string; // in BDT (Lac, Crore, or Per Katha)
  location: string;
  categoryId: string;
  companyId: string;
  images: string[];
  isFeatured: boolean;
  status: string; // Available, Sold Out, or Urgency tag like 'মাত্র ৩টি প্লট বাকি!'
  bedrooms?: number;
  bathrooms?: number;
  size?: number; // Sq. Ft. or Katha
  facing?: string; // South, North-East, East
  videoUrl?: string; // Optional embedded or local dataURL MP4 video
}

// Added real Inquiry interface for Lead Capture
export interface Inquiry {
  id: string;
  name: string;
  category: string;
  location: string;
  budget: string;
  phone: string;
  message?: string;
  status: 'new' | 'read';
  created_at?: string;
}

export interface RouteState {
  page: 'home' | 'admin' | 'details' | 'listings'; // Added 'listings' page
  propertyId: string | null;
}