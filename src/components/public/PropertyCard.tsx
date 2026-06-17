import React from 'react';
import { Phone, MessageSquare, BedDouble, Bath, Maximize, MapPin, Building2, Tag } from 'lucide-react';
import { Property, Category, Company, SiteSettings } from '../../types';

interface PropertyCardProps {
  property: Property;
  categories: Category[];
  companies: Company[];
  settings: SiteSettings;
  onSelect: (id: string) => void;
}

export default function PropertyCard({ property, categories, companies, settings, onSelect }: PropertyCardProps) {
  const categoryName = categories.find((c) => c.id === property.categoryId)?.name || 'প্রজেক্ট';
  const developer = companies.find((c) => c.id === property.companyId);

  // Encode professional message for WhatsApp lead tracking
  const messageText = `আসসালামু আলাইকুম। আমি "Astha Real Estate" সাইটে আপনার "${property.title}" প্রজেক্টটি দেখেছি এবং বিস্তারিত জানতে আগ্রহী। প্রজেক্ট কোড: AST-${property.id}`;
  const whatsappUrl = `https://wa.me/${settings.contactWhatsapp}?text=${encodeURIComponent(messageText)}`;

  const isSoldOut = property.status === 'Sold Out';

  // Replicate exact mockup badging system
  let badgeText = '🆕 নতুন';
  let badgeStyle = 'bg-[#B5D4F4] text-[#042C53]'; // default
  if (categoryName.includes('ফ্ল্যাট')) {
    badgeText = '🔥 হট ডিল';
    badgeStyle = 'bg-[#F09595] text-[#501313]';
  } else if (categoryName.includes('কমার্শিয়াল')) {
    badgeText = '✅ রেডি টু মুভ';
    badgeStyle = 'bg-[#C0DD97] text-[#173404]';
  } else if (categoryName.includes('জমি') || categoryName.includes('প্লট')) {
    badgeText = '🆕 নতুন';
    badgeStyle = 'bg-[#B5D4F4] text-[#042C53]';
  }

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#C9A84C] font-bengali"
      id={`property-card-${property.id}`}
    >
      {/* Property Image & Overlays */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          id={`property-img-${property.id}`}
        />

        {/* Mockup Overlay Badge */}
        <span className={`absolute top-2.5 left-2.5 rounded px-2 py-0.5 text-[10px] font-bold shadow-sm ${badgeStyle}`} id={`category-badge-${property.id}`}>
          {badgeText}
        </span>
      </div>

      {/* Property Details */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Category Description Tag */}
        <div className="text-[10px] font-medium text-slate-500 tracking-wider mb-1" id={`category-tag-${property.id}`}>
          {categoryName === 'ফ্ল্যাট' ? 'ফ্ল্যাট / অ্যাপার্টমেন্ট' : categoryName === 'কমার্শিয়াল' ? 'কমার্শিয়াল স্পেস' : 'জমি / প্লট'}
        </div>

        {/* Title */}
        <button 
          onClick={() => onSelect(property.id)}
          className="text-left group-hover:text-[#b0923f] cursor-pointer block mb-1.5 focus:outline-none"
          id={`title-btn-${property.id}`}
        >
          <h3 className="line-clamp-1 text-sm font-bold text-slate-900 tracking-tight transition-colors">
            {property.title}
          </h3>
        </button>

        {/* Location Row */}
        <div className="flex items-center space-x-1 text-xs text-slate-600 mb-3" id={`location-line-${property.id}`}>
          <MapPin className="h-3 w-3 shrink-0 text-[#C9A84C]" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Mockup Price Tag with "থেকে শুরু" / "প্রতি কাঠা" styling */}
        <div className="text-md font-bold text-[#b0923f] mb-3" id={`price-label-${property.id}`}>
          {property.price} <span className="text-[10px] text-slate-500 font-normal">
            {categoryName.includes('জমি') ? '' : 'থেকে শুরু'}
          </span>
        </div>

        {/* Property Specs & CTA Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          
          {/* Metadata String representation from mockup */}
          <div className="text-[11px] text-slate-600 flex gap-2" id={`meta-container-${property.id}`}>
            {categoryName.includes('ফ্ল্যাট') && (
              <>
                <span>৩ বেড</span>
                <span>•</span>
                <span>২ বাথ</span>
                <span>•</span>
                <span>১৩৫০ sqft</span>
              </>
            )}
            {categoryName.includes('কমার্শিয়াল') && (
              <>
                <span>অফিস স্পেস</span>
                <span>•</span>
                <span>৮০০+ sqft</span>
              </>
            )}
            {categoryName.includes('জমি') && (
              <>
                <span>৩ কাঠা থেকে</span>
                <span>•</span>
                <span>রেজিস্ট্রি করা</span>
              </>
            )}
            {!['ফ্ল্যাট', 'কমার্শিয়াল', 'জমি / প্লট', 'জমি'].includes(categoryName) && (
              <>
                <span>{property.bedrooms ? `${property.bedrooms} বেড` : `${property.size} কাঠা`}</span>
                <span>•</span>
                <span>{property.facing || 'নিষ্কণ্টক'}</span>
              </>
            )}
          </div>

          {/* Action CTA Button strictly matching mockup "বিস্তারিত" */}
          <button
            onClick={() => onSelect(property.id)}
            className="text-[11px] font-bold text-white bg-[#0A1D37] hover:bg-[#112D55] px-3.5 py-1.5 rounded transition-all cursor-pointer"
            id={`view-details-${property.id}`}
          >
            বিস্তারিত
          </button>

        </div>

      </div>
    </div>
  );
}
