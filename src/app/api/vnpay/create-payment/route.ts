import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/server/db';
import { Order } from '@/server/db/models/Order';
import { createPaymentUrl } from '@/lib/vnpay';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (isRateLimited(ip, 20, 60 * 1000)) {
      return NextResponse.json(
        { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
        { status: 429 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Verify ownership
    if (order.customer.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Bạn không có quyền thanh toán đơn hàng này' }, { status: 403 });
    }

    // Verify status is pending and paymentStatus is unpaid
    if (order.status !== 'pending') {
      return NextResponse.json({ message: 'Đơn hàng đã được xử lý, không thể thanh toán lại' }, { status: 400 });
    }

    if (order.paymentStatus !== 'unpaid') {
      return NextResponse.json({ message: 'Đơn hàng đã được thanh toán' }, { status: 400 });
    }

    // Construct return URL
    const returnUrl = process.env.VNPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/vnpay/return`;

    const paymentUrl = createPaymentUrl({
      orderId: order.orderCode, // Use orderCode as vnp_TxnRef
      amount: order.total,
      orderInfo: `Thanh toan don hang ${order.orderCode}`,
      ipAddr: ip,
      returnUrl,
    });

    return NextResponse.json({ paymentUrl });
  } catch (error: any) {
    console.error('[Create Payment API Error]', error);
    return NextResponse.json({ message: error.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
