import React, { useState } from 'react';
import { X, Phone, MessageSquare, BedDouble, Bath, Maximize, MapPin, Building, Calendar, Compass, FileCheck2, ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { Property, Category, Company, SiteSettings } from '../../types';

interface PropertyDetailsModalProps {
  propertyId: string;
  properties: Property[];
  categories: Category[];
  companies: Company[];
  settings: SiteSettings;
  onClose: () => void;
}

export default function PropertyDetailsModal({ propertyId, properties, categories, companies, settings, onClose }: PropertyDetailsModalProps) {
  const property = properties.find((p) => p.id === propertyId);
  if (!property) return null;

  const [activeMedia, setActiveMedia] = useState<{ type: 'video' | 'image', url: string }>(() => {
    if (property.videoUrl) {
      return { type: 'video', url: property.videoUrl };
    }
    return { type: 'image', url: property.images[0] || '' };
  });

  const categoryName = categories.find((c) => c.id === property.categoryId)?.name || 'প্রজেক্ট';
  const developer = companies.find((c) => c.id === property.companyId);

  // Generate customized WhatsApp tracking template
  const textMessage = `আসসালামু আলাইকুম। আমি "আস্থার ঠিকানা" নামক প্ল্যাটফর্মে আপনার প্রজেক্টটি দেখেছি: "${property.title}" (${property.location})। আমি এই প্রজেক্টের সঠিক আইনি ক্লিয়ারেন্স, বুকিং পদ্ধতি ও সচিত্র দলিলাদি সম্পর্কে বিস্তারিত জানতে আগ্রহী। অনুগ্রহ করে আমার সাথে যোগাযোগ করুন।`;
  const whatsappUrl = `https://wa.me/${settings.contactWhatsapp}?text=${encodeURIComponent(textMessage)}`;

  // Simulated live counter for FOMO triggers
  const viewCount = 5;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040e0c]/85 backdrop-blur-md font-bengali flex items-center justify-center p-0 sm:p-4" id="property-details-backdrop">
      <div 
        className="relative bg-[#02140e] w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-2xl overflow-y-auto shadow-[0_0_50px_rgba(4,14,12,0.8)] flex flex-col border border-white/10 text-slate-250 font-bengali"
        id="property-details-container"
      >
        
        {/* Navigation / Header matching style */}
        <div className="sticky top-0 bg-[#02140e] z-10 px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="flex items-center text-slate-350 hover:text-white hover:bg-white/5 transition-all py-1.5 px-3.5 rounded border border-[#C9A84C]/40 bg-[#02140e] cursor-pointer"
            id="modal-back-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 text-white" />
            <span className="text-xs font-bold text-white">ফিরে যান</span>
          </button>
          
          <span className="text-xs font-bold font-bengali text-[#C9A84C] bg-[#C9A84C]/5 px-4.5 py-1.5 rounded-full border border-[#C9A84C]/35 hidden sm:inline">
            এজেন্ট ভেরিফাইড প্রজেক্ট কোড: AST-{property.id}
          </span>

          <button 
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none border border-white/10"
            id="modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 md:p-8 space-y-6 overflow-y-auto">
          
          {/* Top Scarcity Alerts */}
          <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white shadow-[0_0_15px_rgba(201,168,76,0.05)]">
            <div className="flex items-center space-x-2.5">
              <div className="bg-[#C9A84C]/10 p-2 rounded text-[#C9A84C] shrink-0 border border-[#C9A84C]/25">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-200 leading-snug">
                হিট প্রজেক্ট অ্যালার্ট! এই মুহূর্তে ঢাকার আরও <strong className="text-[#C9A84C] font-black">{viewCount} জন ক্রেতা</strong> সরাসরি এই প্রজেক্টটির খোঁজ নিচ্ছেন। বুকিং এর সুযোগ আজই শেষ হতে পারে!
              </p>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-black text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-1 rounded border border-[#C9A84C]/35">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>সীমাবদ্ধ অফার</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image Gallery View */}
            <div className="lg:col-span-7 space-y-5">
              <div className="overflow-hidden rounded-xl bg-slate-950 aspect-[16/10] border border-white/10 relative shadow-inner flex items-center justify-center">
                {activeMedia.type === 'video' ? (
                  <video 
                    src={activeMedia.url} 
                    controls 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                    id="modal-active-video"
                  />
                ) : (
                  <img 
                    src={activeMedia.url} 
                    alt="Property Visual" 
                    className="w-full h-full object-cover transition-all"
                    referrerPolicy="no-referrer"
                    id="modal-active-img"
                  />
                )}
              </div>

              {/* Thumbnails list */}
              {(property.videoUrl || property.images.length > 0) && (
                <div className="flex gap-2.5 overflow-x-auto pb-1" id="image-thumbnails-wrapper">
                  {/* Video Thumbnail (Always displayed at the front) */}
                  {property.videoUrl && (
                    <button
                      key="video-thumb"
                      type="button"
                      onClick={() => setActiveMedia({ type: 'video', url: property.videoUrl! })}
                      className={`relative flex-none h-14 w-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 flex flex-col items-center justify-center ${
                        activeMedia.type === 'video' ? 'border-[#C9A84C] shadow-lg bg-[#C9A84C]/10' : 'border-white/10 hover:border-white/30'
                      }`}
                      id="thumbnail-btn-video"
                    >
                      <div className="absolute inset-0 bg-[#0B2545]/45 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-[#C9A84C] flex items-center justify-center shadow">
                          <svg className="h-3.5 w-3.5 fill-[#02140e] text-[#02140e] ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-[#C9A84C] absolute bottom-1 text-center w-full truncate px-1">ভিডিও</span>
                    </button>
                  )}

                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveMedia({ type: 'image', url: img })}
                      className={`relative flex-none h-14 w-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeMedia.type === 'image' && activeMedia.url === img ? 'border-[#C9A84C] shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                      id={`thumbnail-btn-${index}`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Documents Checklist */}
              <div className="pt-5 border-t border-white/5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-[#C9A84C]" />
                  <span>আইনজীবী কর্তৃক ভেরিফাইড দলিল সমূহের তালিকা</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 bg-[#032317]/50 border border-emerald-500/20 rounded p-2.5 hover:border-emerald-500/35 transition-all">
                    <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                    <span className="font-medium text-slate-300">মূল মালিকানা দলিল (CS, SA, RS)</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#032317]/50 border border-emerald-500/20 rounded p-2.5 hover:border-emerald-500/35 transition-all">
                    <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                    <span className="font-medium text-slate-300">হালনাগাদ নামজারি ও জমাভাগ খতিয়ান</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#032317]/50 border border-emerald-500/20 rounded p-2.5 hover:border-emerald-500/35 transition-all">
                    <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                    <span className="font-medium text-slate-300">ভূমি উন্নয়ন কর রশিদ (দাখিলা)</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#032317]/50 border border-emerald-500/20 rounded p-2.5 hover:border-emerald-500/35 transition-all">
                    <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                    <span className="font-medium text-slate-300">রাজউক / সরকারি ছাড়পত্র ও নকশা</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Key Details & Marketing Copy */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              
              <div className="space-y-4">
                {/* Category & Status Row */}
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#C9A84C] uppercase tracking-wider font-extrabold">{categoryName}</span>
                  <span className="bg-[#C9A84C] text-[#0A1D37] text-[10px] uppercase tracking-wide px-2.5 py-1 rounded font-black font-bengali shadow-xs">
                    আজই বুকিং সম্ভব
                  </span>
                </div>

                {/* Main Title */}
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                  {property.title}
                </h2>

                {/* Location */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <MapPin className="h-4 w-4 text-[#C9A84C] shrink-0" />
                  <span>{property.location}</span>
                </div>

                {/* Dynamic Price Area Box */}
                <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-xl p-5 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">সর্বমোট প্রজেক্ট মূল্য</p>
                  <p className="text-2xl md:text-3xl font-black text-[#C9A84C] leading-none my-1.5">{property.price}</p>
                  <p className="text-[10px] text-slate-450 leading-none">✓ কোনো অতিরিক্ত হিডেন দালাল ফি বা কমিশন চার্জ নেই</p>
                </div>

                {/* Grid spec metrics exactly as mockup layout */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 pb-5 border-b border-white/5 text-xs text-slate-300">
                  <div className="flex items-start space-x-2.5">
                    <Building className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-500 leading-none font-bold">ডেভেলপার</p>
                      <p className="font-extrabold text-white mt-1 leading-snug">{developer?.companyName.split('(')[0] || 'যাচাইকৃত ব্র্যান্ড'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Maximize className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-500 leading-none font-bold">সাইজ / কভার্ড এরিয়া</p>
                      <p className="font-extrabold text-white mt-1 leading-snug">{property.size} {property.bedrooms ? 'বর্গফুট (Sft)' : 'কাঠা ল্যান্ড'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Compass className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-500 leading-none font-bold">দিক বিন্যাস</p>
                      <p className="font-extrabold text-white mt-1 leading-snug">{property.facing || 'উত্তরমুখী'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Calendar className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-500 leading-none font-bold">প্রতিষ্ঠাকাল</p>
                      <p className="font-extrabold text-white mt-1 leading-snug">{developer?.established || '১৯৭৩'} সাল</p>
                    </div>
                  </div>
                </div>

                {/* Description and procedure matching style */}
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="space-y-2">
                    <h4 className="font-black text-white text-sm">প্রজেক্ট ওভারভিউ এবং বিবরণ:</h4>
                    <p className="text-slate-300 font-medium pl-0.5 leading-relaxed">{property.description}</p>
                  </div>
                  
                  <div className="bg-[#C9A84C]/5 p-3 rounded border-l-2 border-[#C9A84C] space-y-1">
                    <p className="font-extrabold text-[#C9A84C] leading-snug">
                      ✓ বুকিং প্রসিডিউর: আমরা কাস্টমারের নামে মিউটেশন ও খতিয়ানের সঠিকতা পরীক্ষা সাপেক্ষে সরাসরি আইনজীবীর উপস্থিতিতে বুকিং অ্যাডভান্স গ্রহণ করি। কোনো অতিরিক্ত ফাইল প্রসেস ফি চার্জ নেই।
                    </p>
                  </div>
                </div>

              </div>

              {/* Conversion Buttons matches bottom right style split perfectly */}
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3" id="modal-ctas">
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center justify-center space-x-2 rounded bg-[#C9A84C] text-[#02140e] hover:bg-[#b0923f] py-3.5 px-4 text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer text-center"
                  id="modal-phone-btn"
                >
                  <Phone className="h-4 w-4 fill-[#02140e] text-[#02140e]" />
                  <span>কল করুন (ফ্রি পরামর্শ)</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 rounded bg-[#12B76A] text-white hover:bg-[#0fa15c] py-3.5 px-4 text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer text-center"
                  id="modal-whatsapp-btn"
                >
                  <MessageSquare className="h-4 w-4 fill-white text-[#12B76A]" />
                  <span>হোয়াটসঅ্যাপ করুন</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

