import { Suspense } from "react";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { ProductGrid } from "@/components/store/ProductGrid";
import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/context";

export const metadata = {
  title: "Sản phẩm",
  description: "Khám phá bộ sưu tập sản phẩm thời trang mới nhất, đa dạng kiểu dáng.",
};

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ProductsContent({ searchParamsPromise }: { searchParamsPromise: Promise<any> }) {
  const sp = await searchParamsPromise;
  const page = sp.page ? Number(sp.page) : 1;
  const limit = 12;
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const priceMin = sp.priceMin ? Number(sp.priceMin) : undefined;
  const priceMax = sp.priceMax ? Number(sp.priceMax) : undefined;
  const sizes = typeof sp.sizes === "string" ? sp.sizes.split(",") : undefined;
  const colors = typeof sp.colors === "string" ? sp.colors.split(",") : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);

  const [categories, productData] = await Promise.all([
    caller.category.getAll(),
    caller.product.getAll({
      page,
      limit,
      categorySlug,
      priceMin,
      priceMax,
      sizes,
      colors,
      sort: sort as any,
      search,
    }),
  ]);

  const displayTitle = search
    ? `Kết quả tìm kiếm cho: "${search}"`
    : categorySlug 
      ? categories.find((c: any) => c.slug === categorySlug)?.name || "Sản phẩm"
      : "Tất cả sản phẩm";

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 md:flex-shrink-0 sticky top-24">
        <FilterSidebar categories={categories} />
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1 w-full min-w-0">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{displayTitle}</h2>
        <div className="mb-6 flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
           <span className="text-sm font-medium text-slate-600">
             Hiển thị {productData.products.length} trên {productData.totalCount} sản phẩm
           </span>
        </div>
        
        <ProductGrid
          products={productData.products as any}
          totalPages={productData.totalPages}
          currentPage={productData.currentPage}
          baseUrl="/products"
          searchParams={sp}
        />
      </main>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Cửa hàng thời trang
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Cập nhật tủ đồ của bạn với những lựa chọn thời trang nam cao cấp nhất.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-64 md:flex-shrink-0 h-96 bg-slate-50 animate-pulse rounded-xl" />
          <main className="flex-grow h-[60vh] bg-slate-50 animate-pulse rounded-xl" />
        </div>
      }>
        <ProductsContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
