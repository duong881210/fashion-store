import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Order } from '@/server/db/models/Order';
import { VnpayLog } from '@/server/db/models/VnpayLog';
import { verifySignature } from '@/lib/vnpay';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    await connectDB();

    const vnp_TxnRef = query.vnp_TxnRef; // order.orderCode
    const vnp_ResponseCode = query.vnp_ResponseCode;
    const vnp_TransactionNo = query.vnp_TransactionNo;
    const vnp_Amount = query.vnp_Amount; // in VND cents

    // 1. Verify Signature
    const isVerified = verifySignature(query);

    // 2. Log webhook request
    try {
      await VnpayLog.create({
        orderCode: vnp_TxnRef || 'UNKNOWN',
        type: 'ipn',
        query,
        verified: isVerified,
      });
    } catch (logError) {
      console.error('[VNPay Log Error in IPN]', logError);
    }

    if (!isVerified) {
      return NextResponse.json({ RspCode: '97', Message: 'Invalid signature' });
    }

    // 3. Find associated order
    const order = await Order.findOne({ orderCode: vnp_TxnRef });
    if (!order) {
      return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
    }

    // 4. Verify Amount (VNPAY amount is multiplied by 100)
    const amountFromVnpay = parseInt(vnp_Amount) / 100;
    if (amountFromVnpay !== order.total) {
      return NextResponse.json({ RspCode: '04', Message: 'Amount invalid' });
    }

    // 5. Verify Order State (Already paid)
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // 6. Process Payment Result
    if (vnp_ResponseCode === '00') {
      // Payment Successful
      order.paymentStatus = 'paid';
      if (order.status === 'pending') {
        order.status = 'confirmed'; // Auto-confirm order once payment is processed
      }
      
      order.timeline.push({
        status: 'paid',
        message: 'Thanh toán VNPay thành công (IPN)',
        timestamp: new Date(),
      } as any);

      await order.save();

      // Emit Socket.io notifications
      const io = (global as any).__io;
      if (io) {
        io.to(`user_${order.customer}`).emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: order.status,
          message: `Thanh toán thành công cho đơn hàng ${order.orderCode} (IPN)`,
        });

        io.to('admin_room').emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: order.status,
          paymentStatus: 'paid',
          message: `Đơn hàng ${order.orderCode} đã thanh toán thành công qua VNPay (IPN)`,
        });
      }
    } else {
      // Payment failed or cancelled
      // Log the failure to the order timeline but keep status as unpaid so they can retry.
      order.timeline.push({
        status: 'pending',
        message: `Giao dịch VNPay thất bại hoặc bị hủy (Mã: ${vnp_ResponseCode})`,
        timestamp: new Date(),
      } as any);
      
      await order.save();
    }

    return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error: any) {
    console.error('[VNPay IPN Error]', error);
    return NextResponse.json({ RspCode: '99', Message: 'Unknown error' });
  }
}
