import { auth } from '@/auth';
import CartClient from './CartClient';

export const metadata = {
  title: 'Giỏ hàng | FS Store',
  description: 'Kiểm tra và thanh toán giỏ hàng của bạn tại FS Store.',
};

export default async function CartPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl min-h-[60vh]">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Giỏ hàng của bạn
      </h1>
      
      <CartClient isLoggedIn={!!session?.user} />
    </div>
  );
}
