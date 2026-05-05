import LoginForm from '@/components/store/auth/LoginForm';
import Image from 'next/image';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Image */}
      <div className="hidden w-1/2 lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-4xl font-bold mb-4">Nâng Tầm Phong Cách Của Bạn</h2>
          <p className="text-lg text-white/90">Khám phá các xu hướng mới nhất và bộ sưu tập độc quyền được chọn lọc dành riêng cho bạn.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
