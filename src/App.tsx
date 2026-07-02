import React, { useState, useEffect } from 'react';

// Models
import { SiteSettings, Category, Company, Property, RouteState } from './types';

// Services
import { dbService } from './services/db';

// Validation Utilities
import { isValidBDPhoneNumber, normalizeBDPhoneNumber, sanitizeInput } from './utils/validation';

// Public Shared Components
import Navbar from './components/public/Navbar';
import Footer from './components/public/Footer';
import TrustSection from './components/public/TrustSection';
import PropertyDetailsModal from './components/public/PropertyDetailsModal';
import AdminPanel from './components/admin/AdminPanel';

// Newly Modularized Storefront Components
import Hero from './components/public/Hero';
import QuickStats from './components/public/QuickStats';
import CategoryQuickBoard from './components/public/CategoryQuickBoard';
import PropertyShowroom from './components/public/PropertyShowroom';
import Testimonials from './components/public/Testimonials';
import LeadForm from './components/public/LeadForm';
import FaqAccordion from './components/public/FaqAccordion';
import FloatingCtas from './components/public/FloatingCtas';

export default function App() {
  // Database States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Navigation State
  const [viewState, setViewState] = useState<RouteState>({ page: 'home', propertyId: null });

  // Filtering States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Load Database entities on-the-fly.
  // This ensures a single failing table doesn't block the rest of the application.
  const loadDatabase = async () => {
    setLoadError(null);
    try {
      await dbService.initialize();
    } catch (err) {
      console.error('Database initialization skipped/failed:', err);
    }

    try {
      const s = await dbService.getSettings();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setLoadError('সাইট সেটিংস লোড করা যায়নি। আবার চেষ্টা করুন।');
    }

    try {
      const cat = await dbService.getCategories();
      setCategories(cat);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }

    try {
      const comp = await dbService.getCompanies();
      setCompanies(comp);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }

    try {
      const prop = await dbService.getProperties();
      setProperties(prop);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setLoadError((prev) => prev ?? 'প্রপার্টি লোড করা যায়নি। আবার চেষ্টা করুন।');
    }

    setLoading(false);
  };

  useEffect(() => {
    const pathname = window.location.pathname || '';
    if (pathname === '/admin' || pathname.endsWith('/admin')) {
      window.location.hash = 'admin';
      setViewState({ page: 'admin', propertyId: null });
    } else {
      if (window.location.hash.startsWith('#property-')) {
        window.location.hash = '';
      }
    }

    loadDatabase();
    
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setViewState({ page: 'admin', propertyId: null });
      } else {
        setViewState((prev) => ({
          page: prev.page === 'admin' ? 'home' : prev.page,
          propertyId: prev.propertyId
        }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Secure state updaters with error boundaries
  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    try {
      await dbService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err: any) {
      alert(`সেটিংস সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}`);
    }
  };

  const handleUpdateCategories = async (newCats: Category[]) => {
    try {
      await dbService.saveCategories(newCats);
      setCategories(newCats);
    } catch (err: any) {
      alert(`ক্যাটাগরি সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}`);
    }
  };

  const handleUpdateCompanies = async (newComps: Company[]) => {
    try {
      await dbService.saveCompanies(newComps);
      setCompanies(newComps);
    } catch (err: any) {
      alert(`কোম্পানি সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}`);
    }
  };

  const handleUpdateProperties = async (newProps: Property[]) => {
    try {
      await dbService.saveProperties(newProps);
      setProperties(newProps);
    } catch (err: any) {
      alert(`প্রপার্টি সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}`);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('আপনি কি নিশ্চিত যে সম্পূর্ণ ডাটাবেজটি ডিফল্ট মানগুলিতে ফেরত পাঠাতে চান? এর ফলে আপনার যুক্ত করা কন্টেন্টগুলি রিসেট হয়ে যাবে।')) {
      try {
        await dbService.resetToDefaults();
        await loadDatabase();
        alert('সফলভাবে রিসেট সম্পন্ন হয়েছে!');
      } catch (err: any) {
        alert(`সিস্টেম রিসেট ব্যর্থ হয়েছে: ${err.message}`);
      }
    }
  };

  const handleNavigate = (page: 'home' | 'admin' | 'details', propertyId: string | null = null) => {
    if (page === 'admin') {
      window.location.hash = 'admin';
    } else {
      if (window.location.hash && window.location.hash !== '#admin') {
        window.location.hash = '';
      }
    }
    setViewState({ page, propertyId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Logic
  const activeCategoryName = selectedCategoryId !== 'all' 
    ? categories.find(c => c.id === selectedCategoryId)?.name || 'যেকোনো'
    : 'যেকোনো';

  const filteredProperties = properties.filter((item) => {
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesCompany = selectedCompanyId === 'all' || item.companyId === selectedCompanyId;

    return matchesSearch && matchesCategory && matchesCompany;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSelectedCompanyId('all');
  };

  const scrollToLeadForm = () => {
    const element = document.getElementById('lead-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05162E] font-bengali">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent mx-auto"></div>
          <p className="text-sm font-semibold text-[#D4AF37] gold-glow px-4 py-1.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider">আস্থার ঠিকানা ডাটাবেজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05162E] font-bengali">
        <div className="text-center space-y-4 max-w-sm px-4">
          <p className="text-sm font-semibold text-red-400 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            {loadError || 'সাইট লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'}
          </p>
          <button
            onClick={() => { setLoading(true); loadDatabase(); }}
            className="px-5 py-2 rounded-full bg-[#D4AF37] text-[#05162E] font-semibold text-sm hover:opacity-90 transition"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05162E] text-[#f3f4f6] font-bengali antialiased relative">
      
      {/* Global Astha Logo Background Watermark */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden opacity-[0.08]" id="global-brand-watermark">
        <img 
          src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
          alt="Astha Logo Watermark"
          className="w-[85vw] h-[85vw] max-w-[800px] max-h-[800px] object-contain select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Navbar (Common) */}
      {viewState.page !== 'admin' && (
        <Navbar 
          settings={settings} 
          currentView={viewState.page}
          onNavigate={(view) => handleNavigate(view)}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
      )}

      {/* Main Routed Canvas */}
      <main className="flex-1 z-10 relative">
        {viewState.page === 'admin' ? (
          <AdminPanel 
            settings={settings}
            categories={categories}
            companies={companies}
            properties={properties}
            onUpdateSettings={handleUpdateSettings}
            onUpdateCategories={handleUpdateCategories}
            onUpdateCompanies={handleUpdateCompanies}
            onUpdateProperties={handleUpdateProperties}
            onResetDatabase={handleResetDatabase}
            userEmail=""
          />
        ) : (
          <div id="landing-main-view">
            {/* 1. Hero Banner */}
            <Hero 
              settings={settings}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              categories={categories}
            />

            {/* 2. Count-Up Stats Ribbon */}
            <QuickStats />

            {/* 3. Category Finder Board */}
            <CategoryQuickBoard 
              categories={categories}
              properties={properties}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
            />

            {/* 4. Core Trust Pillars Section */}
            <TrustSection />

            {/* 5. Filterable Property Showcase Showroom */}
            <PropertyShowroom 
              filteredProperties={filteredProperties}
              properties={properties}
              companies={companies}
              categories={categories}
              settings={settings}
              selectedCompanyId={selectedCompanyId}
              setSelectedCompanyId={setSelectedCompanyId}
              onSelectProperty={(id) => handleNavigate('home', id)}
              onResetFilters={handleResetFilters}
            />

            {/* 6. Customer Testimonials & Modal case studies */}
            <Testimonials onScrollToLeadForm={scrollToLeadForm} />

            {/* 7. Conversion callback form */}
            <LeadForm activeCategoryName={activeCategoryName} />

            {/* 8. Collapsible FAQ Accordion panel */}
            <FaqAccordion />
          </div>
        )}
      </main>

      {/* Footer (Common) */}
      {viewState.page !== 'admin' && (
        <Footer 
          settings={settings} 
          onNavigate={(view) => handleNavigate(view)}
        />
      )}

      {/* Global persistent WhatsApp & Phone floating widgets */}
      {viewState.page !== 'admin' && (
        <FloatingCtas settings={settings} />
      )}

      {/* Property detailed full modal drawer overlay */}
      {viewState.propertyId && (
        <PropertyDetailsModal 
          propertyId={viewState.propertyId}
          properties={properties}
          categories={categories}
          companies={companies}
          settings={settings}
          onClose={() => handleNavigate('home', null)}
        />
      )}
    </div>
  );
}