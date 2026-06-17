import React from 'react';
import { Phone, MessageSquare, ShieldCheck, Settings, BookOpen } from 'lucide-react';
import { SiteSettings } from '../../types';

interface NavbarProps {
  settings: SiteSettings;
  currentView: 'home' | 'admin' | 'details';
  onNavigate: (view: 'home' | 'admin' | 'details') => void;
  onFilterCategory?: (categoryName: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

export default function Navbar({ settings, currentView, onNavigate, onFilterCategory, onScrollTo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm font-bengali" id="app-header">
      <div className="mx-auto flex h-22 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => {
            if (onFilterCategory) onFilterCategory('all');
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className="group flex items-center text-left focus:outline-none cursor-pointer py-1"
          id="nav-logo-btn"
        >
          <img 
            src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
            alt="Astha Real Estate"
            className="h-16 sm:h-18 md:h-19 w-auto object-contain select-none transition-all duration-300 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Navigation Links in the Middle (Mockup Replicated!) */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-bold" id="nav-middle-links">
          <button 
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-slate-800 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            হোম
          </button>
          <button 
            onClick={() => {
              if (onFilterCategory) onFilterCategory('জমি');
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('property-showroom-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="text-slate-700 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            জমি
          </button>
          <button 
            onClick={() => {
              if (onFilterCategory) onFilterCategory('ফ্ল্যাট');
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('property-showroom-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="text-slate-700 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            অ্যাপার্টমেন্ট
          </button>
          <button 
            onClick={() => {
              if (onFilterCategory) onFilterCategory('all');
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('property-showroom-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="text-slate-700 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            প্রকল্প
          </button>
          <button 
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="text-slate-700 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            প্রতিনিধিত্ব
          </button>
          <button 
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="text-slate-700 hover:text-[#b0923f] transition-all cursor-pointer font-bold py-1"
          >
            যোগাযোগ
          </button>
        </nav>

        {/* Action Widgets */}
        <div className="flex items-center space-x-3">
          
          {/* Phone Call CTA - Replicated style from screenshot: 📞 ০১৭১২-৩৪৫৬৭৮ */}
          <a
            href={`tel:${settings.contactPhone}`}
            className="hidden sm:flex items-center space-x-1.5 rounded bg-[#C9A84C] px-3.5 py-1.8 text-sm font-black text-[#0A1D37] hover:bg-[#b0923f] transition-all cursor-pointer shadow-sm"
            id="nav-phone-call"
            title="সরাসরি কথা বলুন"
          >
            <Phone className="h-4 w-4 text-[#0A1D37] fill-[#0A1D37] shrink-0" />
            <span>{settings.contactPhone}</span>
          </a>

          {/* Quick Navigation Toggle Between Landing and Admin Panel */}
          {currentView === 'admin' ? (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-1 rounded bg-slate-900 px-3.5 py-1.8 text-sm font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
              id="goto-landing-btn"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-white" />
              <span>মূল সাইট</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center space-x-1.5 rounded bg-[#0A1D37] px-3.5 py-1.8 text-sm font-bold text-white hover:bg-[#112D55] transition-all cursor-pointer shadow-xs"
              id="goto-admin-btn"
              title="এজেন্টদের সাথে কন্সালটেশন করুন"
            >
              <MessageSquare className="h-4 w-4 text-white shrink-0" />
              <span>এজেন্টদের সাথে কথা বলুন</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
