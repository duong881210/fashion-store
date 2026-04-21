import Image from "next/image";
import Link from "next/link";

import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/context";

export async function CategoryGrid() {
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  const categories = await caller.category.getAll();
  // Use a fallback image if none provided in the DB
  const defaultImages = [
    "https://images.unsplash.com/photo-1596755094514-f87e32f6b717",
    "https://images.unsplash.com/photo-1542272604-787c3835535d",
    "https://images.unsplash.com/photo-1489987707023-afc8c1ce9f28",
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f"
  ];

  return (
    <section className="py-16 mx-4 lg:mx-auto max-w-7xl">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          Danh Mục Nổi Bật
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.slice(0, 4).map((cat: any, idx: number) => (
          <Link 
            key={cat._id} 
            href={`/products?category=${cat.slug}`}
            className="group relative h-64 md:h-80 w-full overflow-hidden rounded-2xl block bg-slate-100"
          >
            <Image 
              src={cat.image || defaultImages[idx % defaultImages.length]} 
              alt={cat.name} 
              fill 
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform">
                {cat.name}
              </h3>
              <span className="text-sm font-medium text-white/80 flex items-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all">
                Khám phá <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
