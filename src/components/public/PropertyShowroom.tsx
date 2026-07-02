import React from 'react';
import { Building, Search } from 'lucide-react';
import { Property, Company, Category, SiteSettings } from '../../types';
import PropertyCard from './PropertyCard';

interface PropertyShowroomProps {
  filteredProperties: Property[];
  properties: Property[];
  companies: Company[];
  categories: Category[];
  settings: SiteSettings;
  selectedCompanyId: string;
  setSelectedCompanyId: (val: string) => void;
  onSelectProperty: (id: string) => void;
  onResetFilters: () => void;
  onSeeMore: () => void; // Callback to switch views
}

export default function PropertyShowroom({
  filteredProperties,
  properties,
  companies,
  categories,
  settings,
  selectedCompanyId,
  setSelectedCompanyId,
  onSelectProperty,
  onResetFilters,
  onSeeMore
}: PropertyShowroomProps) {
  
  // Limit the homepage grid display to at most 6 properties
  const displayProperties = filteredProperties.slice(0, 6);

  return (
    <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8" id="property-showroom-section">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C9A84C] font-bengali">নির্বাচিত প্রপার্টি সমূহ</h3>
          <p className="text-sm sm:text-base text-slate-300 mt-1 font-bengali">আমাদের সেরা ও জনপ্রিয় প্রপার্টি দেখুন</p>
        </div>
      </div>

      {/* Developer Company Filter Marquee */}
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
                : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
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
                    : 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
                }`}
              >
                {comp.companyName.split('(')[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Showcase Catalog Grid / Empty State */}
      <div className="space-y-5">
        {displayProperties.length > 0 ? (
          <div 
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            id="properties-grid"
          >
            {displayProperties.map((prop) => (
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
          <div 
            className="text-center py-14 bg-slate-900/40 rounded-xl border border-white/5 max-w-lg mx-auto space-y-3 text-white"
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
              onClick={onResetFilters}
              className="rounded bg-[#C9A84C] text-[#0A1D37] px-3.5 py-2 text-[11px] font-bold hover:bg-[#b0923f] transition-all cursor-pointer font-bengali"
            >
              সমস্ত ফিল্টার রিসেট করুন
            </button>
          </div>
        )}
      </div>

      {/* See More CTA - Appears only if there are more than 6 properties matching current filter */}
      {filteredProperties.length > 6 && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={onSeeMore}
            className="px-8 py-3.5 rounded-xl bg-transparent border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A1D37] font-black text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 outline-none font-sans"
          >
            আরও প্রজেক্ট দেখুন →
          </button>
        </div>
      )}

    </section>
  );
}