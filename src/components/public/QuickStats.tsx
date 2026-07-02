import React, { useState, useEffect } from 'react';
import { Building, Users, Layers, Globe } from 'lucide-react';

const BengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliNumStr(numStr: string): string {
  return numStr.split('').map(char => {
    const parsed = parseInt(char, 10);
    return isNaN(parsed) ? char : BengaliDigits[parsed];
  }).join('');
}

interface CountUpTextProps {
  target: number;
  suffix?: string;
  duration?: number;
  isBengali?: boolean;
}

function CountUpText({ target, suffix = '', duration = 1200, isBengali = false }: CountUpTextProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!active) return;
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    return () => {
      active = false;
    };
  }, [target, duration]);

  const displayedCount = isBengali ? toBengaliNumStr(count.toString()) : count.toString();
  return <span className="tabular-nums">{displayedCount}{suffix}</span>;
}

export default function AdminSidebarStats() {
  return (
    <section className="bg-white py-4.5 border-y border-slate-200/55 shadow-sm relative overflow-hidden" id="trust-ribbon">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:10px_10px]"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          {[
            { id: 0, icon: Building, isNumber: true, target: 600, suffix: "+", title: "মোট প্রকল্প", isBengali: true },
            { id: 1, icon: Users, isNumber: true, target: 20, suffix: "+", title: "অভিজ্ঞ পরামর্শক", isBengali: true },
            { id: 2, icon: Layers, isNumber: true, target: 36, suffix: "টি বিভাগ", title: "স্থায়ী উন্নত সেবা", isBengali: true },
            { id: 3, icon: Globe, isNumber: false, text: "প্রবাসী সেবা", title: "দেশের বাইরে সুবিধা" }
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-center space-x-2.5 text-left py-1 px-2"
              >
                <div className="p-1.5 bg-[#C9A84C]/10 text-[#b0923f] rounded-lg shrink-0">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-base sm:text-lg md:text-xl font-extrabold text-[#b0923f] leading-none flex items-center ${item.isBengali ? 'font-bengali' : 'font-sans'}`}>
                    {item.isNumber ? (
                      <CountUpText 
                        target={item.target!} 
                        suffix={item.suffix} 
                        isBengali={item.isBengali} 
                      />
                    ) : (
                      <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#b0923f] via-[#C9A84C] to-[#dba828] animate-pulse font-extrabold font-bengali">
                        {item.text}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-700 font-bengali mt-0.5 leading-none">
                    {item.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}