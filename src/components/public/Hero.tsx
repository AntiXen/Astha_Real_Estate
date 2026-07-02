import React from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Phone } from 'lucide-react';
import { SiteSettings, Category } from '../../types';

interface HeroProps {
  settings: SiteSettings;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (val: string) => void;
  categories: Category[];
}

export default function Hero({
  settings,
  searchQuery,
  setSearchQuery,
  selectedCategoryId,
  setSelectedCategoryId,
  categories
}: HeroProps) {
  return (
    <section 
      className="relative overflow-hidden bg-[#0A1D37] text-white py-20 lg:py-28"
      id="hero-banner"
    >
      {/* Loop background video */}
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
        
        {/* Texts */}
        <div className="max-w-3xl space-y-4 text-left">
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

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="max-w-4xl bg-[#112D55] p-4.5 rounded-xl shadow-2xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-3 text-gray-200"
          id="search-overlay-bar"
        >
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

          <div className="md:col-span-4">
            <select 
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-[#05162E] rounded border border-white/10 px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#C9A84C] focus:outline-none font-bold text-[#C9A84C] font-bengali"
            >
              <option value="all">সমস্ত ক্যাটাগরি (All Types)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <a
              href={`tel:${settings.contactPhone}`}
              className="w-full h-full flex items-center justify-center space-x-1.5 rounded bg-[#C9A84C] text-[#0A1D37] hover:bg-[#b0923f] transition-all text-xs font-bold shadow cursor-pointer py-2.5 md:py-0 font-bengali"
              title="ফ্রি সাইট ভিজিট বুক করুন"
            >
              <Phone className="h-4 w-4 fill-current" />
              <span>ফ্রি সাইট ভিজিট</span>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}