import React from 'react';
import { Grid, MapPin, Building, Sparkles } from 'lucide-react';
import { Category, Property } from '../../types';

interface CategoryQuickBoardProps {
  categories: Category[];
  properties: Property[];
  selectedCategoryId: string;
  setSelectedCategoryId: (val: string) => void;
}

export default function CategoryQuickBoard({
  categories,
  properties,
  selectedCategoryId,
  setSelectedCategoryId
}: CategoryQuickBoardProps) {
  return (
    <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="category-quickboard">
      <div className="text-center sm:text-left">
        <h3 className="text-md sm:text-lg font-bold text-[#C9A84C] font-bengali">প্রপার্টির ধরন অনুযায়ী খুঁজুন</h3>
        <p className="text-[11px] text-slate-300 mt-0.5">আপনার প্রোফাইল অনুযায়ী সেরা অপশন বেছে নিন</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c, idx) => {
          const matchedProps = properties.filter((p) => p.categoryId === c.id);
          const isActive = selectedCategoryId === c.id;
          
          const iconList = [
            <Grid key="1" className="h-5 w-5 text-[#b0923f]" />,
            <MapPin key="2" className="h-5 w-5 text-[#b0923f]" />,
            <Building key="3" className="h-5 w-5 text-[#b0923f]" />,
            <Sparkles key="4" className="h-5 w-5 text-[#b0923f]" />
          ];
          
          return (
            <div 
              key={c.id}
              onClick={() => {
                setSelectedCategoryId(isActive ? 'all' : c.id);
                const element = document.getElementById('property-showroom-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`cursor-pointer bg-white p-5 rounded-lg border transition-all text-center flex flex-col items-center justify-center space-y-2 group hover:shadow-xl hover:-translate-y-0.5 ${
                isActive 
                  ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/45 bg-amber-50/10' 
                  : 'border-slate-250/90 hover:border-[#C9A84C]'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                isActive ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/40' : 'bg-slate-50 border border-slate-100'
              }`}>
                {iconList[idx % iconList.length]}
              </div>
              <div className="text-xs font-black text-slate-900 font-bengali">{c.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold font-sans">
                {toBn(matchedProps.length)} টি প্রজেক্ট লিস্টিং
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Simple English-to-Bengali number converter for the listings counter
const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBn(num: number | string): string {
  return num.toString().split('').map(d => bnDigits[parseInt(d, 10)] || d).join('');
}