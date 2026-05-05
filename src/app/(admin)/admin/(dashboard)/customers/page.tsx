import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { CustomerClientTable } from './_components/CustomerClientTable';

export const metadata: Metadata = {
  title: 'Quản Trị - Khách Hàng',
};

export default async function AdminCustomersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const caller = appRouter.createCaller(await createTRPCContext());
  
  const initialData = await caller.user.getAll({
    page,
    limit: 10,
    search
  }).catch(() => ({ users: [], total: 0, totalPages: 0 }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Khách Hàng</h1>
      </div>
      <CustomerClientTable initialData={initialData as any} />
    </div>
  );
}
