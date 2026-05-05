import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { OrderClientTable } from './_components/OrderClientTable';

export const metadata: Metadata = {
  title: 'Quản Trị - Đơn Hàng',
};

export default async function AdminOrdersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const caller = appRouter.createCaller(await createTRPCContext());

  const initialData = await caller.order.getAll({
    page,
    limit: 10,
    search,
    status: status
  }).catch(() => ({ orders: [], total: 0, totalPages: 0 }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Đơn Hàng</h1>
      </div>
      <OrderClientTable initialData={initialData} />
    </div>
  );
}
