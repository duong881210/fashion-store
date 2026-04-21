"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) { seconds--; }
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden relative my-16 mx-4 lg:mx-auto max-w-7xl shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5')] bg-cover bg-center bg-no-repeat opacity-20 transition-transform duration-[20s] hover:scale-110" />
      <div className="relative z-10 px-6 py-14 md:py-20 md:px-12 flex flex-col items-center text-center">
        <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(234,88,12,0.6)]">
          Flash Sale - Chỉ trong tuần này
        </span>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đại Tiệc Giảm Giá Cuối Mùa
        </h2>
        <p className="text-slate-300 max-w-2xl mb-10 text-base md:text-lg">
          Sở hữu ngay những item phong cách nhất với mức giá không tưởng. Ưu đãi lên tới 50% cho toàn bộ sản phẩm áo khoác và phụ kiện nam.
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-10">
          <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-bold border border-white/20 shadow-inner">{format(timeLeft.hours)}</div>
             <span className="text-[10px] sm:text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Giờ</span>
          </div>
          <span className="text-3xl font-bold text-slate-600 mb-6">:</span>
          <div className="flex flex-col items-center">
             <div className="bg-white/10 backdrop-blur-md rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-bold border border-white/20 shadow-inner">{format(timeLeft.minutes)}</div>
             <span className="text-[10px] sm:text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Phút</span>
          </div>
          <span className="text-3xl font-bold text-slate-600 mb-6">:</span>
          <div className="flex flex-col items-center">
             <div className="bg-white/10 backdrop-blur-md rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-bold border border-white/20 shadow-inner text-orange-400">{format(timeLeft.seconds)}</div>
             <span className="text-[10px] sm:text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Giây</span>
          </div>
        </div>

        <Link href="/products" className="group inline-flex items-center justify-center bg-white text-slate-900 rounded-full px-8 py-4 font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          Khám Phá Ngay <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
