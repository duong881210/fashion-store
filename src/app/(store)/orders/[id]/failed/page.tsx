import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Đặt hàng thất bại | FS Store'
};

interface SearchParams {
  reason?: string;
}

export default async function OrderFailedPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const sp = await searchParams;
  const reason = sp.reason || "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.";

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 text-center w-full max-w-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 to-white -z-10" />
        
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
          <XCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đặt hàng thất bại
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          {reason}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" asChild className="h-14 px-8 border-slate-200 hover:bg-slate-50">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Về giỏ hàng
            </Link>
          </Button>
          <Button size="lg" asChild className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white">
            <Link href="/checkout">
              <RefreshCcw className="mr-2 h-5 w-5" />
              Thử lại thanh toán
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
