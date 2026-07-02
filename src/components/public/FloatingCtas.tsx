import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../../types';

interface FloatingCtasProps {
  settings: SiteSettings;
}

export default function FloatingCtas({ settings }: FloatingCtasProps) {
  const defaultWhatsAppText = `আসসালামু আলাইকুম। "আস্থার ঠিকানা" প্ল্যাটফর্ম থেকে আমি আপনাদের সাথে কানেক্ট হতে চাচ্ছি। আমার কিছু লিগ্যাল প্রজেক্ট সম্পর্কে জানার আছে।`;
  const globalWhatsappUrl = `https://wa.me/${settings.contactWhatsapp}?text=${encodeURIComponent(defaultWhatsAppText)}`;

  return (
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
  );
}