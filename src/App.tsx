import React, { useState, useEffect } from 'react';
import { 
  Search, Grid, Phone, MessageSquare, MapPin, Building, Briefcase, 
  HelpCircle, ShieldCheck, HelpCircle as HelpIcon, ArrowRight, Sparkles,
  ChevronDown, Star, ThumbsUp, CheckCircle2, X, Users, Globe, Layers,
  Award, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Models
import { SiteSettings, Category, Company, Property, RouteState } from './types';

// Services
import { dbService } from './services/db';

// Components
import Navbar from './components/public/Navbar';
import Footer from './components/public/Footer';
import TrustSection from './components/public/TrustSection';
import PropertyCard from './components/public/PropertyCard';
import PropertyDetailsModal from './components/public/PropertyDetailsModal';
import AdminPanel from './components/admin/AdminPanel';

const BengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliNumStr(numStr: string): string {
  return numStr.split('').map(char => {
    const parsed = parseInt(char, 10);
    return isNaN(parsed) ? char : BengaliDigits[parsed];
  }).join('');
}

interface CountUpTextProps {
  target: number;
  suffix?: string;
  duration?: number;
  isBengali?: boolean;
}

function CountUpText({ target, suffix = '', duration = 1200, isBengali = false }: CountUpTextProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!active) return;
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    return () => {
      active = false;
    };
  }, [target, duration]);

  const displayedCount = isBengali ? toBengaliNumStr(count.toString()) : count.toString();
  return <span className="tabular-nums">{displayedCount}{suffix}</span>;
}

