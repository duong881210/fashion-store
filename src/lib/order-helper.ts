import { User } from '@/server/db/models/User';
import { sendEmail, orderConfirmedTemplate } from '@/lib/email';

/**
 * Handles actions that should happen immediately after an order is successfully paid.
 * E.g., sending the confirmation email and emitting real-time admin socket notifications.
 */
export async function handleOrderPaymentSuccess(order: any) {
  // 1. Send confirmation email
  try {
    const user = await User.findById(order.customer);
    if (user && user.email) {
      await sendEmail(
        user.email,
        `Xác nhận đơn hàng #${order.orderCode} | Fashion Store`,
        orderConfirmedTemplate({
          customerName: order.shippingAddress.fullName,
          orderCode: order.orderCode,
          orderId: order._id.toString(),
          items: order.items,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount,
          total: order.total,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
        })
      );
      console.log(`[Email Success] Paid order confirmation sent to: ${user.email} for order: ${order.orderCode}`);
    }
  } catch (emailError) {
    console.error('[Email Error in handleOrderPaymentSuccess]', emailError);
  }

  // 2. Emit Socket.io notification for new order to admin
  try {
    const io = (global as any).__io;
    if (io) {
      io.to('admin_room').emit('order:new', {
        orderId: order._id.toString(),
        orderCode: order.orderCode,
        customerName: order.shippingAddress.fullName,
        total: order.total,
        createdAt: order.createdAt?.toISOString() || new Date().toISOString()
      });
      console.log(`[Socket Emit order:new] Emitted for order: ${order.orderCode}`);
    }
  } catch (socketError) {
    console.error('[Socket Error in handleOrderPaymentSuccess]', socketError);
  }
}
