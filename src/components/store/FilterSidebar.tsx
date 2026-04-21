"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterSidebarProps {
  categories: { slug: string; name: string }[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const initialCategory = searchParams.get("category") || "";
  const initialMinPrice = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : 0;
  const initialMaxPrice = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : 5000000;
  const initialSizes = searchParams.get("sizes") ? searchParams.get("sizes")!.split(",") : [];

  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  
  // Custom hook or manual sync for debounced price
  useEffect(() => {
    const min = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : 0;
    const max = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : 5000000;
    setPriceRange([min, max]);
  }, [searchParams]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Changing filters should reset to page 1
    params.delete("page");

    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceCommit = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("priceMin", value[0].toString());
    params.set("priceMax", value[1].toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSizeToggle = (size: string) => {
    const currentSizes = searchParams.get("sizes") ? searchParams.get("sizes")!.split(",") : [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    updateFilters("sizes", newSizes.length > 0 ? newSizes.join(",") : null);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => k !== 'page' && k !== 'sort');

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="w-full flex md:flex-col gap-6">
      <div className="hidden md:flex justify-between items-center pb-4 border-b border-slate-100">
        <h2 className="text-xl flex items-center font-bold tracking-tight text-slate-900">
          Bộ Lọc
        </h2>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-sm h-8 px-2 text-slate-500 hover:text-red-500">
            Xóa tất cả
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="md:hidden flex justify-end">
           <Button variant="outline" onClick={clearFilters} className="text-sm h-8 mt-2 text-slate-500 hover:text-red-500 w-full">
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["categories", "price", "size"]} className="w-full space-y-4">
        {/* CATEGORIES */}
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline text-base font-semibold text-slate-800">
            Danh mục
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="cat-all" 
                checked={!initialCategory}
                onCheckedChange={() => updateFilters("category", null)}
              />
              <label htmlFor="cat-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600">
                Tất cả sản phẩm
              </label>
            </div>
            {categories.map((cat) => (
              <div key={cat.slug} className="flex items-center space-x-3">
                <Checkbox 
                  id={`cat-${cat.slug}`} 
                  checked={initialCategory === cat.slug}
                  onCheckedChange={() => updateFilters("category", cat.slug)}
                  className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                />
                <label 
                  htmlFor={`cat-${cat.slug}`} 
                  className={`text-sm font-medium leading-none select-none cursor-pointer ${initialCategory === cat.slug ? 'text-slate-900' : 'text-slate-600'}`}
                >
                  {cat.name}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-slate-100 hidden md:block w-full"></div>

        {/* PRICE RANGE */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline text-base font-semibold text-slate-800">
            Mức giá
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <Slider
              defaultValue={[initialMinPrice, initialMaxPrice]}
              value={priceRange}
              min={0}
              max={5000000}
              step={50000}
              onValueChange={(val) => setPriceRange([val[0], val[1]])}
              onValueCommit={handlePriceCommit}
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 shadow-sm w-24 text-center">
                {(priceRange[0] / 1000).toFixed(0)}k đ
              </div>
              <span className="text-slate-400 text-sm">-</span>
              <div className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 shadow-sm w-24 text-center">
                {(priceRange[1] / 1000).toFixed(0)}k đ
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-slate-100 hidden md:block w-full"></div>

        {/* SIZE FILTER */}
        <AccordionItem value="size" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline text-base font-semibold text-slate-800">
            Kích thước
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="grid grid-cols-3 gap-2">
              {availableSizes.map((size) => {
                const isSelected = initialSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`h-10 text-xs font-semibold rounded-md border transition-all ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
