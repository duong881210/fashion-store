import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { redirect } from 'next/navigation';
// Assume auth() is exported from our local next-auth config or we could import from 'next-auth' directly if configured.
// For now we'll create a dummy auth import if undefined, but ideally it should match the actual setup.
// We'll use next-auth v5 beta pattern
import { auth } from '@/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side route protection
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
