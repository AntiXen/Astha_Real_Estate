import React from 'react';
import { ShieldCheck, Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: 'home' | 'admin' | 'details') => void;
}

export default function Footer({ settings, onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#04152c] text-[#f3f4f6]" id="app-footer">
      <div className="border-t border-white/5 py-12 pb-6 font-bengali">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Footer Grid - Replicating Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
            
            {/* Brand/Logo Column */}
            <div className="md:col-span-12 lg:col-span-5 space-y-3.5">
              <div className="flex items-center space-x-2.5">
                <span className="text-lg font-black text-[#C9A84C] tracking-tight font-sans">Astha Real Estate</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                বাংলাদেশের অগ্রগামী বিশ্বস্ত প্রপার্টি পোর্টাল। সেরা ডেভেলপারদের প্রজেক্ট এক জায়গায়। আমাদের দক্ষ লিগ্যাল টিম দ্বারা ৪-ধাপের বিশেষ স্ক্রিনিং সম্পন্ন করা প্রজেক্ট নিয়ে আপনার ভবিষ্যৎ হোক নিরাপদ।
              </p>
            </div>

            {/* Properties Column */}
            <div className="md:col-span-6 lg:col-span-3 space-y-3.5 md:pl-8">
              <h4 className="text-white font-bold text-xs font-bengali">প্রপার্টি</h4>
              <div className="flex flex-col space-y-2 text-xs text-slate-400">
                <span className="cursor-pointer hover:text-[#C9A84C] transition-colors">ফ্ল্যাট / অ্যাপার্টমেন্ট</span>
                <span className="cursor-pointer hover:text-[#C9A84C] transition-colors">জমি / প্লট</span>
                <span className="cursor-pointer hover:text-[#C9A84C] transition-colors">কমার্শিয়াল</span>
                <span className="cursor-pointer hover:text-[#C9A84C] transition-colors">ভিলা / ডুপ্লেক্স</span>
              </div>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-6 lg:col-span-4 space-y-3.5">
              <h4 className="text-white font-bold text-xs font-bengali">যোগাযোগ</h4>
              <div className="flex flex-col space-y-2 text-xs text-slate-400">
                <a href={`tel:${settings.contactPhone}`} className="hover:text-[#C9A84C] transition-colors">
                  ফোন: {settings.contactPhone}
                </a>
                <a href={`https://wa.me/${settings.contactWhatsapp}`} target="_blank" rel="noreferrer" className="hover:text-[#C9A84C] transition-colors">
                  WhatsApp করুন
                </a>
                <a href={`mailto:${settings.email}`} className="hover:text-[#C9A84C] transition-colors">
                  ইমেইল: {settings.email}
                </a>
                <span className="text-slate-500 font-light leading-relaxed">
                  অফিস: {settings.officeAddress}
                </span>
              </div>
              
              {/* Quick hidden admin access to retain capability */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[10px] text-slate-500 hover:text-[#C9A84C] hover:underline cursor-pointer"
                  id="footer-admin-toggle"
                >
                  প্রশাসনিক এডমিন রুম
                </button>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <p>© {currentYear} Astha Real Estate — সর্বস্বত্ব সংরক্ষিত</p>
            <p className="mt-2 sm:mt-0 font-light text-slate-600">
              আইনি সত্যতা ও ১০০% ভেরিফাইড প্রজেক্টস প্ল্যাটফর্ম
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
