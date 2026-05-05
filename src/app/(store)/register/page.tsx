import RegisterForm from '@/components/store/auth/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Image */}
      <div className="hidden w-1/2 lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
          alt="Fashion Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-10 left-10 text-white">
          <h2 className="text-4xl font-bold">Tham Gia Cùng Chúng Tôi</h2>
          <p className="mt-2 text-lg text-white/90">Mở khóa các ưu đãi độc quyền và cập nhật sớm các bộ sưu tập mới.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 overflow-y-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