export default function App() {
  // Database States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Navigation state
  const [viewState, setViewState] = useState<RouteState>({ page: 'home', propertyId: null });

  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');



  // Lead callback request states
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadLocation, setLeadLocation] = useState<string>('');
  const [leadBudget, setLeadBudget] = useState<string>('');
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      alert('অনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর লিখুন।');
      return;
    }
    console.log("New Callback Lead Captured:", { leadName, leadPhone, leadLocation, leadBudget, timestamp: new Date() });
    setLeadSubmitted(true);
  };

  // FAQ toggler state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Testimonial interactive states
  const [testimonialLikes, setTestimonialLikes] = useState<{ [key: number]: number }>({
    0: 18,
    1: 34,
    2: 47
  });
  const [testimonialUserHasLiked, setTestimonialUserHasLiked] = useState<{ [key: number]: boolean }>({});
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);

  // Load database entities
  const loadDatabase = async () => {
    try {
      const s = await dbService.getSettings();
      const cat = await dbService.getCategories();
      const comp = await dbService.getCompanies();
      const prop = await dbService.getProperties();

      setSettings(s);
      setCategories(cat);
      setCompanies(comp);
      setProperties(prop);
    } catch (err) {
      console.error("Database load error: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if the current path is /admin
    const pathname = window.location.pathname || '';
    if (pathname === '/admin' || pathname.endsWith('/admin')) {
      window.location.hash = 'admin';
      setViewState({ page: 'admin', propertyId: null });
    } else {
      // Proactively clear any stale property hash to avoid unwanted auto-popup on load
      if (window.location.hash.startsWith('#property-')) {
        window.location.hash = '';
      }
    }

    loadDatabase();
    
    // Hash routing support for easy VSCode/frame simulation
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setViewState({ page: 'admin', propertyId: null });
      } else {
        // Do not parse propertyId from hash anymore to prevent automatic popups
        setViewState((prev) => ({
          page: prev.page === 'admin' ? 'home' : prev.page,
          propertyId: prev.propertyId
        }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update callbacks for Admin Control Room writes
  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleUpdateCategories = async (newCats: Category[]) => {
    await dbService.saveCategories(newCats);
    setCategories(newCats);
  };

  const handleUpdateCompanies = async (newComps: Company[]) => {
    await dbService.saveCompanies(newComps);
    setCompanies(newComps);
  };

  const handleUpdateProperties = async (newProps: Property[]) => {
    await dbService.saveProperties(newProps);
    setProperties(newProps);
  };

  const handleResetDatabase = async () => {
    if (confirm('আপনি কি নিশ্চিত যে সম্পূর্ণ ডাটাবেজটি ডিফল্ট মানগুলিতে ফেরত পাঠাতে চান? এর ফলে আপনার যুক্ত করা কন্টেন্টগুলি রিসেট হয়ে যাবে।')) {
      await dbService.resetToDefaults();
      await loadDatabase();
      alert('সফলভাবে রিসেট সম্পন্ন হয়েছে!');
    }
  };

  // Safe navigation handler
  const handleNavigate = (page: 'home' | 'admin' | 'details', propertyId: string | null = null) => {
    if (page === 'admin') {
      window.location.hash = 'admin';
    } else {
      // Do not pollute hash with property selection to prevent automatic popups
      if (window.location.hash && window.location.hash !== '#admin') {
        window.location.hash = '';
      }
    }
    setViewState({ page, propertyId });
    
    // Scroll smoothly to top on navigation to clear layouts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtering Logic
  const filteredProperties = properties.filter((item) => {
    // Search query matches title, description, or location
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Category match
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;

    // Company/Developer match
    const matchesCompany = selectedCompanyId === 'all' || item.companyId === selectedCompanyId;

    return matchesSearch && matchesCategory && matchesCompany;
  });

  if (loading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05162E] font-bengali">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent mx-auto"></div>
          <p className="text-sm font-semibold text-[#D4AF37] gold-glow px-4 py-1.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider">আস্থার ঠিকানা ডাটাবেজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Pre-configured conversion links
  const defaultWhatsAppText = `আসসালামু আলাইকুম। "আস্থার ঠিকানা" প্ল্যাটফর্ম থেকে আমি আপনাদের সাথে কানেক্ট হতে চাচ্ছি। আমার কিছু লিগ্যাল প্রজেক্ট সম্পর্কে জানার আছে।`;
  const globalWhatsappUrl = `https://wa.me/${settings.contactWhatsapp}?text=${encodeURIComponent(defaultWhatsAppText)}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#05162E] text-[#f3f4f6] font-bengali antialiased relative">
      
      {/* Brand Watermark Background (Centered and Subtle) */}
      <div 
        className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden opacity-[0.08]"
        id="global-brand-watermark"
      >
        <img 
          src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
          alt="Astha Logo Watermark"
          className="w-[85vw] h-[85vw] max-w-[800px] max-h-[800px] object-contain select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* 1. Navbar */}
      {viewState.page !== 'admin' && (
        <Navbar 
          settings={settings} 
          currentView={viewState.page}
          onNavigate={(view) => handleNavigate(view)}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
      )}

      {/* 2. Workspace router */}
      <main className="flex-1">
        
        {viewState.page === 'admin' ? (
          /* ADMIN VIEW */
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
            userEmail="amitghosh.115127@gmail.com"
          />
        ) : (
          /* PUBLIC LANDING VIEW */
          <div id="landing-main-view">
            
            {/* SECTION 2: Cinematic Golden-Hour Hero Banner */}
            <section 
              className="relative overflow-hidden bg-[#0A1D37] text-white py-20 lg:py-28"
              id="hero-banner"
            >
              {/* Cinematic drone video background looping */}
              <div className="absolute inset-0 z-0">
                <video 
                  src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/Firefly_Create_an_ultra_realistic_8_second_cinematic_hero_backgr.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#05162E]/90 via-[#05162E]/65 to-[#05162E]/30"></div>
                <div className="absolute inset-0 bg-[#05162E]/15"></div>
                <div className="absolute inset-0 radial-glow opacity-50"></div>
              </div>

              {/* Banner Content Container */}
              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
                
                {/* Main Slogan Headings */}
                <div className="max-w-3xl space-y-4">
                  <motion.span 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#C9A84C] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded border border-[#C9A84C]/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>১০০% ভেরিফাইড প্রজেক্ট ও আইনি ক্লিয়ারেন্স</span>
                  </motion.span>

                  <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl text-white font-bengali"
                  >
                    {settings.bannerTitle || 'কষ্টের সঞ্চয়ে সঠিক প্রপার্টি—নিরাপদ বিনিয়োগের একমাত্র ঠিকানা।'}
                  </motion.h2>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-sm font-light text-slate-200/90 leading-relaxed"
                  >
                    {settings.bannerSubtitle || 'দেশের শীর্ষস্থানীয় ডেভেলপারদের নিখুঁত আইনি স্ক্রিনিং সম্পন্ন করা প্রজেক্ট থেকে আপনার বাজেট অনুযায়ী সেরা ড্রিম হোম বেছে নিন।'}
                  </motion.p>
                </div>

                {/* Combined Smart Search & Conversion Input Block */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="max-w-4xl bg-[#112D55] p-4.5 rounded-xl shadow-2xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-3 text-gray-200"
                  id="search-overlay-bar"
                >
                  {/* Text search */}
                  <div className="relative md:col-span-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9A84C]" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#05162E] placeholder-gray-400 rounded border border-white/10 pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-[#C9A84C] focus:outline-none text-white font-bengali"
                      placeholder="মিরপুর, গুলশান, পূর্বাচল বা উত্তরা প্রজেক্ট খুজুন..."
                    />
                  </div>

                  {/* Category Type selector */}
                  <div className="md:col-span-4">
                    <select 
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full bg-[#05162E] rounded border border-white/10 px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#C9A84C] focus:outline-none font-bold text-[#C9A84C] font-bengali"
                    >
                      <option value="all">সমস্ত ক্যাটাগরি (All Types)</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Conversion Direct CTA Button */}
                  <div className="md:col-span-3">
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="w-full h-full flex items-center justify-center space-x-1.5 rounded bg-[#C9A84C] text-[#0A1D37] hover:bg-[#b0923f] transition-all text-xs font-bold shadow cursor-pointer py-2.5 md:py-0 font-bengali"
                      title="ফ্রি সাইট ভিজিটবুক করুন"
                    >
                      <Phone className="h-4 w-4 fill-current" />
                      <span>ফ্রি সাইট ভিজিট</span>
                    </a>
                  </div>
                </motion.div>

              </div>
            </section>

            {/* SECTION 3: Trust Badges Ribbon / Quick Stats */}
            <section className="bg-white py-4.5 border-y border-slate-200/55 shadow-sm relative overflow-hidden" id="trust-ribbon">
              {/* Subtle network style dots pattern background */}
              <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:10px_10px]"></div>
              
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  {[
                    {
                      id: 0,
                      icon: Building,
                      isNumber: true,
                      target: 600,
                      suffix: "+",
                      title: "মোট প্রকল্প",
                      isBengali: true,
                    },
                    {
                      id: 1,
                      icon: Users,
                      isNumber: true,
                      target: 20,
                      suffix: "+",
                      title: "অভিজ্ঞ পরামর্শক",
                      isBengali: true,
                    },
                    {
                      id: 2,
                      icon: Layers,
                      isNumber: true,
                      target: 36,
                      suffix: "টি বিভাগ",
                      title: "স্থায়ী উন্নত সেবা",
                      isBengali: true,
                    },
                    {
                      id: 3,
                      icon: Globe,
                      isNumber: false,
                      text: "প্রবাসী সেবা",
                      title: "দেশের বাইরে সুবিধা",
                    }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-center space-x-2.5 text-left py-1 px-2"
                      >
                        <div className="p-1.5 bg-[#C9A84C]/10 text-[#b0923f] rounded-lg shrink-0">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className={`text-base sm:text-lg md:text-xl font-extrabold text-[#b0923f] leading-none flex items-center ${item.isBengali ? 'font-bengali' : 'font-sans'}`}>
                            {item.isNumber ? (
                              <CountUpText 
                                target={item.target!} 
                                suffix={item.suffix} 
                                isBengali={item.isBengali} 
                              />
                            ) : (
                              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#b0923f] via-[#C9A84C] to-[#dba828] animate-pulse font-extrabold font-bengali">
                                {item.text}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-slate-700 font-bengali mt-0.5 leading-none">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION 4: Interactive Property Category Quick Finder */}
            <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="category-quickboard">
              <div className="text-center sm:text-left">
                <h3 className="text-md sm:text-lg font-bold text-[#C9A84C] font-bengali">প্রপার্টির ধরন অনুযায়ী খুঁজুন</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">আপনার প্রোফাইল অনুযায়ী সেরা অপশন বেছে নিন</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((c, idx) => {
                  const matchedProps = properties.filter((p) => p.categoryId === c.id);
                  const isActive = selectedCategoryId === c.id;
                  const iconList = [
                    <Grid key="1" className="h-5 w-5 text-[#b0923f]" />,
                    <MapPin key="2" className="h-5 w-5 text-[#b0923f]" />,
                    <Building key="3" className="h-5 w-5 text-[#b0923f]" />,
                    <Sparkles key="4" className="h-5 w-5 text-[#b0923f]" />
                  ];
                  return (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedCategoryId(isActive ? 'all' : c.id);
                        document.getElementById('property-showroom-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`cursor-pointer bg-white p-5 rounded-lg border transition-all text-center flex flex-col items-center justify-center space-y-2 group hover:shadow-xl hover:-translate-y-0.5 ${
                        isActive 
                          ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/45 bg-amber-50/10' 
                          : 'border-slate-250/90 hover:border-[#C9A84C]'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                        isActive ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/40' : 'bg-slate-50 border border-slate-100'
                      }`}>
                        {iconList[idx % iconList.length]}
                      </div>
                      <div className="text-xs font-black text-slate-900 font-bengali">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold font-sans">{matchedProps.length} টি প্রজেক্ট লিস্টিং</div>
                    </div>
                  );
                })}
              </div>
            </section>



            {/* SECTION 6: Interactive Project Showroom (Filterable Grid) */}
            <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8" id="property-showroom-section">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C9A84C] font-bengali">নির্বাচিত প্রপার্টি সমূহ</h3>
                  <p className="text-sm sm:text-base text-slate-300 mt-1 font-bengali">আমাদের সেরা ও জনপ্রিয় প্রপার্টি দেখুন</p>
                </div>
              </div>

              {/* SECTION 7: Partner Developers Marquee Grid */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A1D37] px-5 py-4 rounded-lg border border-white/10" id="partner-marq">
                <div className="flex items-center space-x-2 text-xs sm:text-sm md:text-base font-bold font-bengali text-white/90">
                  <Building className="h-4 sm:h-5 w-4 sm:w-5 text-[#C9A84C] shrink-0" />
                  <span>ডেভেলপার কোম্পানি ফিল্টার:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCompanyId('all')}
                    className={`rounded-md px-3.5 py-2 text-xs sm:text-sm font-bold border transition-all cursor-pointer font-bengali ${
                      selectedCompanyId === 'all'
                        ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold shadow-sm'
                        : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    সমস্ত ডেভেলপার
                  </button>
                  {companies.map((comp) => {
                    const count = properties.filter((p) => p.companyId === comp.id).length;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => setSelectedCompanyId(comp.id)}
                        className={`rounded-md px-3.5 py-2 text-xs sm:text-sm font-bold border transition-all cursor-pointer font-bengali ${
                          selectedCompanyId === comp.id
                            ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold shadow-sm'
                            : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {comp.companyName.split('(')[0]} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 8: Property showcase catalog grid */}
              <div className="space-y-5">
                {filteredProperties.length > 0 ? (
                  <div 
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    id="properties-grid"
                  >
                    {filteredProperties.map((prop) => (
                      <div key={prop.id}>
                        <PropertyCard 
                          property={prop}
                          categories={categories}
                          companies={companies}
                          settings={settings}
                          onSelect={(id) => handleNavigate('home', id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center py-14 bg-slate-50 rounded-lg border border-slate-250 max-w-lg mx-auto space-y-3 text-slate-800"
                    id="empty-state-card"
                  >
                    <div className="h-10 w-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C] mx-auto">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold font-bengali">দুঃখিত! কোনো ম্যাচিং প্রজেক্ট পাওয়া যায়নি</p>
                      <p className="text-[10px] text-slate-500">ভিন্ন ডেভেলপার অথবা ভিন্ন ক্যাটাগরি ফিল্টার ট্রাই করুন।</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryId('all');
                        setSelectedCompanyId('all');
                      }}
                      className="rounded bg-[#C9A84C] text-[#0A1D37] px-3.5 py-2 text-[11px] font-bold hover:bg-[#b0923f] transition-all cursor-pointer font-bengali"
                    >
                      সমস্ত ফিল্টার রিসেট করুন
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 9: Bengali Homeowners Testimonials */}
            <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="testimonials">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-[#C9A84C] uppercase bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/35 inline-block font-bengali">
                  গ্রাহক সন্তুষ্টি আমাদের মূল লক্ষ্য
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C9A84C] font-bengali leading-tight">
                  আস্থা ও ভালোবাসায় আমাদের গ্রাহক পরিবার
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-bengali max-w-2xl mx-auto leading-relaxed">
                  নিরাপদ ও ঝামেলামুক্ত উপায়ে ডিল সম্পন্ন করে যারা আস্থার ঠিকানা খুঁজে পেয়েছে, শুনুন তাদের বাস্তব অভিজ্ঞতা
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    id: 0,
                    quote: "দলিলপত্র নিয়ে আমার মনে যে দুশ্চিন্তা ছিল তা আস্থার ঠিকানার লিগ্যাল টিম এসে দূর করে দিয়েছে। ইস্টার্ন হাউজিং এর প্রজেক্টটিতে সরাসরি মালিকানার ধারাবাহিক দলিল মিলিয়ে নির্ভয়ে বুকিং দিতে পেরেছি।",
                    name: "মোস্তাফা জামান রাজু",
                    role: "আবাসিক ক্রেতা, মিরপুর",
                    initial: "এম",
                    rating: 5,
                    story: "মোস্তাফা জামান রাজু মিরপুর ১২-তে একটি লাক্সারি অ্যাপার্টমেন্ট কিনতে গিয়ে দলিলের ধারাবাহিকতা ও মিউটেশন নিয়ে বেশ চিন্তিত ছিলেন। আস্থার ঠিকানার এক্সপার্ট লিগ্যাল টিম সমস্ত ভায়া দলিল, জোত খতিয়ান এবং নামজারি পুঙ্খানুপুঙ্খভাবে যাচাই করে সঠিক রিপোর্ট প্রদান করেন। এরপরই তিনি শতভাগ নিশ্চিন্তে বুকিং সম্পন্ন করে নিজের স্থায়ী ফ্ল্যাটের আইনি নিরাপত্তা নিশ্চিত করেন।",
                    verifiedFeatures: ["ভায়া দলিল চেইন চেক সফল", "নামজারি খতিয়ান ভেরিফিকেশন", "রাজউক লে-আউট প্ল্যান অনুমোদন"]
                  },
                  {
                    id: 1,
                    quote: "একজন প্রবাসী হিসেবে বাংলাদেশ প্রপার্টি কেনা আমার কাছে সবসময় ঝুঁকিপূর্ণ মনে হতো। কিন্তু আস্থা রীয়াল এস্টেট আমার সাব-রেজিস্ট্রি এবং নামজারি কাজ সম্পূর্ণ স্বচ্ছতার সাথে সম্পন্ন করে দিয়েছে।",
                    name: "কামরুল আহসান চৌধুরী",
                    role: "লন্ডন প্রবাসী, সিলেট প্রবাসী জোন",
                    initial: "ক",
                    rating: 5,
                    story: "লন্ডন প্রবাসী কামরুল আহসান চৌধুরী দূর প্রবাসে থাকায় বাংলাদেশে রিয়েল এস্টেট বিনিয়োগ নিয়ে আস্থাহীনতায় ভুগছিলেন। আমাদের মাধ্যমে তিনি প্রপার্টির ভিডিও বুকিং থেকে শুরু করে আমমোক্তারনামা এবং সর্বশেষ সাব-রেজিস্ট্রির পুরো প্রক্রিয়া ডিজিটাল ট্র্যাকিং ও আইনি সহায়তার মাধ্যমে সম্পন্ন করেছেন, যাতে তার ১ টাকাও ক্ষতি হয়নি।",
                    verifiedFeatures: ["অনলাইন জুম লাইভ সাইট ভিজিট", "পাওয়ার অব অ্যাটর্নি আইনি স্ক্রুটিনি", "ঝুঁকিমুক্ত রেজিস্ট্রি দলিল সম্পাদন"]
                  },
                  {
                    id: 2,
                    quote: "কোন প্রকার হিডেন চার্জ ছাড়াই সরাসরি এজেন্সির মূল্যে গ্রিন ভ্যালি কমার্শিয়ালের ৩টি অফিস ফ্লোর কিনে আমাদের কর্পোরেট ব্যবসা সম্প্রসারণ সহজে করতে পেরেছি।",
                    name: "ড. জেেস্মন আক্তার",
                    role: "ম্যানেজিং ডিরেক্টর, বায়োফাইন বাংলাদেশ",
                    initial: "জে",
                    rating: 5,
                    story: "বায়োফাইন বাংলাদেশের ব্যবসা সম্প্রসারণের জন্য গুলশানে কমার্শিয়াল স্পেসের খোঁজ করছিলেন ড. জেসমিন আক্তার। আস্থার ঠিকানা কোনো অতিরিক্ত ফিজিক্যাল ব্রোকারেজ ফি বা মধ্যস্থতাকারী চার্জ ছাড়াই সরাসরি ডেভেলপার কোম্পানির অফিশিয়াল কর্পোরেট ডিসকাউন্টে ৩টি ফ্লোরের ডিলটি স্বচ্ছ আইনি প্রক্রিয়ায় করিয়ে দেয়।",
                    verifiedFeatures: ["০% গোপন ব্রোকারেজ ফি গ্যারান্টি", "কমার্শিয়াল ইউটিলিটি নকশা যাচাই", "সরাসরি ডেভলপার কর্পোরেট এগ্রিমেন্ট"]
                  }
                ].map((item) => {
                  const hasLiked = !!testimonialUserHasLiked[item.id];
                  const likesCount = testimonialLikes[item.id] || 0;

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedTestimonial(item)}
                      className="group relative bg-[#071930] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:border-[#C9A84C]/40 transition-all duration-300 text-left flex flex-col justify-between space-y-4 cursor-pointer transform hover:-translate-y-1"
                    >
                      {/* Interactive Highlight Border Top */}
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>

                      <div className="space-y-3">
                        {/* Rating Stars */}
                        <div className="flex items-center space-x-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-[#C9A84C] fill-[#C9A84C]" />
                          ))}
                        </div>

                        {/* Large Quote Content */}
                        <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-bengali font-semibold group-hover:text-white transition-colors duration-200">
                          "{item.quote}"
                        </p>

                        <button 
                          className="pt-1 text-[#C9A84C] text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 hover:underline font-bengali"
                        >
                          <span>বিস্তারিত কেস স্টাডি দেখুন</span>
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </div>

                      <div className="border-t border-white/5 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* User Profile */}
                        <div className="flex items-center space-x-2.5">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a38435] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center font-sans shadow-md ring-2 ring-white/10">
                            {item.initial}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white font-bengali tracking-wide">{item.name}</div>
                            <div className="text-[10px] sm:text-xs text-[#C9A84C] font-semibold font-bengali mt-0.5">{item.role}</div>
                          </div>
                        </div>

                        {/* Live Helpful Counter */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setTestimonialLikes(prev => ({
                              ...prev,
                              [item.id]: hasLiked ? prev[item.id] - 1 : prev[item.id] + 1
                            }));
                            setTestimonialUserHasLiked(prev => ({
                              ...prev,
                              [item.id]: !hasLiked
                            }));
                          }}
                          className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                            hasLiked 
                              ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] scale-102 shadow-md' 
                              : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white hover:border-[#C9A84C]/30'
                          }`}
                          title="এই রিভিউটি সহায়ক মনে হলে লাইক দিন"
                        >
                          <ThumbsUp className={`h-3 w-3 shrink-0 transition-transform ${hasLiked ? 'fill-[#0A1D37] scale-110' : 'group-hover:scale-110'}`} />
                          <span className="text-[10px] font-bold font-bengali">সহায়ক ({likesCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Testimonials Detail case-study Modal */}
            <AnimatePresence>
              {selectedTestimonial && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                  onClick={() => setSelectedTestimonial(null)}
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-[#071930] w-full max-w-2xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                  >
                    {/* Close Button */}
                    <button 
                      onClick={() => setSelectedTestimonial(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="space-y-6">
                      {/* Modal Header */}
                      <div className="flex items-center space-x-1">
                        {[...Array(selectedTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-[#C9A84C] fill-[#C9A84C]" />
                        ))}
                      </div>

                      {/* Header Title */}
                      <div className="space-y-2 text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded">সাকসেস স্টোরি কেস স্টাডি</span>
                        <h4 className="text-xl sm:text-2xl font-black text-white font-bengali leading-snug mt-1">
                          "{selectedTestimonial.quote}"
                        </h4>
                      </div>

                      {/* Customer Review Profile */}
                      <div className="flex items-center space-x-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a38435] text-white text-base font-extrabold flex items-center justify-center font-sans tracking-tight">
                          {selectedTestimonial.initial}
                        </div>
                        <div className="text-left">
                          <h5 className="text-base sm:text-md font-bold text-white font-bengali">{selectedTestimonial.name}</h5>
                          <p className="text-xs sm:text-xs text-[#C9A84C] font-semibold font-bengali">{selectedTestimonial.role}</p>
                        </div>
                      </div>

                      {/* Detailed Story Narrative */}
                      <div className="space-y-3.5 text-left font-bengali">
                        <h6 className="text-[#C9A84C] text-sm sm:text-base font-bold">আস্থার ঠিকানার মাধ্যমে আইনি সত্যতা যাচাই:</h6>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                          {selectedTestimonial.story}
                        </p>
                      </div>

                      {/* Verified Checklist */}
                      <div className="space-y-3 pt-2 text-left font-bengali border-t border-white/10">
                        <h6 className="text-[#C9A84C] text-sm sm:text-base font-bold">আমাদের ভেরিফিকেশন পদক্ষেপের তালিকা:</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedTestimonial.verifiedFeatures.map((feat: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Call-to-action button inside modal */}
                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={() => {
                            setSelectedTestimonial(null);
                            setTimeout(() => {
                              document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                            }, 150);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A1D37] text-sm font-bold font-bengali hover:bg-[#b0923f] transition-all cursor-pointer text-center"
                        >
                          বিনামূল্যে আইনি পরামর্শ নিন
                        </button>
                      </div>

                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* SECTION 10: Exclusive Lead Capture Call-Back Request Form */}
            <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="lead-form">
              <div className="bg-slate-900 rounded-xl border border-white/10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
                
                <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#C9A84C] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded border border-[#C9A84C]/30">
                    <Phone className="h-4 w-4" />
                    <span>ইন্সট্যান্ট কল ব্যাক</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-bengali mt-1">আপনার স্বপ্নের বাড়ির জন্য ২৫ মিনিট কন্সালটেশন ফ্রি!</h3>
                  <p className="text-xs text-[#C9A84C] font-bold font-bengali">আপনার এলাকা, বাজেট ও চাহিদা লিখে রাখুন</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-bengali">
                    আজই আমাদের কাস্টমার সাকসেস টিমের অভিজ্ঞ প্রপার্টি স্পেশালিস্টদের সাথে সরাসরি যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে ১০০% ভেরিফাইড প্রজেক্টের নথিপত্র সহ আপনাকে কল দিয়ে সাহায্য করব।
                  </p>
                </div>

                <div className="lg:col-span-7 bg-slate-950 p-6 rounded-lg border border-white/5 shadow-inner">
                  {leadSubmitted ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="h-10 w-10 text-emerald-400 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#C9A84C] font-bengali">ধন্যবাদ! আপনার কল ব্যাক রিকোয়েস্ট সফল হয়েছে।</h4>
                        <p className="text-[10px] text-slate-300 mt-1 font-bengali">আমাদের ড্রিম হোম অফিসার খুব শীঘ্রই আপনার {leadPhone} নম্বরে সরাসরি কল করবেন।</p>
                      </div>
                      <button 
                        onClick={() => setLeadSubmitted(false)}
                        className="text-[10px] text-[#C9A84C] font-semibold hover:underline font-bengali"
                      >
                        অন্য আরেকটি রিকোয়েস্ট তৈরি করুন
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] text-slate-300 font-semibold font-bengali">আপনার নাম *</label>
                          <input 
                            required
                            type="text" 
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
                            placeholder="যেমন: এম ডি সাজিদ"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] text-slate-300 font-semibold font-bengali">মোবাইল নম্বর *</label>
                          <input 
                            required
                            type="tel" 
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
                            placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] text-slate-300 font-semibold font-bengali">পছন্দের এলাকা</label>
                          <input 
                            type="text" 
                            value={leadLocation}
                            onChange={(e) => setLeadLocation(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
                            placeholder="যেমন: ধানমন্ডি"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] text-slate-300 font-semibold font-bengali">আনুমানিক বাজেট (লাখ/কোটি টাকা)</label>
                          <input 
                            type="text" 
                            value={leadBudget}
                            onChange={(e) => setLeadBudget(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
                            placeholder="যেমন: ৬০ লাখ টাকা"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#C9A84C] text-[#0A1D37] hover:bg-[#b0923f] transition-all py-2 rounded text-xs font-bold cursor-pointer font-bengali"
                      >
                        অনুরোধ পাঠান (Request Call Back)
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </section>

            {/* SECTION 11: Astha FAQ Dropdown Accordion */}
            <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="faq-accordion">
              <div className="text-center sm:text-left pb-2">
                <h3 className="text-md sm:text-lg font-bold text-[#C9A84C] font-bengali">জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">সাধারণ কিছু প্রশ্ন ও তাদের উত্তর</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-3">
                  {[
                    {
                      q: "প্রপার্টি কেনার জন্য কি কি ডকুমেন্ট লাগে?",
                      a: "প্রপার্টি কেনার ক্ষেত্রে সাধারণত জাতীয় পরিচয়পত্র (NID), পাসপোর্ট সাইজ ছবি, আয়ের উৎস প্রমাণকারী ডকুমেন্ট (যেমন পে-স্লিপ বা ব্যাংক বিবরণী), এবং কর পরিশোধ সনদ (TIN) প্রয়োজন হয়।"
                    },
                    {
                      q: "বুকিং বা রেজিস্ট্রেশনের প্রক্রিয়া কেমন?",
                      a: "পছন্দের প্রপার্টি বুকিংয়ের জন্য আবেদনপত্রের সাথে বায়নার টাকা (বুকিং মানি) প্রদান করতে হয়। পরবর্তীতে চুক্তিনামা সম্পাদন করে সিডিউল অনুযায়ী ডাউনপেমেন্ট ও কিস্তির টাকা শোধ করার পর রেজিস্ট্রেশন সম্পন্ন হয়।"
                    },
                    {
                      q: "অ্যাডভান্স দেওয়ার পর বাতিল করলে টাকা ফেরত পাবো?",
                      a: "হ্যাঁ, বুকিং বা অ্যাডভান্স দেওয়ার পর কোনো কারণে বাতিল করতে চাইলে চুক্তিনামায় উল্লিখিত নির্দিষ্ট নিয়মাবলি ও রিফান্ড পলিসি অনুযায়ী একটি নির্দিষ্ট সময়ের মধ্যে আবেদন পেন্ডিং ফি বাদে মূল টাকা অফিশিয়ালি ফেরত পাওয়া যায়।"
                    }
                  ].map((item, index) => {
                    const actualIndex = index;
                    const isOpen = openFaqIndex === actualIndex;
                    return (
                      <div 
                        key={actualIndex} 
                        className="bg-[#0A1D37]/45 border border-white/10 rounded overflow-hidden transition-all hover:border-[#C9A84C]/30"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : actualIndex)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-white hover:text-[#C9A84C] transition-colors"
                        >
                          <span className="font-bengali text-left">{item.q}</span>
                          <ChevronDown className={"h-4 w-4 shrink-0 text-[#C9A84C] transition-transform " + (isOpen ? "rotate-180" : "")} />
                        </button>
                        
                        {isOpen && (
                          <div className="p-4 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-white/5 font-bengali">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  {[
                    {
                      q: "আমাদের মাধ্যমে প্রপার্টি কেনার সুবিধা কী?",
                      a: "আমাদের প্ল্যাটফর্মের প্রতিটি প্রজেক্ট বিশেষজ্ঞদের দ্বারা ৪-ধাপের আইনি ও আইডিয়াল ধারাবাহিকতা পরীক্ষা করা থাকে। কোনো হিডেন মামলা, ভুয়া দলিল বা সরকারি খাস জমি সংক্রান্ত ঝামেলা থাকে না।"
                    },
                    {
                      q: "কিস্তি বা EMI সুবিধা আছে কি?",
                      a: "হ্যাঁ, আমাদের বেশিরভাগ রেডি ও আন্ডার-কনস্ট্রাকশন প্রজেক্টে ডেভেলপার কোম্পানির নিজস্ব নমনীয় কিস্তি সুবিধা রয়েছে। এছাড়া অংশীদার ব্যাংক বা আর্থিক প্রতিষ্ঠানগুলোর মাধ্যমে হোম লোন বা সুদমুক্ত সর্বোচ্চ কিস্তির সুবিধাও পাওয়া সম্ভব।"
                    },
                    {
                      q: "আপনাদের অফিস কোথায়?",
                      a: "আমাদের প্রধান কার্যালয় এবং কাস্টমার সাপোর্ট কেয়ার সেন্টার ঢাকার গুলশানে অবস্থিত। এছাড়া সিলেট ও চট্টগ্রাম রিজিওনে আমাদের রিজিওনাল সাপোর্ট বা পার্টনার অফিস রয়েছে। সরাসরি সাক্ষাতের জন্য যোগাযোগ বাটনে ক্লিক করে বুকিং দিন।"
                    }
                  ].map((item, index) => {
                    const actualIndex = index + 3;
                    const isOpen = openFaqIndex === actualIndex;
                    return (
                      <div 
                        key={actualIndex} 
                        className="bg-[#0A1D37]/45 border border-white/10 rounded overflow-hidden transition-all hover:border-[#C9A84C]/30"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : actualIndex)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-white hover:text-[#C9A84C] transition-colors"
                        >
                          <span className="font-bengali text-left">{item.q}</span>
                          <ChevronDown className={"h-4 w-4 shrink-0 text-[#C9A84C] transition-transform " + (isOpen ? "rotate-180" : "")} />
                        </button>
                        
                        {isOpen && (
                          <div className="p-4 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-white/5 font-bengali">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* 5. Footer */}
      {viewState.page !== 'admin' && (
        <Footer 
          settings={settings} 
          onNavigate={(view) => handleNavigate(view)}
        />
      )}

      {/* GLOBAL PERSISTENT CONVERSION TRIGGERS - FLOATING ACTION BUTTONS (BOTTOM RIGHT) */}
      {viewState.page !== 'admin' && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3" id="global-floating-ctas">
          
          {/* Glow Direct Call Button */}
          <a
            href={`tel:${settings.contactPhone}`}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-slate-800 text-brand-gold-500 hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-center border-2 border-brand-gold-500/20"
            title="আমাদের সরাসরি ফোন করুন"
            id="floating-phone-btn"
          >
            <Phone className="h-6 w-6 fill-brand-gold-500/10" />
          </a>

          {/* Dynamic WhatsApp Trigger */}
          <a
            href={globalWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all border-2 border-emerald-500/20 active:scale-95 animate-bounce-custom"
            title="হোয়াটসঅ্যাপে ফ্রি কনসালটেন্ট সাপোর্ট পান"
            id="floating-whatsapp-btn"
          >
            <MessageSquare className="h-6 w-6 fill-white text-emerald-600" />
          </a>

        </div>
      )}

      {/* 6. IMMERSIVE PROPERTY FULL DETAILS OVERLAY MODAL */}
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
