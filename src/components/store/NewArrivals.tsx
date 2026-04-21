import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/context";
import { ProductCard } from "./ProductCard";

export async function NewArrivals() {
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  // Await fetch from backend directly mapped to Server Component
  const products = await caller.product.getNewArrivals({ limit: 8 });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 mx-4 lg:mx-auto max-w-7xl border-t border-slate-100">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Hàng Mới Về
          </h2>
          <p className="text-slate-500 max-w-xl">Cập nhật ngay những thiết kế mới nhất trong bộ sưu tập tuần này.</p>
        </div>
        <a href="/products?sort=newest" className="text-sm font-medium text-slate-900 hover:text-slate-600 hidden md:block underline underline-offset-4 decoration-slate-300">
          Xem tất cả
        </a>
      </div>

      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {products.map((p: any) => (
           <div key={p._id} className="min-w-[280px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink w-full h-[450px]">
              <ProductCard product={p as any} />
           </div>
        ))}
      </div>
    </section>
  );
}
