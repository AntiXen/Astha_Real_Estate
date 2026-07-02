import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface TestimonialsProps {
  onScrollToLeadForm: () => void;
}

export default function Testimonials({ onScrollToLeadForm }: TestimonialsProps) {
  // Testimonial interactive states
  const [testimonialLikes, setTestimonialLikes] = useState<{ [key: number]: number }>({
    0: 18,
    1: 34,
    2: 47
  });
  const [testimonialUserHasLiked, setTestimonialUserHasLiked] = useState<{ [key: number]: boolean }>({});
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);

  const testimonialsData = [
    {
      id: 0,
      quote: "দলিলপত্র নিয়ে আমার মনে যে দুশ্চিন্তা ছিল তা আস্থার ঠিকানার লিগ্যাল টিম এসে দূর করে দিয়েছে। ইস্টার্ন হাউজিং এর প্রজেক্টটিতে সরাসরি মালিকানার ধারাবাহিক দলিল মিলিয়ে নির্ভয়ে বুকিং দিতে পেরেছি।",
      name: "মোস্তাফা জামান রাজু",
      role: "আবাসিক ক্রেতা, মিরপুর",
      initial: "এম",
      rating: 5,
      story: "মোস্তাফা জামান রাজু মিরপুর ১২-তে একটি লাক্সারি অ্যাপার্টমেন্ট কিনতে গিয়ে দলিলের ধারাবাহিকতা ও মিউটেশন নিয়ে বেশ চিন্তিত ছিলেন। আস্থার ঠিকানার এক্সপার্ট লিগ্যাল টিম সমস্ত ভায়া দলিল, জোত খতিয়ান এবং নামজারি পুঙ্খানুপুঙ্খভাবে যাচাই করে সঠিক রিপোর্ট প্রদান করেন। এরপরই তিনি শতভাগ নিশ্চিন্তে বুকিং সম্পন্ন করে নিজের স্থায়ী ফ্ল্যাটের আইনি নিরাপত্তা নিশ্চিত করেন।",
      verifiedFeatures: ["ভায়া দলিল চেইন চেক সফল", "নামজারি খতিয়ান ভেরিফিকেশন", "রাজউক লে-আউট প্ল্যান অনুমোদন"]
    },
    {
      id: 1,
      quote: "একজন প্রবাসী হিসেবে বাংলাদেশ প্রপার্টি কেনা আমার কাছে সবসময় ঝুঁকিপূর্ণ মনে হতো। কিন্তু আস্থা রীয়াল এস্টেট আমার সাব-রেজিস্ট্রি এবং নামজারি কাজ সম্পূর্ণ স্বচ্ছতার সাথে সম্পন্ন করে দিয়েছে।",
      name: "কামরুল আহসান চৌধুরী",
      role: "লন্ডন প্রবাসী, সিলেট প্রবাসী জোন",
      initial: "ক",
      rating: 5,
      story: "লন্ডন প্রবাসী কামরুল আহসান চৌধুরী দূর প্রবাসে থাকায় বাংলাদেশে রিয়েল এস্টেট বিনিয়োগ নিয়ে আস্থাহীনতায় ভুগছিলেন। আমাদের মাধ্যমে তিনি প্রপার্টির ভিডিও বুকিং থেকে শুরু করে আমমোক্তারনামা এবং সর্বশেষ সাব-রেজিস্ট্রির পুরো প্রক্রিয়া ডিজিটাল ট্র্যাকিং ও আইনি সহায়তার মাধ্যমে সম্পন্ন করেছেন, যাতে তার ১ টাকাও ক্ষতি হয়নি।",
      verifiedFeatures: ["অনলাইন জুম লাইভ সাইট ভিজিট", "পাওয়ার অব অ্যাটর্নি আইনি স্ক্রুটিনি", "ঝুঁকিমুক্ত রেজিস্ট্রি দলিল সম্পাদন"]
    },
    {
      id: 2,
      quote: "কোন প্রকার হিডেন চার্জ ছাড়াই সরাসরি এজেন্সির মূল্যে গ্রিন ভ্যালি কমার্শিয়ালের ৩টি অফিস ফ্লোর কিনে আমাদের কর্পোরেট ব্যবসা সম্প্রসারণ সহজে করতে পেরেছি।",
      name: "ড. জেেস্মন আক্তার",
      role: "ম্যানেজিং ডিরেক্টর, বায়োফাইন বাংলাদেশ",
      initial: "জে",
      rating: 5,
      story: "বায়োফাইন বাংলাদেশের ব্যবসা সম্প্রসারণের জন্য গুলশানে কমার্শিয়াল স্পেসের খোঁজ করছিলেন ড. জেसमিন আক্তার। আস্থার ঠিকানা কোনো অতিরিক্ত ফিজিক্যাল ব্রোকারেজ ফি বা মধ্যস্থতাকারী চার্জ ছাড়াই সরাসরি ডেভেলপার কোম্পানির অফিশিয়াল কর্পোরেট ডিসকাউন্টে ৩টি ফ্লোরের ডিলটি স্বচ্ছ আইনি প্রক্রিয়ায় করিয়ে দেয়।",
      verifiedFeatures: ["০% গোপন ব্রোকারেজ ফি গ্যারান্টি", "কমার্শিয়াল ইউটিলিটি নকশা যাচাই", "সরাসরি ডেভলপার কর্পোরেট এগ্রিমেন্ট"]
    }
  ];

  return (
    <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="testimonials">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-[#C9A84C] uppercase bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/35 inline-block font-bengali">
          গ্রাহক সন্তুষ্টি আমাদের মূল লক্ষ্য
        </span>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C9A84C] font-bengali leading-tight">
          আস্থা ও ভালোবাসায় আমাদের গ্রাহক পরিবার
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 font-bengali max-w-2xl mx-auto leading-relaxed">
          নিরাপদ ও ঝামেলামুক্ত উপায়ে ডিল সম্পন্ন করে যারা আস্থার ঠিকানা খুঁজে পেয়েছে, শুনুন তাদের বাস্তব অভিজ্ঞতা
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonialsData.map((item) => {
          const hasLiked = !!testimonialUserHasLiked[item.id];
          const likesCount = testimonialLikes[item.id] || 0;

          return (
            <div 
              key={item.id} 
              onClick={() => setSelectedTestimonial(item)}
              className="group relative bg-[#071930] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:border-[#C9A84C]/40 transition-all duration-300 text-left flex flex-col justify-between space-y-4 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>

              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#C9A84C] fill-[#C9A84C]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-bengali font-semibold group-hover:text-white transition-colors duration-200">
                  "{item.quote}"
                </p>

                <button 
                  className="pt-1 text-[#C9A84C] text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 hover:underline font-bengali"
                >
                  <span>বিস্তারিত কেস স্টাডি দেখুন</span>
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>

              <div className="border-t border-white/5 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a38435] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center font-sans shadow-md ring-2 ring-white/10">
                    {item.initial}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white font-bengali tracking-wide">{item.name}</div>
                    <div className="text-[10px] sm:text-xs text-[#C9A84C] font-semibold font-bengali mt-0.5">{item.role}</div>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTestimonialLikes(prev => ({
                      ...prev,
                      [item.id]: hasLiked ? prev[item.id] - 1 : prev[item.id] + 1
                    }));
                    setTestimonialUserHasLiked(prev => ({
                      ...prev,
                      [item.id]: !hasLiked
                    }));
                  }}
                  className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    hasLiked 
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A1D37] scale-102 shadow-md' 
                      : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white hover:border-[#C9A84C]/30'
                  }`}
                  title="এই রিভিউটি সহায়ক মনে হলে লাইক দিন"
                >
                  <ThumbsUp className={`h-3 w-3 shrink-0 transition-transform ${hasLiked ? 'fill-[#0A1D37] scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-[10px] font-bold font-bengali">সহায়ক ({likesCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Study Modal Overlay */}
      <AnimatePresence>
        {selectedTestimonial && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedTestimonial(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#071930] w-full max-w-2xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedTestimonial(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center space-x-1">
                  {[...Array(selectedTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#C9A84C] fill-[#C9A84C]" />
                  ))}
                </div>

                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded">সাকসেস স্টোরি কেস স্টাডি</span>
                  <h4 className="text-xl sm:text-2xl font-black text-white font-bengali leading-snug mt-1">
                    "{selectedTestimonial.quote}"
                  </h4>
                </div>

                <div className="flex items-center space-x-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a38435] text-white text-base font-extrabold flex items-center justify-center font-sans tracking-tight">
                    {selectedTestimonial.initial}
                  </div>
                  <div className="text-left">
                    <h5 className="text-base sm:text-md font-bold text-white font-bengali">{selectedTestimonial.name}</h5>
                    <p className="text-xs sm:text-xs text-[#C9A84C] font-semibold font-bengali">{selectedTestimonial.role}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-left font-bengali">
                  <h6 className="text-[#C9A84C] text-sm sm:text-base font-bold">আস্থার ঠিকানার মাধ্যমে আইনি সত্যতা যাচাই:</h6>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    {selectedTestimonial.story}
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left font-bengali border-t border-white/10">
                  <h6 className="text-[#C9A84C] text-sm sm:text-base font-bold">আমাদের ভেরিফিকেশন পদক্ষেপের তালিকা:</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTestimonial.verifiedFeatures.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 font-medium">
                        <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => {
                      setSelectedTestimonial(null);
                      setTimeout(() => {
                        onScrollToLeadForm();
                      }, 150);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A1D37] text-sm font-bold font-bengali hover:bg-[#b0923f] transition-all cursor-pointer text-center"
                  >
                    বিনামূল্যে আইনি পরামর্শ নিন
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}