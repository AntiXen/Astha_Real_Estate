import React, { useState } from 'react';
import { Phone, ShieldCheck } from 'lucide-react';
import { dbService } from '../../services/db';
import { isValidBDPhoneNumber, normalizeBDPhoneNumber, sanitizeInput } from '../../utils/validation';

interface LeadFormProps {
  activeCategoryName: string;
}

export default function LeadForm({ activeCategoryName }: LeadFormProps) {
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadLocation, setLeadLocation] = useState<string>('');
  const [leadBudget, setLeadBudget] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Sanitize text inputs
    const sanitizedName = sanitizeInput(leadName);
    const sanitizedLocation = sanitizeInput(leadLocation) || 'অনির্দিষ্ট';
    const sanitizedBudget = sanitizeInput(leadBudget) || 'অনির্দিষ্ট';

    if (!sanitizedName) {
      alert('অনুগ্রহ করে আপনার নাম সঠিকভাবে লিখুন।');
      return;
    }

    // 2. Validate Bangladeshi Phone format
    if (!isValidBDPhoneNumber(leadPhone)) {
      alert('অনুগ্রহ করে একটি সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Normalize phone number format before db save
      const normalizedPhone = normalizeBDPhoneNumber(leadPhone);

      await dbService.saveInquiry({
        name: sanitizedName,
        phone: normalizedPhone,
        location: sanitizedLocation,
        budget: sanitizedBudget,
        category: activeCategoryName,
        status: 'new'
      });

      setIsSubmitted(true);
      setLeadName('');
      setLeadPhone('');
      setLeadLocation('');
      setLeadBudget('');
    } catch (err) {
      console.error('Error submitting lead form:', err);
      alert('দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা সরাসরি কল করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="lead-form">
      <div className="bg-slate-900 rounded-xl border border-white/10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
        
        {/* Marketing Info */}
        <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#C9A84C] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded border border-[#C9A84C]/30">
            <Phone className="h-4 w-4" />
            <span>ইন্সট্যান্ট কল ব্যাক</span>
          </div>
          <h3 className="text-lg font-bold text-white font-bengali mt-1">আপনার স্বপ্নের বাড়ির জন্য ২৫ মিনিট কন্সালটেশন ফ্রি!</h3>
          <p className="text-xs text-[#C9A84C] font-bold font-bengali">আপনার এলাকা, বাজেট ও চাহিদা লিখে রাখুন</p>
          <p className="text-[11px] text-slate-300 leading-relaxed font-bengali">
            আজই আমাদের কাস্টমার সাকসেস টিমের অভিজ্ঞ প্রপার্টি স্পেশালিস্টদের সাথে সরাসরি যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে ১০০% ভেরিফাইড প্রজেক্টের নথিপত্র সহ আপনাকে কল দিয়ে সাহায্য করব।
          </p>
        </div>

        {/* Input Form Cards */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-lg border border-white/5 shadow-inner">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-10 w-10 text-emerald-400 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#C9A84C] font-bengali">ধন্যবাদ! আপনার কল ব্যাক রিকোয়েস্ট সফল হয়েছে।</h4>
                <p className="text-[10px] text-slate-300 mt-1 font-bengali">আমাদের ড্রিম হোম অফিসার খুব শীঘ্রই আপনার দেওয়া নম্বরে সরাসরি কল করবেন।</p>
              </div>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-[10px] text-[#C9A84C] font-semibold hover:underline font-bengali"
              >
                অন্য আরেকটি রিকোয়েস্ট তৈরি করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-300 font-semibold font-bengali">আপনার নাম *</label>
                  <input 
                    required
                    type="text" 
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none disabled:opacity-50"
                    placeholder="যেমন: এম ডি সাজিদ"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-300 font-semibold font-bengali">মোবাইল নম্বর *</label>
                  <input 
                    required
                    type="tel" 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none disabled:opacity-50"
                    placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-300 font-semibold font-bengali">পছন্দের এলাকা</label>
                  <input 
                    type="text" 
                    value={leadLocation}
                    onChange={(e) => setLeadLocation(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none disabled:opacity-50"
                    placeholder="যেমন: ধানমন্ডি"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-300 font-semibold font-bengali">আনুমানিক বাজেট (লাখ/কোটি টাকা)</label>
                  <input 
                    type="text" 
                    value={leadBudget}
                    onChange={(e) => setLeadBudget(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] focus:outline-none disabled:opacity-50"
                    placeholder="যেমন: ৬০ লাখ টাকা"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C9A84C] text-[#0A1D37] hover:bg-[#b0923f] transition-all py-2 rounded text-xs font-bold cursor-pointer font-bengali flex items-center justify-center disabled:opacity-75"
              >
                {isSubmitting ? 'প্রেরণ করা হচ্ছে...' : 'অনুরোধ পাঠান (Request Call Back)'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}