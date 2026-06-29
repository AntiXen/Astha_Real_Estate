import React from 'react';
import { Home, Mail, Building2, FolderOpen, TrendingUp, Check, Edit } from 'lucide-react';
import { Property, Inquiry, Company, Category } from '../../../types';

interface DashboardViewProps {
  properties: Property[];
  companies: Company[];
  categories: Category[];
  inquiries: Inquiry[];
  setActiveTab: (tab: any) => void;
  onToggleInquiry: (inq: Inquiry) => void;
  onEditProperty: (p: Property) => void;
  toBn: (num: number | string) => string;
  formatTime: (isoDate?: string) => string;
}

export default function DashboardView({
  properties,
  companies,
  categories,
  inquiries,
  setActiveTab,
  onToggleInquiry,
  onEditProperty,
  toBn,
  formatTime
}: DashboardViewProps) {
  
  const unreadCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-5">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div onClick={() => setActiveTab('properties')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-[#C9A84C]/50 transition-colors cursor-pointer text-left">
          <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Home className="h-3.5 w-3.5" />
            <span>মোট প্রপার্টি</span>
          </div>
          <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
            {toBn(properties.length)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>ডাটাবেজ সংযুক্ত</span>
          </div>
        </div>

        <div onClick={() => setActiveTab('inquiries')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-red-400/50 transition-colors cursor-pointer text-left">
          <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span>নতুন ইনকোয়ারি</span>
          </div>
          <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
            {toBn(unreadCount)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>সর্বশেষ আপডেট</span>
          </div>
        </div>

        <div onClick={() => setActiveTab('companies')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-[#C9A84C]/50 transition-colors cursor-pointer text-left">
          <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>পার্টনার কোম্পানি</span>
          </div>
          <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
            {toBn(companies.length)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
            <Check className="h-3 w-3 text-emerald-500" />
            <span>সক্রিয় আছে</span>
          </div>
        </div>

        <div onClick={() => setActiveTab('categories')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-[#C9A84C]/50 transition-colors cursor-pointer text-left">
          <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>ক্যাটাগরি টাইপ</span>
          </div>
          <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
            {toBn(categories.length)}
          </div>
          <div className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 mt-1">
            <span>পোর্টফোলিওতে</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Recent Inquiries Card */}
        <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
          <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">সাম্প্রতিক ইনকোয়ারি</h3>
            <button onClick={() => setActiveTab('inquiries')} className="text-[10px] font-medium text-indigo-650 hover:underline cursor-pointer">
              সব দেখুন →
            </button>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {inquiries.length > 0 ? inquiries.slice(0, 4).map((inq) => (
              <div 
                key={inq.id} 
                onClick={() => onToggleInquiry(inq)}
                className="p-3 px-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                title="ক্লিক করে রিড/আনরিড মার্ক করুন"
              >
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${inq.status === 'new' ? 'bg-red-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-[#1a2a4a] truncate">{inq.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                      inq.category.includes('ফ্ল্যাট') ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 
                      inq.category.includes('জমি') || inq.category.includes('প্লট') ? 'bg-[#FEF9EE] text-[#B45309]' : 
                      'bg-[#F0FDF4] text-[#166534]'
                    }`}>
                      {inq.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {inq.location} · বাজেট: {inq.budget} · <span className="font-sans text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">📞 {toBn(inq.phone)}</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#b0bbd0] font-sans font-medium whitespace-nowrap mt-0.5">{formatTime(inq.created_at)}</span>
              </div>
            )) : (
              <div className="p-5 text-center text-xs text-slate-400 font-medium">কোনো নতুন ইনকোয়ারি পাওয়া যায়নি।</div>
            )}
          </div>
        </div>

        {/* Recent Properties Card */}
        <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
          <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">সাম্প্রতিক প্রপার্টি</h3>
            <button onClick={() => setActiveTab('properties')} className="text-[10px] font-medium text-indigo-650 hover:underline cursor-pointer">
              ম্যানেজ করুন →
            </button>
          </div>
          <div className="divide-y divide-slate-100 font-sans">
            <div className="grid grid-cols-12 gap-2 p-2 px-4 bg-slate-50 text-[9px] text-slate-400 uppercase font-bold tracking-wider select-none">
              <div className="col-span-6 text-left">নাম / লোকেশন</div>
              <div className="col-span-3 text-left">মূল্য</div>
              <div className="col-span-2 text-center">স্ট্যাটাস</div>
              <div className="col-span-1 text-center">অ্যাকশন</div>
            </div>
            {properties.slice(0, 4).map((prop) => (
              <div key={prop.id} className="grid grid-cols-12 gap-2 p-2.5 px-4 items-center text-[11px] font-sans hover:bg-slate-50">
                <div className="col-span-6 text-left">
                  <div className="font-bold text-[#1a2a4a] leading-tight truncate">{prop.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{prop.location}</div>
                </div>
                <div className="col-span-3 text-left font-bold text-[#1a2a4a] truncate">{prop.price}</div>
                <div className="col-span-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${prop.status.includes('Sold') ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                    {prop.status === 'Available' ? 'সক্রিয়' : prop.status.includes('Sold') ? 'বিক্রিত' : prop.status}
                  </span>
                </div>
                <div className="col-span-1 text-center flex items-center justify-center gap-1">
                  <button onClick={() => onEditProperty(prop)} className="p-1 hover:text-[#0B2545] text-slate-400 transition cursor-pointer">
                    <Edit className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}