import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Order } from '@/server/db/models/Order';
import { VnpayLog } from '@/server/db/models/VnpayLog';
import { verifySignature } from '@/lib/vnpay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());

  await connectDB();

  const vnp_TxnRef = query.vnp_TxnRef; // This is our order.orderCode
  const vnp_ResponseCode = query.vnp_ResponseCode;
  const vnp_TransactionNo = query.vnp_TransactionNo;
  const vnp_Amount = query.vnp_Amount; // in VND cents (multiplied by 100)

  // 1. Verify Signature
  const isVerified = verifySignature(query);

  // 2. Log transaction callback
  try {
    await VnpayLog.create({
      orderCode: vnp_TxnRef || 'UNKNOWN',
      type: 'return',
      query,
      verified: isVerified,
    });
  } catch (logError) {
    console.error('[VNPay Log Error in Return]', logError);
  }

  // 3. Find the associated order
  const order = await Order.findOne({ orderCode: vnp_TxnRef });

  if (!isVerified) {
    if (order) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/failed?reason=Sai chữ ký bảo mật giao dịch`
      );
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders?error=signature_invalid`);
  }

  if (!order) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders?error=order_not_found`);
  }

  // 4. Handle VNPAY Response
  if (vnp_ResponseCode === '00') {
    // Verify amount (VNPAY amount is multiplied by 100)
    const amountFromVnpay = parseInt(vnp_Amount) / 100;
    if (amountFromVnpay !== order.total) {
      // Fraud prevention
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/failed?reason=Số tiền thanh toán không hợp lệ`
      );
    }

    // Update order status if it is not already marked as paid (Idempotency)
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      if (order.status === 'pending') {
        order.status = 'confirmed'; // Auto-confirm once paid
      }
      
      // Store transaction details
      if (vnp_TransactionNo) {
        order.vnpayTransactionNo = Array.isArray(vnp_TransactionNo) ? vnp_TransactionNo[0] : String(vnp_TransactionNo);
      }
      if (query.vnp_PayDate) {
        order.vnpayPayDate = Array.isArray(query.vnp_PayDate) ? query.vnp_PayDate[0] : String(query.vnp_PayDate);
      }

      // Add timeline entry
      order.timeline.push({
        status: 'paid',
        message: 'Thanh toán VNPay thành công',
        timestamp: new Date(),
      } as any);

      // Save order
      await order.save();

      // Send confirmation email and notify admin via Socket
      const { handleOrderPaymentSuccess } = await import('@/lib/order-helper');
      await handleOrderPaymentSuccess(order);

      // Emit Socket.io notifications
      const io = (global as any).__io;
      if (io) {
        // Emit update to user room
        io.to(`user_${order.customer}`).emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: order.status,
          message: `Thanh toán thành công cho đơn hàng ${order.orderCode}`,
        });

        // Emit update to admin room
        io.to('admin_room').emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: order.status,
          paymentStatus: 'paid',
          message: `Đơn hàng ${order.orderCode} đã thanh toán thành công qua VNPay`,
        });
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/success`);
  } else {
    // Map response codes or output a generic cancellation message
    const errorReason = vnp_ResponseCode === '24' 
      ? 'Giao dịch bị hủy bởi khách hàng.' 
      : `Lỗi thanh toán từ VNPay (Mã lỗi: ${vnp_ResponseCode})`;

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/failed?reason=${encodeURIComponent(errorReason)}`
    );
  }
}
