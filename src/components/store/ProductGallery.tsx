"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export function ProductGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
    setSelectedIndex(index);
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return <div className="aspect-[3/4] bg-slate-100 rounded-xl w-full" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Swipeable Carousel */}
      <div className="md:hidden relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative aspect-[3/4]" key={index}>
              <Image src={src} alt="Product image" fill className="object-contain" priority={index === 0} sizes="100vw" />
            </div>
          ))}
        </div>
        
        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Layout (Thumbnails + Main Image) */}
      <div className="hidden md:flex flex-row gap-4 items-start h-[75vh]">
        {/* Thumbnails (Vertical scroll) */}
        <div className="flex flex-col gap-3 overflow-y-auto h-full scrollbar-hide py-1 pr-1 w-24 flex-shrink-0">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index ? "border-slate-900 shadow-sm" : "border-transparent opacity-70 hover:opacity-100 bg-slate-50"
              }`}
            >
              <Image src={src} alt="Thumbnail view" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>

        {/* Main Image with Zoom */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative h-full flex-1 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in group">
              <Image 
                src={images[selectedIndex]} 
                alt="Product view" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                priority 
                sizes="(max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
            <DialogTitle className="sr-only">Phóng to hình ảnh</DialogTitle>
            <div className="relative w-full h-[85vh]">
              <Image src={images[selectedIndex]} alt="Zoomed view" fill className="object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
