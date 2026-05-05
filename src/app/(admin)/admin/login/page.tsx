import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Fashion Store',
  description: 'Admin authentication portal',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full"></div></div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
