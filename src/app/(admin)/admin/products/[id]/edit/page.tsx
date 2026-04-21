import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductForm } from '../../_components/ProductForm';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import connectDB from '@/server/db';
import { Product } from '@/server/db/models/Product';

export const metadata: Metadata = {
  title: 'Admin - Edit Product',
};

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const caller = appRouter.createCaller(await createTRPCContext());
  
  await connectDB();
  const product = await Product.findById(id).lean();
  
  if (!product) {
    notFound();
  }

  const categories = await caller.category.getAll().catch(() => []);

  // Pass JSON serializable data
  const initialData = JSON.parse(JSON.stringify(product));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>
      <ProductForm initialData={initialData} categories={categories as any} />
    </div>
  );
}
