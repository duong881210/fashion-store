import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  products: any[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 border-t border-slate-100 mt-16">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          Có Thể Bạn Sẽ Thích
        </h2>
        <a href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block underline underline-offset-4 decoration-slate-300">
          Xem tất cả
        </a>
      </div>

      {/* Mobile Horizontal Scroll, Desktop Grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-4 sm:pb-0 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {products.map((product) => (
          <div key={product._id} className="min-w-[260px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
