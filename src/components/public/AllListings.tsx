import React, { useState } from 'react';
import { ArrowLeft, Search, Building, Sparkles } from 'lucide-react';
import { Property, Category, Company, SiteSettings } from '../../types';
import PropertyCard from './PropertyCard';

interface AllListingsProps {
  properties: Property[];
  categories: Category[];
  companies: Company[];
  settings: SiteSettings;
  onSelectProperty: (id: string) => void;
  onBackToHome: () => void;
}

const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (num: number | string) => num.toString().split('').map(d => bnDigits[parseInt(d, 10)] || d).join('');

export default function AllListings({
  properties,
  categories,
  companies,
  settings,
  onSelectProperty,
  onBackToHome
}: AllListingsProps) {
  // Localized Explorer States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Unified Filter Logic
  const filtered = properties.filter((item) => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-bengali">
      
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <button 
          onClick={onBackToHome}
          className="flex items-center text-slate-350 hover:text-[#C9A84C] transition-all py-1.5 px-3.5 rounded-xl border border-[#C9A84C]/20 bg-slate-900 cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 text-white" />
          <span>হোম পেজে ফিরে যান</span>
        </button>
        
        <span className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/5 px-4.5 py-1.5 rounded-full border border-[#C9A84C]/35">
          মোট প্রকল্প সংখ্যা: {toBn(filtered.length)} টি
        </span>
      </div>

      {/* Explorer Heading */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-[#C9A84C] uppercase bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/35 inline-block">
          প্রকল্প অনুসন্ধান পোর্টাল
        </span>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C9A84C] leading-tight">
          আস্থার ঠিকানা সকল প্রকল্পসমূহ
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          আপনার বাজেট ও চাহিদামতো সেরা ও ঝামেলামুক্ত আইনি সত্যতা প্রমাণিত ডিলটি খুঁজে বের করুন।
        </p>
      </div>

      {/* Interactive Compact Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9A84C]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#05162E]/80 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
          placeholder="নির্দিষ্ট প্রজেক্ট বা এরিয়া খুঁজুন..."
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-2">
        <p className="text-left text-xs font-bold text-slate-400">ক্যাটাগরি ফিল্টার:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`rounded-md px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold shadow-sm'
                : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
            }`}
          >
            সমস্ত ক্যাটাগরি
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`rounded-md px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                selectedCategoryId === c.id
                  ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold'
                  : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Developer Filter Row */}
      <div className="space-y-2">
        <p className="text-left text-xs font-bold text-slate-400">ডেভেলপার কোম্পানি ফিল্টার:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCompanyId('all')}
            className={`rounded-md px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
              selectedCompanyId === 'all'
                ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold shadow-sm'
                : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
            }`}
          >
            সমস্ত ডেভেলপার
          </button>
          {companies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompanyId(comp.id)}
              className={`rounded-md px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                selectedCompanyId === comp.id
                  ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] font-extrabold'
                  : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
              }`}
            >
              {comp.companyName.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="pt-4">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((prop) => (
              <div key={prop.id}>
                <PropertyCard 
                  property={prop}
                  categories={categories}
                  companies={companies}
                  settings={settings}
                  onSelect={onSelectProperty}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14 bg-slate-900/40 rounded-xl border border-white/5 max-w-lg mx-auto space-y-3">
            <div className="h-10 w-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C] mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold">দুঃখিত! কোনো ম্যাচিং প্রজেক্ট পাওয়া যায়নি</p>
              <p className="text-[10px] text-slate-500">ভিন্ন ডেভেলপার অথবা ভিন্ন ক্যাটাগরি ফিল্টার ট্রাই করুন।</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="rounded bg-[#C9A84C] text-[#0A1D37] px-3.5 py-2 text-[11px] font-bold hover:bg-[#b0923f] transition-all cursor-pointer"
            >
              সমস্ত ফিল্টার রিসেট করুন
            </button>
          </div>
        )}
      </div>

    </div>
  );
}