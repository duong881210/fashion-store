import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/context";
import { ProductCard } from "./ProductCard";

export async function BestSellers() {
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  // Await fetch from backend directly mapped to Server Component
  const products = await caller.product.getBestSellers({ limit: 8 });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 mx-4 lg:mx-auto max-w-7xl pt-24">
      <div className="flex flex-col items-center text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Sản Phẩm Bán Chạy Nhất
        </h2>
        <p className="text-slate-500 max-w-2xl">
          Được hàng ngàn khách hàng tin dùng. Những items không thể thiếu trong tủ đồ của bạn.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 h-auto">
        {products.map((p: any) => (
           <div key={p._id} className="w-full">
              <ProductCard product={p as any} />
           </div>
        ))}
      </div>
    </section>
  );
}
