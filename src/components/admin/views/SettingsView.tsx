import React from 'react';
import { Lock, Save, Check } from 'lucide-react';
import { SiteSettings } from '../../../types';

interface SettingsViewProps {
  localSettings: SiteSettings;
  setLocalSettings: (settings: SiteSettings) => void;
  onSave: () => void;
  isSubAdmin: boolean;
  successMessage: boolean;
}

export default function SettingsView({
  localSettings,
  setLocalSettings,
  onSave,
  isSubAdmin,
  successMessage
}: SettingsViewProps) {
  
  if (isSubAdmin) {
    return (
      <div className="bg-gray-50 border border-slate-200 p-8 rounded-2xl text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-700">সেটিংস পরিবর্তন করা অনুমোদিত নয়</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            সাব-অ্যাডমিন এই পেজের কনফিগারেশন পরিবর্তন করতে পারবেন না।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B2545] uppercase">ওয়েবসাইট সেটিংস ও স্লোগান কন্ট্রোল</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          প্রধান ওয়েবসাইটের ব্র্যান্ডিং টেক্সট, স্লোগান ও কন্ট্যাক্ট নম্বর কন্ট্রোল করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">লোগো ব্র্যান্ডিং টেক্সট:</label>
          <input 
            type="text" 
            value={localSettings.logoText} 
            onChange={(e) => setLocalSettings({ ...localSettings, logoText: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">অফিসিয়াল ইমেইল:</label>
          <input 
            type="email" 
            value={localSettings.email} 
            onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">হেল্পলাইন কন্ট্যাক্ট নম্বর:</label>
          <input 
            type="text" 
            value={localSettings.contactPhone} 
            onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">হোয়াটসঅ্যাপ নম্বর (No +):</label>
          <input 
            type="text" 
            value={localSettings.contactWhatsapp} 
            onChange={(e) => setLocalSettings({ ...localSettings, contactWhatsapp: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">ব্যানার বড় অফিশিয়াল স্লোগান:</label>
          <textarea 
            rows={2} 
            value={localSettings.bannerTitle} 
            onChange={(e) => setLocalSettings({ ...localSettings, bannerTitle: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none leading-relaxed" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">ব্যানার সাব-সেকশন বিবরণ:</label>
          <textarea 
            rows={2} 
            value={localSettings.bannerSubtitle} 
            onChange={(e) => setLocalSettings({ ...localSettings, bannerSubtitle: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none leading-relaxed" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">পাদটীকা অফিস ঠিকানা:</label>
          <input 
            type="text" 
            value={localSettings.officeAddress} 
            onChange={(e) => setLocalSettings({ ...localSettings, officeAddress: e.target.value })} 
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-100 flex items-center gap-1.5">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>সাইট সেটিংস্ ডাটাবেজে সফলভাবে আপডেট হয়েছে।</span>
        </div>
      )}
      
      <button 
        onClick={onSave} 
        className="bg-[#0B2545] hover:bg-[#15345a] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
      >
        <Save className="h-4 w-4 text-[#C9A84C]" />
        <span>সাইট সেটিংস পরিবর্তন সেভ করুন</span>
      </button>
    </div>
  );
}
