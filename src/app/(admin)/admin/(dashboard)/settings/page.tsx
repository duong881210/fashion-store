import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { SettingsClient } from './_components/SettingsClient';

export const metadata: Metadata = {
  title: 'Quản Trị - Cài Đặt',
};

export default async function AdminSettingsPage() {
  const caller = appRouter.createCaller(await createTRPCContext());
  
  const [settings, coupons] = await Promise.all([
    caller.settings.getSettings().catch(() => null),
    caller.coupon.getAll().catch(() => [])
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cài Đặt Hệ Thống</h1>
      </div>
      
      {settings && <SettingsClient initialSettings={JSON.parse(JSON.stringify(settings))} initialCoupons={JSON.parse(JSON.stringify(coupons))} />}
      {!settings && <p>Không thể tải cấu hình.</p>}
    </div>
  );
}
