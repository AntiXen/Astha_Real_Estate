import React, { useState } from 'react';
import { Phone, MessageSquare, BookOpen, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../../types';

interface NavbarProps {
  settings: SiteSettings;
  currentView: 'home' | 'admin' | 'details' | 'listings'; // Added 'listings' type support
  onNavigate: (view: 'home' | 'admin' | 'details' | 'listings') => void; // Added 'listings' type support
  selectedCategoryId?: string;
  setSelectedCategoryId?: (id: string) => void;
}

export default function Navbar({ 
  settings, 
  currentView, 
  onNavigate, 
  selectedCategoryId, 
  setSelectedCategoryId 
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHomeClick = () => {
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleProkolpoClick = () => {
    if (setSelectedCategoryId) {
      setSelectedCategoryId('all');
    }
    // Navigate directly to the listings page instead of just scrolling down
    onNavigate('listings'); 
    setMobileMenuOpen(false);
  };

  const handleTestimonialsClick = () => {
    onNavigate('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById('testimonials');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleContactClick = () => {
    onNavigate('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById('lead-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-xs font-bengali" id="app-header">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Logo */}
        <button 
          onClick={handleHomeClick} 
          className="group flex items-center text-left focus:outline-none cursor-pointer py-1"
          id="nav-logo-btn"
        >
          <img 
            src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
            alt="Astha Real Estate"
            className="h-14 sm:h-16 w-auto object-contain select-none transition-all duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Middle: Redesigned Minimal Navigation Links (Desktop Only) */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold tracking-wide" id="nav-middle-links">
          <button 
            onClick={handleHomeClick}
            className={`relative py-2 transition-colors cursor-pointer group font-extrabold ${
              currentView === 'home' ? 'text-[#b0923f]' : 'text-slate-800 hover:text-[#b0923f]'
            }`}
          >
            হোম
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
          </button>
          
          <button 
            onClick={handleProkolpoClick}
            className={`relative py-2 transition-colors cursor-pointer group font-extrabold ${
              currentView === 'listings' ? 'text-[#b0923f]' : 'text-slate-700 hover:text-[#b0923f]'
            }`}
          >
            প্রকল্প
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
          </button>
          
          <button 
            onClick={handleTestimonialsClick} 
            className="relative py-2 text-slate-700 hover:text-[#b0923f] transition-colors cursor-pointer group font-extrabold"
          >
            প্রতিনিধিত্ব
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
          </button>
          
          <button 
            onClick={handleContactClick} 
            className="relative py-2 text-slate-700 hover:text-[#b0923f] transition-colors cursor-pointer group font-extrabold"
          >
            যোগাযোগ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
          </button>
        </nav>

        {/* Right Side: Action CTA Widgets (Desktop Only) */}
        <div className="hidden lg:flex items-center space-x-3.5">
          {/* Phone Call CTA */}
          <a
            href={`tel:${settings.contactPhone}`}
            className="flex items-center space-x-2 rounded-xl bg-[#C9A84C] px-4 py-2.5 text-xs font-black text-[#0A1D37] hover:bg-[#b0923f] transition-all cursor-pointer shadow-sm shadow-[#C9A84C]/20 hover:shadow-md hover:-translate-y-0.5 duration-200"
            id="nav-phone-call"
            title="সরাসরি কথা বলুন"
          >
            <Phone className="h-3.5 w-3.5 text-[#0A1D37] fill-[#0A1D37] shrink-0" />
            <span className="font-sans font-bold">{settings.contactPhone}</span>
          </a>

          {/* Consultation Button */}
          {currentView === 'admin' ? (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
              id="goto-landing-btn"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-white" />
              <span>মূল সাইট</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const element = document.getElementById('lead-form');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="flex items-center space-x-2 rounded-xl bg-[#0A1D37] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#112D55] transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200"
              id="goto-admin-btn"
              title="এজেন্টদের সাথে কন্সালটেশন করুন"
            >
              <MessageSquare className="h-3.5 w-3.5 text-white shrink-0" />
              <span>এজেন্টদের সাথে কথা বলুন</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center lg:hidden space-x-2">
          {/* Mobile Phone CTA Icon */}
          <a
            href={`tel:${settings.contactPhone}`}
            className="p-2.5 rounded-xl bg-[#C9A84C]/10 text-[#b0923f] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 transition-all cursor-pointer"
            title="ফোন করুন"
          >
            <Phone className="h-4 w-4" />
          </a>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide-down Menu with Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-5 space-y-4 shadow-inner">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleHomeClick}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 hover:bg-[#C9A84C]/10 hover:text-[#b0923f] hover:border-[#C9A84C]/30 font-bold text-sm transition-colors cursor-pointer"
                >
                  হোম
                </button>
                <button
                  onClick={handleProkolpoClick}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 hover:bg-[#C9A84C]/10 hover:text-[#b0923f] hover:border-[#C9A84C]/30 font-bold text-sm transition-colors cursor-pointer"
                >
                  প্রকল্প
                </button>
                <button
                  onClick={handleTestimonialsClick}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 hover:bg-[#C9A84C]/10 hover:text-[#b0923f] hover:border-[#C9A84C]/30 font-bold text-sm transition-colors cursor-pointer"
                >
                  প্রতিনিধিত্ব
                </button>
                <button
                  onClick={handleContactClick}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 hover:bg-[#C9A84C]/10 hover:text-[#b0923f] hover:border-[#C9A84C]/30 font-bold text-sm transition-colors cursor-pointer"
                >
                  যোগাযোগ
                </button>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                {/* Secondary actions in drawer */}
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-[#C9A84C] py-3 text-sm font-black text-[#0A1D37] hover:bg-[#b0923f] transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="h-4 w-4 text-[#0A1D37] fill-[#0A1D37]" />
                  <span>ফোন করুন: {settings.contactPhone}</span>
                </a>

                {currentView !== 'admin' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        const element = document.getElementById('lead-form');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#0A1D37] py-3 text-sm font-bold text-white hover:bg-[#112D55] transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-white" />
                    <span>এজেন্টদের সাথে কথা বলুন</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}