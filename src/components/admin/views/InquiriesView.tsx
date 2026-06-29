import React from 'react';
import { Inquiry } from '../../../types';

interface InquiriesViewProps {
  inquiries: Inquiry[];
  onToggleInquiry: (inq: Inquiry) => void;
  toBn: (num: number | string) => string;
  formatTime: (isoDate?: string) => string;
}

export default function InquiriesView({
  inquiries,
  onToggleInquiry,
  toBn,
  formatTime
}: InquiriesViewProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#0B2545] uppercase">
          ইনকোয়ারী মনিটর ও কল লিস্ট ({toBn(inquiries.length)})
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          গ্রাহকদের আগ্রহ ও তাদের কল ব্যাক রিকুয়েস্টের রিয়েল-টাইম তালিকা।
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-slate-50 border-b border-indigo-50 text-slate-500 font-bold">
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3">গ্রাহক নাম</th>
              <th className="px-4 py-3">আগ্রহের ধরণ</th>
              <th className="px-4 py-3">বাজেট ও এলাকা</th>
              <th className="px-4 py-3">কন্টাক্ট নম্বর</th>
              <th className="px-4 py-3">সময়কাল</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <tr 
                  key={inq.id} 
                  className={`hover:bg-slate-50/50 transition cursor-pointer ${
                    inq.status === 'new' ? 'font-bold bg-amber-50/30' : ''
                  }`}
                  onClick={() => onToggleInquiry(inq)}
                  title="ক্লিক করে রিড/আনরিড মার্ক করুন"
                >
                  <td className="px-4 py-3 shrink-0">
                    <span 
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        inq.status === 'new' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-300'
                      }`} 
                    />
                  </td>
                  <td className="px-4 py-3 text-[#1a2a4a] text-xs font-bold">{inq.name}</td>
                  <td className="px-4 py-3">
                    <span 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                        inq.category.includes('ফ্ল্যাট') ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 
                        inq.category.includes('জমি') || inq.category.includes('প্লট') ? 'bg-[#FEF9EE] text-[#B45309]' : 
                        'bg-[#F0FDF4] text-[#166534]'
                      }`}
                    >
                      {inq.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {inq.location} · {toBn(inq.budget)}
                  </td>
                  <td className="px-4 py-3 text-[#0B2545] font-sans font-semibold">
                    📞 {toBn(inq.phone)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-sans text-[10px]">
                    {formatTime(inq.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                  কোনো ইনকোয়ারি পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}