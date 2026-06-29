import React from 'react';
import { Plus, Edit, Trash2, AlertCircle, Check } from 'lucide-react';
import { Category } from '../../../types';

interface CategoriesViewProps {
  categories: Category[];
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatSlug: string;
  setNewCatSlug: (val: string) => void;
  editingCatId: string | null;
  catError: string;
  catSuccess: string;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoriesView({
  categories,
  newCatName,
  setNewCatName,
  newCatSlug,
  setNewCatSlug,
  editingCatId,
  catError,
  catSuccess,
  onAdd,
  onEdit,
  onDelete
}: CategoriesViewProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B2545] uppercase">প্রজেক্ট ক্যাটাগরি ম্যানেজার</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          ওয়েবসাইটের নতুন প্রজেক্ট ক্যাটাগরি টাইপ যোগ করুন এবং স্ল্যাগ সাজিয়ে নিন।
        </p>
      </div>

      {catError && (
        <div className="flex items-start space-x-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <span>{catError}</span>
        </div>
      )}
      
      {catSuccess && (
        <div className="flex items-start space-x-1.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{catSuccess}</span>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি বাংলা নাম:</label>
          <input 
            type="text" 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            className="w-full bg-white rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2545]" 
            placeholder="যেমন: ডুপ্লেক্স ভিলা" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Slug বা ইউনিক কোড:</label>
          <input 
            type="text" 
            value={newCatSlug} 
            onChange={(e) => setNewCatSlug(e.target.value)} 
            className="w-full bg-white rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono" 
            placeholder="যেমন: duplex-villa" 
          />
        </div>
        <button 
          onClick={onAdd} 
          className="bg-[#0B2545] hover:bg-[#142e4e] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span>{editingCatId ? 'আপডেট করুন' : 'নতুন টাইপ যোগ করুন'}</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-indigo-50 font-bold text-slate-500">
              <th className="px-4 py-3">নাম</th>
              <th className="px-4 py-3">স্ল্যাগ</th>
              <th className="px-4 py-3 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-bold text-[#1a2a4a]">{c.name}</td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{c.slug}</td>
                <td className="px-4 py-2.5 text-center flex justify-center gap-1.5">
                  <button 
                    onClick={() => onEdit(c)} 
                    className="p-1 rounded bg-slate-100 text-[#0B2545] hover:bg-slate-200 cursor-pointer transition-colors"
                    title="সম্পাদনা"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button 
                    disabled={categories.length <= 1} 
                    onClick={() => onDelete(c.id)} 
                    className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 cursor-pointer transition-colors"
                    title="মুছুন"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}