import ResetPasswordForm from './ResetPasswordForm';
import Image from 'next/image';
import { Suspense } from 'react';

export const metadata = {
  title: 'Đặt lại mật khẩu | FS Store',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Fashion Image */}
      <div className="hidden w-1/2 lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nâng Tầm Phong Cách Của Bạn
          </h2>
          <p className="text-lg text-white/90">
            Cổng thông tin bảo mật và quản lý tài khoản thành viên Fashion Store.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Suspense fallback={<div className="text-slate-500">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
