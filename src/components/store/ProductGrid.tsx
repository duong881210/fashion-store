import { ProductCardProps, ProductCard } from "./ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: ProductCardProps["product"][];
  currentPage: number;
  totalPages: number;
  baseUrl: string; // The base URL for pagination, e.g. /products?category=ao
  searchParams: Record<string, string | string[] | undefined>;
}

export function ProductGrid({ products, currentPage, totalPages, baseUrl, searchParams }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-xl border border-slate-100 h-[50vh]">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-slate-500 max-w-md">Chúng tôi không thể tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại. Vui lòng thử lại với các tiêu chí khác.</p>
      </div>
    );
  }

  // Construct pagination helper
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    // Copy existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    // Set new page
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage <= 1}
            className={`rounded-full ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Link href={getPageUrl(currentPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Trang trước</span>
            </Link>
          </Button>

          <div className="flex gap-1 items-center">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              // Show only a subset of pages if there are many (naive approach for now)
              if (
                totalPages > 5 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 1
              ) {
                if (page === 2 || page === totalPages - 1) return <span key={page} className="px-2 text-slate-400">...</span>;
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  asChild
                  className={`rounded-full w-10 h-10 font-medium ${isActive ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Link href={getPageUrl(page)}>{page}</Link>
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage >= totalPages}
            className={`rounded-full ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Link href={getPageUrl(currentPage + 1)}>
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Trang sau</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
