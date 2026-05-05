import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { ProductClientTable } from './_components/ProductClientTable';

export const metadata: Metadata = {
  title: 'Quản Trị - Sản Phẩm',
};

export default async function AdminProductsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const caller = appRouter.createCaller(await createTRPCContext());
  
  const initialData = await caller.product.getAdminList({
    page,
    limit: 10,
    search,
    category,
    status: status as any
  }).catch(() => ({ products: [], total: 0, page: 1, totalPages: 0 }));

  const categories = await caller.category.getAll().catch(() => []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bảng Điều Khiển Sản Phẩm</h1>
      </div>
      <ProductClientTable 
        initialData={initialData as any} 
        categories={categories as any} 
      />
    </div>
  );
}
