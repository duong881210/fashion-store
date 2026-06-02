import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminNotificationListener } from '@/components/admin/AdminNotificationListener';
import { Suspense } from 'react';

async function AdminAuthCheck() {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    redirect('/admin/login');
  }
  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={null}>
        <AdminAuthCheck />
      </Suspense>
      <AdminNotificationListener />
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto w-full p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
