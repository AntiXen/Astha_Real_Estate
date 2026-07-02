import React from 'react';
import { SiteSettings, Category } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[]; // To map categories dynamically
  setSelectedCategoryId?: (id: string) => void; // To set category filter on-click
  onNavigate: (view: 'home' | 'admin' | 'details' | 'listings') => void; // Support 'listings' type
}

export default function Footer({ settings, categories, setSelectedCategoryId, onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200" id="app-footer">
      <div className="py-12 pb-6 font-bengali">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
            
            {/* Brand/Logo Column */}
            <div className="md:col-span-12 lg:col-span-5 space-y-4">
              <div className="flex items-center">
                {/* Wrapped logo in a deep navy badge to prevent white-on-white text invisibility */}
                <div className="bg-[#0B2545] p-3 px-4.5 rounded-2xl shadow-sm inline-flex items-center justify-center">
                  <img 
                    src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
                    alt="Astha Real Estate"
                    className="h-11 w-auto object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 font-medium">
                বাংলাদেশের অগ্রগামী বিশ্বস্ত প্রপার্টি পোর্টাল। সেরা ডেভেলপারদের প্রজেক্ট এক জায়গায়। আমাদের দক্ষ লিগ্যাল টিম দ্বারা ৪-ধাপের বিশেষ স্ক্রিনিং সম্পন্ন করা প্রজেক্ট নিয়ে আপনার ভবিষ্যৎ হোক নিরাপদ।
              </p>
            </div>

            {/* Properties Column */}
            <div className="md:col-span-6 lg:col-span-3 space-y-3.5 md:pl-8">
              <h4 className="text-[#0B2545] font-black text-sm font-bengali uppercase tracking-wider">প্রপার্টি</h4>
              <div className="flex flex-col space-y-2.5 text-xs font-semibold">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (setSelectedCategoryId) {
                        setSelectedCategoryId(cat.id);
                      }
                      onNavigate('listings');
                    }}
                    className="text-left cursor-pointer text-slate-500 hover:text-[#b0923f] transition-colors focus:outline-none bg-transparent border-none p-0 font-bold"
                  >
                    {cat.name === 'জমি / প্লট' ? 'জমি / প্লট' : cat.name === 'ফ্ল্যাট' ? 'ফ্ল্যাট / অ্যাপার্টমেন্ট' : cat.name === 'কমার্শিয়াল' ? 'কমার্শিয়াল স্পেস' : cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-6 lg:col-span-4 space-y-3.5">
              <h4 className="text-[#0B2545] font-black text-sm font-bengali uppercase tracking-wider">যোগাযোগ</h4>
              <div className="flex flex-col space-y-2.5 text-xs text-slate-500 font-semibold">
                <a href={`tel:${settings.contactPhone}`} className="hover:text-[#b0923f] transition-colors">
                  ফোন: {settings.contactPhone}
                </a>
                <a href={`https://wa.me/${settings.contactWhatsapp}`} target="_blank" rel="noreferrer" className="hover:text-[#b0923f] transition-colors">
                  WhatsApp করুন
                </a>
                <a href={`mailto:${settings.email}`} className="hover:text-[#b0923f] transition-colors">
                  ইমেইল: {settings.email}
                </a>
                <span className="text-slate-400 font-normal leading-relaxed">
                  অফিস: {settings.officeAddress}
                </span>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
            <p>© {currentYear} Astha Real Estate — সর্বস্বত্ব সংরক্ষিত</p>
            <p className="mt-2 sm:mt-0 font-normal text-slate-400">
              আইনি সত্যতা ও ১০০% ভেরিফাইড প্রজেক্টস প্ল্যাটফর্ম
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}