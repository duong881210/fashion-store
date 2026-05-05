import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';

export const metadata = {
  title: 'Lịch sử đơn hàng | FS Store'
};

export default async function OrdersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/orders');
  }

  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  let initialData = { orders: [], totalPages: 0 };
  try {
    initialData = await caller.order.getMyOrders({ page: 1, limit: 10 });
  } catch (e) {
    console.error("Failed to fetch orders", e);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl min-h-[60vh]">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Lịch sử Đơn hàng
      </h1>
      <OrdersClient initialData={initialData as any} />
    </div>
  );
}
