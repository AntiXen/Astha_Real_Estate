import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Property, Category } from '../../../types';

interface PropertiesViewProps {
  properties: Property[];
  categories: Category[];
  onAddProperty: () => void;
  onEditProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  toBn: (num: number | string) => string;
}

export default function PropertiesView({
  properties,
  categories,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  toBn
}: PropertiesViewProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0B2545] uppercase">প্রপার্টি ইনভেন্টরি তালিকা ({toBn(properties.length)})</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">সবগুলো ফ্ল্যাট, হোম বা কমার্শিয়াল প্লট এডিট বা ডিলিট করুন সরাসরি।</p>
        </div>
        <button 
          onClick={onAddProperty} 
          className="bg-[#0B2545] hover:bg-[#122c4d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition"
        >
          <Plus className="h-4 w-4 text-[#C9A84C]" />
          <span>নতুন প্রজেক্ট যোগ করুন</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-slate-50 border-b border-indigo-50 text-slate-500 font-bold">
              <th className="px-4 py-3">ছবি</th>
              <th className="px-4 py-3">শিরোনাম ও লোকেশন</th>
              <th className="px-4 py-3">ক্যাটাগরি</th>
              <th className="px-4 py-3">মূল্য ও সাইজ</th>
              <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
              <th className="px-4 py-3 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.map((p) => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 shrink-0">
                    <img 
                      src={p.images[0]} 
                      alt="" 
                      className="h-10 w-16 object-cover rounded border border-slate-200 bg-slate-100" 
                      referrerPolicy="no-referrer" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#1a2a4a] text-xs truncate max-w-[200px]">{p.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{p.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {cat?.name || 'জমি'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#0B2545]">{p.price}</div>
                    <div className="text-[9px] text-slate-400 font-sans mt-0.5">{toBn(p.size || 0)} Sft / কাঠা</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.status.includes('Sold') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onEditProperty(p)} 
                        className="p-1.5 rounded bg-slate-100 hover:bg-[#C9A84C]/20 text-[#0B2545] transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => onDeleteProperty(p.id)} 
                        className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                  কোনো প্রজেক্ট পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}