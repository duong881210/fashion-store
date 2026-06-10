import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { RefundClientTable } from './_components/RefundClientTable';

export const metadata: Metadata = {
  title: 'Quản Trị - Hoàn Tiền',
};

export default async function AdminRefundsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';

  const caller = appRouter.createCaller(await createTRPCContext());

  const initialData = await caller.order.getRefundRequests({
    page,
    limit: 15,
    status
  }).catch(() => ({ requests: [], total: 0, totalPages: 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Yêu Cầu Hoàn Tiền</h1>
      </div>
      <RefundClientTable initialData={initialData} />
    </div>
  );
}
