"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";

export function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  const banners = [
    { 
      id: 1, 
      title: "Lịch Lãm Mỗi Ngày", 
      subtitle: "Bộ Sưu Tập Thu Đông", 
      cta: "Khám Phá Ngay", 
      link: "/products", 
      image: "https://images.unsplash.com/photo-1550614000-4b95d4ed79ea" 
    },
    { 
      id: 2, 
      title: "Phong Cách Tối Giản", 
      subtitle: "Casual Minimalist", 
      cta: "Xem Sản Phẩm", 
      link: "/products", 
      image: "https://images.unsplash.com/photo-1489987707023-afc8c1ce9f28" 
    },
    { 
      id: 3, 
      title: "Năng Động Cuối Tuần", 
      subtitle: "Streetwear X", 
      cta: "Mua Sắm Ngay", 
      link: "/products", 
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e" 
    },
  ];

  return (
    <div className="relative overflow-hidden w-full h-[65vh] min-h-[500px]" ref={emblaRef}>
      <div className="flex h-full">
        {banners.map((banner, index) => (
          <div className="relative flex-[0_0_100%] min-w-0" key={banner.id}>
             <Image 
                src={banner.image} 
                alt={banner.title} 
                fill 
                className="object-cover object-[center_30%]" 
                priority={index === 0}
                sizes="100vw"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
             
             <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-32 text-white text-center px-4">
                <span className="text-sm md:text-base font-semibold tracking-[0.25em] mb-4 text-slate-200">
                  {banner.subtitle.toUpperCase()}
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 drop-shadow-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {banner.title}
                </h1>
                <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-10 py-6 text-lg font-bold shadow-[0_4px_25px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 border-0">
                  <Link href={banner.link}>{banner.cta}</Link>
                </Button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
