import React from 'react';
import { Check, AlertCircle, Lock, Trash2 } from 'lucide-react';

interface SubAdminsViewProps {
  registeredAdmins: { name: string; email: string; isSuper?: boolean }[];
  superAdminEmail: string;
  isSubAdmin: boolean;
  
  subAdminName: string;
  setSubAdminName: (val: string) => void;
  subAdminEmail: string;
  setSubAdminEmail: (val: string) => void;
  subAdminPassword: string;
  setSubAdminPassword: (val: string) => void;
  
  subAdminError: string;
  subAdminSuccess: string;
  
  onAdd: (e: React.FormEvent) => void;
  onDelete: (email: string) => void;
  toBn: (num: number | string) => string;
}

export default function SubAdminsView({
  registeredAdmins,
  superAdminEmail,
  isSubAdmin,
  subAdminName,
  setSubAdminName,
  subAdminEmail,
  setSubAdminEmail,
  subAdminPassword,
  setSubAdminPassword,
  subAdminError,
  subAdminSuccess,
  onAdd,
  onDelete,
  toBn
}: SubAdminsViewProps) {
  return (
    <div className="space-y-6">
      {/* Alerts */}
      {subAdminSuccess && (
        <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <Check className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">সফল হয়েছে!</span>
            <p className="mt-0.5">{subAdminSuccess}</p>
          </div>
        </div>
      )}
      
      {subAdminError && (
        <div className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">ত্রুটি:</span>
            <p className="mt-0.5">{subAdminError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Form Panel */}
        <div className="xl:col-span-2 space-y-4">
          {isSubAdmin ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center h-full flex flex-col justify-center items-center space-y-3">
              <Lock className="h-6 w-6 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700">আমন্ত্রণ লকড</h4>
              <p className="text-[10px] text-slate-400 max-w-[260px]">
                কেবল সুপার অ্যাডমিন নতুন সাব-অ্যাডমিনদের যুক্ত করার ক্ষমতা রাখেন।
              </p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-left">
              <h3 className="text-sm font-semibold text-[#0B2545] uppercase">নতুন সাব-অ্যাডমিন</h3>
              <form onSubmit={onAdd} className="space-y-3">
                <input 
                  type="text" 
                  value={subAdminName} 
                  onChange={(e) => setSubAdminName(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2545]" 
                  placeholder="পূর্ণ নাম" 
                  required 
                />
                <input 
                  type="email" 
                  value={subAdminEmail} 
                  onChange={(e) => setSubAdminEmail(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2545]" 
                  placeholder="ইমেইল" 
                  required 
                />
                <input 
                  type="text" 
                  value={subAdminPassword} 
                  onChange={(e) => setSubAdminPassword(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2545]" 
                  placeholder="পাসওয়ার্ড/পিন" 
                  required 
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#0B2545] text-white hover:bg-[#122e4e] py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  আমন্ত্রণ জানান
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right List Panel */}
        <div className="xl:col-span-3 bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-semibold text-[#0B2545] uppercase">
            তালিকা ({toBn(registeredAdmins.length)})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                  <th className="px-4 py-3">নাম</th>
                  <th className="px-4 py-3">ইমেইল</th>
                  <th className="px-4 py-3 text-center">রোল</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredAdmins.map((admin) => {
                  const isThatSuper = admin.email.toLowerCase() === superAdminEmail.toLowerCase();
                  return (
                    <tr key={admin.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1a2a4a]">{admin.name}</td>
                      <td className="px-4 py-3 text-slate-500">{admin.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${isThatSuper ? 'bg-amber-100 text-amber-950 border-amber-200' : 'bg-indigo-50 text-indigo-900 border-indigo-200'}`}>
                          {isThatSuper ? '👑 Super' : '🔒 Sub'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isThatSuper && (
                          <button 
                            onClick={() => onDelete(admin.email)} 
                            disabled={isSubAdmin} 
                            className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}