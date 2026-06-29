import React from 'react';
import { Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { Company } from '../../../types';

interface CompaniesViewProps {
  companies: Company[];
  newCompanyName: string;
  setNewCompanyName: (val: string) => void;
  newCompanyEstablished: string;
  setNewCompanyEstablished: (val: string) => void;
  newCompanyLogo: string;
  setNewCompanyLogo: (val: string) => void;
  compError: string;
  compSuccess: string;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function CompaniesView({
  companies,
  newCompanyName,
  setNewCompanyName,
  newCompanyEstablished,
  setNewCompanyEstablished,
  newCompanyLogo,
  setNewCompanyLogo,
  compError,
  compSuccess,
  onAdd,
  onDelete
}: CompaniesViewProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B2545] uppercase">পার্টনার ডেভেলপার কোম্পানি</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          ওয়েবসাইটের প্রজেক্ট ডেভেলপারের তালিকা সম্পাদন ও ব্র্যান্ড ভ্যালু সংযোজন।
        </p>
      </div>
      
      {compError && (
        <div className="flex items-start space-x-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <span>{compError}</span>
        </div>
      )}
      
      {compSuccess && (
        <div className="flex items-start space-x-1.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{compSuccess}</span>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">কোম্পানির নাম:</label>
            <input 
              type="text" 
              value={newCompanyName} 
              onChange={(e) => setNewCompanyName(e.target.value)} 
              className="w-full bg-white rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
              placeholder="যেমন: শান্তা হোল্ডিংস" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">প্রতিষ্ঠার সাল:</label>
            <input 
              type="text" 
              value={newCompanyEstablished} 
              onChange={(e) => setNewCompanyEstablished(e.target.value)} 
              className="w-full bg-white rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
              placeholder="যেমন: ২০০৫" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">লোগো / প্রতীক:</label>
            <input 
              type="text" 
              value={newCompanyLogo} 
              onChange={(e) => setNewCompanyLogo(e.target.value)} 
              className="w-full bg-white rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none" 
              placeholder="ইমোজি (🏗️) বা ইমেজ লিংক" 
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5">
            <div className="h-10 w-10 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl text-lg flex items-center justify-center overflow-hidden">
              {newCompanyLogo?.startsWith('http') || newCompanyLogo?.startsWith('data:') ? (
                <img src={newCompanyLogo} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                newCompanyLogo || '🏢'
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onAdd} 
            className="bg-[#0B2545] hover:bg-[#122e4e] text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4 text-[#C9A84C]" />
            <span>সেভ কোম্পানি</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((comp) => (
          <div key={comp.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-xl text-lg flex items-center justify-center overflow-hidden shrink-0">
                {comp.logoUrl?.startsWith('http') || comp.logoUrl?.startsWith('data:') ? (
                  <img src={comp.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  comp.logoUrl || '🏢'
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1a2a4a]">{comp.companyName}</h4>
                <p className="text-[10px] text-slate-450 mt-1">স্থাপিত: {comp.established}</p>
              </div>
            </div>
            <button 
              disabled={companies.length <= 1} 
              onClick={() => onDelete(comp.id)} 
              className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors shrink-0"
              title="কোম্পানি মুছুন"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}