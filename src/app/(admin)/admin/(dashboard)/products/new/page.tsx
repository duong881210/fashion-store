import { Metadata } from 'next';
import { ProductForm } from '../_components/ProductForm';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';

export const metadata: Metadata = {
  title: 'Quản Trị - Tạo Sản Phẩm',
};

export default async function CreateProductPage() {
  const caller = appRouter.createCaller(await createTRPCContext());
  const categories = await caller.category.getAll().catch(() => []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tạo Thuộc Tính / Sản Phẩm</h1>
      </div>
      <ProductForm categories={categories as any} />
    </div>
  );
}
