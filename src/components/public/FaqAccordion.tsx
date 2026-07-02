import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqData = [
    {
      q: "প্রপার্টি কেনার জন্য কি কি ডকুমেন্ট লাগে?",
      a: "প্রপার্টি কেনার ক্ষেত্রে সাধারণত জাতীয় পরিচয়পত্র (NID), পাসপোর্ট সাইজ ছবি, আয়ের উৎস প্রমাণকারী ডকুমেন্ট (যেমন পে-স্লিপ বা ব্যাংক বিবরণী), এবং কর পরিশোধ সনদ (TIN) প্রয়োজন হয়।"
    },
    {
      q: "বুকিং বা রেজিস্ট্রেশনের প্রক্রিয়া কেমন?",
      a: "পছন্দের প্রপার্টি বুকিংয়ের জন্য আবেদনপত্রের সাথে বায়নার টাকা (বুকিং মানি) প্রদান করতে হয়। পরবর্তীতে চুক্তিনামা সম্পাদন করে সিডিউল অনুযায়ী ডাউনপেমেন্ট ও কিস্তির টাকা শোধ করার পর রেজিস্ট্রেশন সম্পন্ন হয়।"
    },
    {
      q: "অ্যাডভান্স দেওয়ার পর বাতিল করলে টাকা ফেরত পাবো?",
      a: "হ্যাঁ, বুকিং বা অ্যাডভান্স দেওয়ার পর কোনো কারণে বাতিল করতে চাইলে চুক্তিনামায় উল্লিখিত নির্দিষ্ট নিয়মাবলি ও রিফান্ড পলিসি অনুযায়ী একটি নির্দিষ্ট সময়ের মধ্যে আবেদন পেন্ডিং ফি বাদে মূল টাকা অফিশিয়ালি ফেরত পাওয়া যায়।"
    },
    {
      q: "আমাদের মাধ্যমে প্রপার্টি কেনার সুবিধা কী?",
      a: "আমাদের প্ল্যাটফর্মের প্রতিটি প্রজেক্ট বিশেষজ্ঞদের দ্বারা ৪-ধাপের আইনি ও আইডিয়াল ধারাবাহিকতা পরীক্ষা করা থাকে। কোনো হিডেন মামলা, ভুয়া দলিল বা সরকারি খাস জমি সংক্রান্ত ঝামেলা থাকে না।"
    },
    {
      q: "কিস্তি বা EMI সুবিধা আছে কি?",
      a: "হ্যাঁ, আমাদের বেশিরভাগ রেডি ও আন্ডার-কনস্ট্রাকশন প্রজেক্টে ডেভেলপার কোম্পানির নিজস্ব নমনীয় কিস্তি সুবিধা রয়েছে। এছাড়া অংশীদার ব্যাংক বা আর্থিক প্রতিষ্ঠানগুলোর মাধ্যমে হোম লোন বা সুদমুক্ত সর্বোচ্চ কিস্তির সুবিধাও পাওয়া সম্ভব।"
    },
    {
      q: "আপনাদের office কোথায়?",
      a: "আমাদের প্রধান কার্যালয় এবং কাস্টমার সাপোর্ট কেয়ার সেন্টার ঢাকার গুলশানে অবস্থিত। এছাড়া সিলেট ও চট্টগ্রাম রিজিওনে আমাদের রিজিওনাল সাপোর্ট বা পার্টনার office রয়েছে। সরাসরি সাক্ষাতের জন্য যোগাযোগ বাটনে ক্লিক করে বুকিং দিন।"
    }
  ];

  return (
    <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="faq-accordion">
      <div className="text-center sm:text-left pb-2">
        <h3 className="text-md sm:text-lg font-bold text-[#C9A84C] font-bengali">জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3>
        <p className="text-[11px] text-slate-300 mt-0.5">সাধারণ কিছু প্রশ্ন ও তাদের উত্তর</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="space-y-3">
          {faqData.slice(0, 3).map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="bg-[#0A1D37]/45 border border-white/10 rounded overflow-hidden transition-all hover:border-[#C9A84C]/30"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-white hover:text-[#C9A84C] transition-colors"
                >
                  <span className="font-bengali text-left">{item.q}</span>
                  <ChevronDown className={"h-4 w-4 shrink-0 text-[#C9A84C] transition-transform " + (isOpen ? "rotate-180" : "")} />
                </button>
                
                {isOpen && (
                  <div className="p-4 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-white/5 font-bengali">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          {faqData.slice(3, 6).map((item, index) => {
            const actualIndex = index + 3;
            const isOpen = openFaqIndex === actualIndex;
            return (
              <div 
                key={actualIndex} 
                className="bg-[#0A1D37]/45 border border-white/10 rounded overflow-hidden transition-all hover:border-[#C9A84C]/30"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : actualIndex)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-white hover:text-[#C9A84C] transition-colors"
                >
                  <span className="font-bengali text-left">{item.q}</span>
                  <ChevronDown className={"h-4 w-4 shrink-0 text-[#C9A84C] transition-transform " + (isOpen ? "rotate-180" : "")} />
                </button>
                
                {isOpen && (
                  <div className="p-4 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-white/5 font-bengali">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}