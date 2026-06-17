import React from 'react';
import { ShieldCheck, Percent, HelpCircle, HardHat, Sparkles } from 'lucide-react';

export default function TrustSection() {
  const trusts = [
    {
      icon: <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />,
      title: '১০০% ভেরিফাইড দলিলপত্র',
      desc: 'আমাদের অভিজ্ঞ আইনজীবীর সমন্বয়ে প্রতিটি জমির সিএস, এসএ, আরএস খতিয়ান ও নামজারি পুঙ্খানুপুঙ্খ মেলানো হয়।'
    },
    {
      icon: <Percent className="h-7 w-7 text-[#D4AF37]" />,
      desc: 'আমরা সরাসরি ডেভেলপার কোম্পানির অফিশিয়াল প্রাইসে ডিল করি। আড়ালে কোনো গোপন চার্জ বা অতিরিক্ত ব্রোকারেজ ফি নেই।',
      title: '০% গোপন কমিশন সুবিধা'
    },
    {
      icon: <HardHat className="h-7 w-7 text-[#D4AF37]" />,
      desc: 'শান্তা হোল্ডিংস, বিটিআই, কনকর্ডের মত শীর্ষস্থানীয় ৫+ স্বনামধন্য বিশ্বস্ত ডেভেলপারদের রাজকীয় প্রজেক্টেরই একমুখী প্ল্যাটফর্ম।',
      title: 'বাংলাদেশের শীর্ষ ডেভেলপাররা'
    },
    {
      icon: <Sparkles className="h-7 w-7 text-[#D4AF37]" />,
      desc: 'আপনি সরাসরি সাইট ভিজিট করতে চান? কোনো খরচ বা বাধ্যবাধকতা ছাড়াই গাড়ি দিয়ে আমাদের এক্সপার্ট আপনাকে প্রজেক্ট ঘুরিয়ে দেখাবে।',
      title: 'ফ্রি ফিজিক্যাল সাইট ভিজিট'
    }
  ];

  return (
    <section className="bg-[#021A15] border-t border-b border-white/10 py-16 font-bengali relative overflow-hidden" id="trust-section">
      <div className="absolute inset-0 radial-glow opacity-40 pointer-events-none"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Summary */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-bold tracking-wider text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/35 inline-block text-xs">সম্পূর্ণ ঝুঁকিমুক্ত ইনভেস্টমেন্ট জোন</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            ভূমি ক্রয়ে "আস্থার ঠিকানা" কেন আপনার সেরা সিদ্ধান্ত?
          </h2>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed font-light">
            একটি ভুল সিদ্ধান্ত সারা জীবনের উপার্জনকে আশঙ্কায় ফেলতে পারে। তাই তো আমরা আমাদের শতভাগ নিরাপদ ও আইনি সত্যতা প্রমাণিত ফিল্টারিং প্রোটোকল দিয়ে আপনার জমি বা ফ্ল্যাটের নিরাপত্তাকে সর্বাধিক গুরুত্ব দিই।
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trusts.map((item, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/10 hover:border-[#D4AF37]/30 shadow-lg gold-glow"
              id={`trust-card-${idx}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/15 mb-4">
                {item.icon}
              </div>
              <h3 className="text-md font-bold text-white font-bengali mb-1.5 mt-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
