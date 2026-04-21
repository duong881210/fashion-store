import { Suspense } from "react";
import { Metadata } from "next";

import { HeroCarousel } from "@/components/store/HeroCarousel";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { NewArrivals } from "@/components/store/NewArrivals";
import { PromoBanner } from "@/components/store/PromoBanner";
import { BestSellers } from "@/components/store/BestSellers";

export const metadata: Metadata = {
  title: "Trang chủ | FS Store",
  description: "Trải nghiệm mua sắm thời trang nam cao cấp, phong cách lịch lãm, hiện đại và trẻ trung.",
};

// Next 16 static revalidation (ISR)
export const revalidate = 3600;

export default function StoreHomepage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* 1. Hero Carousel: Auto-plays, heavily optimized Client boundaries */}
      <HeroCarousel />

      {/* 2. Categories Grid: Suspense wrapped Server Component fetching DB */}
      <Suspense fallback={
        <div className="py-16 mx-4 lg:mx-auto max-w-7xl w-full">
           <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-full mb-8" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-64 md:h-80 bg-slate-100 animate-pulse rounded-2xl w-full" />
              ))}
           </div>
        </div>
      }>
        <CategoryGrid />
      </Suspense>

      {/* 3. New Arrivals: Horizontal scroller fetching latest items */}
      <Suspense fallback={
        <div className="py-16 mx-4 lg:mx-auto max-w-7xl w-full border-t border-slate-100">
           <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-full mb-8" />
           <div className="flex gap-6 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                 <div key={i} className="min-w-[280px] h-[450px] bg-slate-50 animate-pulse rounded-xl" />
              ))}
           </div>
        </div>
      }>
        <NewArrivals />
      </Suspense>

      {/* 4. Promotional Action Banner */}
      <PromoBanner />

      {/* 5. Best Sellers: Static Grid displaying most sold items */}
      <Suspense fallback={
        <div className="py-16 mx-4 lg:mx-auto max-w-7xl w-full pt-24">
           <div className="flex flex-col items-center mb-12">
             <div className="h-10 w-80 bg-slate-200 animate-pulse rounded-full mb-4" />
             <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-full" />
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className="h-[350px] bg-slate-100 animate-pulse rounded-xl w-full" />
              ))}
           </div>
        </div>
      }>
        <BestSellers />
      </Suspense>
    </div>
  );
}
