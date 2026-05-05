import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';

export const metadata = {
  title: 'Đặt hàng thành công | FS Store'
};

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  let order = null;
  try {
    order = await caller.order.getById({ id });
  } catch (e) {
    // If not found or forbidden, just show a generic success or redirect
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 text-center w-full max-w-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white -z-10" />
        
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đặt hàng thành công!
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Cảm ơn bạn đã mua sắm tại FS Store. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
        </p>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 inline-block w-full max-w-sm border border-slate-100 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-500">Mã đơn hàng</span>
              <span className="font-bold text-slate-900">{order.orderCode}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-500">Ngày đặt</span>
              <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-500">Thanh toán</span>
              <span className="font-medium text-slate-900">{order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'VNPay'}</span>
            </div>
            <div className="flex justify-between items-center py-2 mt-2">
              <span className="text-slate-500">Tổng cộng</span>
              <span className="font-bold text-lg text-slate-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" asChild className="h-14 px-8 border-slate-200 hover:bg-slate-50">
            <Link href="/products">
              <Home className="mr-2 h-5 w-5" />
              Tiếp tục mua sắm
            </Link>
          </Button>
          <Button size="lg" asChild className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white">
            <Link href="/orders">
              <Package className="mr-2 h-5 w-5" />
              Xem đơn hàng
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
