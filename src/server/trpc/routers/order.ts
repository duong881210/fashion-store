import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import mongoose from 'mongoose';
import { router, protectedProcedure, adminProcedure } from '../middleware';
import { Order } from '../../db/models/Order';
import { Cart } from '../../db/models/Cart';
import { Product } from '../../db/models/Product';
import { Coupon } from '../../db/models/Coupon';
import { User } from '../../db/models/User';
import connectDB from '../../db';
import { sendEmail, orderConfirmedTemplate, orderStatusTemplate } from '@/lib/email';
import { revalidateTag } from 'next/cache';
import { VnpayLog } from '../../db/models/VnpayLog';
import { RefundRequest } from '../../db/models/RefundRequest';
import { processVnpayRefund } from '@/lib/vnpay';

function invalidateProductCaches() {
  try {
    revalidateTag('featured-products', 'default');
    revalidateTag('new-arrivals', 'default');
    revalidateTag('best-sellers', 'default');
    revalidateTag('product-details', 'default');
  } catch (e) {
    console.error('Failed to invalidate tags:', e);
  }
}

export const orderRouter = router({
  create: protectedProcedure
    .input(z.object({
      shippingAddress: z.object({
        fullName: z.string(),
        phone: z.string(),
        street: z.string(),
        ward: z.string(),
        district: z.string(),
        province: z.string()
      }),
      paymentMethod: z.enum(['vnpay', 'cod']),
      couponCode: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.items.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Giỏ hàng trống' });
      }

      // Start Transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let subtotal = 0;
        const orderItems: any[] = [];

        for (const item of cart.items) {
          // decrement stock atomically and check if stock is sufficient
          const product = await Product.findOneAndUpdate(
            { 
              _id: item.product, 
              'variants.color': item.color,
              'variants.sizes': {
                $elemMatch: {
                  size: item.size,
                  stock: { $gte: item.quantity }
                }
              }
            },
            {
              $inc: {
                'variants.$[v].sizes.$[s].stock': -item.quantity,
                'sold': item.quantity
              }
            },
            {
              arrayFilters: [
                { 'v.color': item.color },
                { 's.size': item.size }
              ],
              new: true,
              session
            }
          );

          if (!product) {
            throw new Error(`Sản phẩm ${item.productName} không đủ số lượng hoặc đã hết hàng.`);
          }

          const price = product.salePrice || product.price;
          subtotal += price * item.quantity;

          orderItems.push({
            product: item.product,
            productName: item.productName,
            productImage: item.productImage,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price
          });
        }

        let discount = 0;
        let couponId = undefined;

        if (input.couponCode) {
          const coupon = await Coupon.findOne({ code: input.couponCode.toUpperCase() }).session(session);
          if (!coupon || !coupon.isActive || new Date() > new Date(coupon.expiresAt) || coupon.usedCount >= coupon.usageLimit || subtotal < coupon.minOrderValue || coupon.usedBy.includes(userId as any)) {
            throw new Error('Mã giảm giá không hợp lệ');
          }

          if (coupon.type === 'fixed') {
            discount = coupon.value;
          } else {
            discount = Math.floor((subtotal * coupon.value) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
          }

          couponId = coupon._id;
          
          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usedCount: 1 },
            $push: { usedBy: userId }
          }, { session });
        }

        // Assuming shipping is 30k for now, can be dynamic
        const shippingFee = 30000;
        const total = subtotal + shippingFee - discount;

        const order = new Order({
          customer: userId,
          items: orderItems,
          subtotal,
          shippingFee,
          discount,
          total,
          coupon: couponId,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          status: 'pending',
          paymentStatus: 'unpaid',
          timeline: [] // pre-save will add the first entry
        });

        await order.save({ session });

        // Clear Cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();
        invalidateProductCaches();

        // Send order confirmation email (fire-and-forget)
        User.findById(userId).then((user) => {
          if (user && user.email) {
            sendEmail(
              user.email,
              `Xác nhận đơn hàng #${order.orderCode} | Fashion Store`,
              orderConfirmedTemplate({
                customerName: input.shippingAddress.fullName,
                orderCode: order.orderCode,
                orderId: order._id.toString(),
                items: orderItems,
                subtotal,
                shippingFee,
                discount,
                total,
                shippingAddress: input.shippingAddress,
                paymentMethod: input.paymentMethod,
              })
            );
          }
        }).catch((err) => {
          console.error('[Email Trigger Error in Order Creation]', err);
        });

        // Emit new order to admin
        ctx.io?.to('admin_room').emit('order:new', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          customerName: input.shippingAddress.fullName,
          total,
          createdAt: (order as any).createdAt?.toISOString() || new Date().toISOString()
        });

        return { orderId: order._id, orderCode: order.orderCode, paymentMethod: input.paymentMethod, total };
      } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message || 'Lỗi khi tạo đơn hàng' });
      }
    }),

  getMyOrders: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      status: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      await connectDB();
      const skip = (input.page - 1) * input.limit;
      const query: any = { customer: ctx.session.user.id };
      
      if (input.status && input.status !== 'all') {
        query.status = input.status;
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      return {
        orders: JSON.parse(JSON.stringify(orders)),
        total,
        totalPages: Math.ceil(total / input.limit)
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await connectDB();
      const order = await Order.findById(input.id).lean();
      
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      
      if (order.customer.toString() !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      return JSON.parse(JSON.stringify(order));
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const order = await Order.findById(input.id).session(session);
        if (!order) throw new Error('Order not found');
        
        if (order.customer.toString() !== ctx.session.user.id) {
          throw new Error('Forbidden');
        }

        if (order.status !== 'pending') {
          throw new Error('Chỉ có thể hủy đơn hàng đang chờ xác nhận');
        }

        // Restore stock
        for (const item of order.items) {
          await Product.findOneAndUpdate(
            { _id: item.product },
            {
              $inc: {
                'variants.$[v].sizes.$[s].stock': item.quantity,
                'sold': -item.quantity
              }
            },
            {
              arrayFilters: [
                { 'v.color': item.color },
                { 's.size': item.size }
              ],
              session
            }
          );
        }

        // Restore coupon
        if (order.coupon) {
          await Coupon.findByIdAndUpdate(order.coupon, {
            $inc: { usedCount: -1 },
            $pull: { usedBy: ctx.session.user.id }
          }, { session });
        }

        order.status = 'cancelled';
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();
        invalidateProductCaches();

        return JSON.parse(JSON.stringify(order));
      } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      }
    }),
    
  getAll: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      status: z.string().optional(),
      paymentStatus: z.string().optional(),
      search: z.string().optional(),
      customerId: z.string().optional(),
      cursor: z.number().optional()
    }))
    .query(async ({ input }) => {
      await connectDB();
      const currentPage = input.cursor ?? input.page;
      const skip = (currentPage - 1) * input.limit;
      const query: any = {};
      
      if (input.status && input.status !== 'all') query.status = input.status;
      if (input.paymentStatus && input.paymentStatus !== 'all') query.paymentStatus = input.paymentStatus;
      if (input.customerId) query.customer = input.customerId;
      if (input.search) {
        query.orderCode = { $regex: input.search, $options: 'i' };
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .populate('customer', 'name email')
          .lean(),
        Order.countDocuments(query)
      ]);

      return {
        orders: JSON.parse(JSON.stringify(orders)),
        total,
        totalPages: Math.ceil(total / input.limit),
        nextCursor: (currentPage * input.limit < total) ? currentPage + 1 : undefined
      };
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded']),
      paymentStatus: z.enum(['unpaid', 'paid', 'refunded']).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const order = await Order.findById(input.id);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      
      const oldStatus = order.status;

      if (input.status && order.status !== input.status) {
        order.status = input.status;
      }
      
      if (input.paymentStatus && order.paymentStatus !== input.paymentStatus) {
        order.paymentStatus = input.paymentStatus;
      }
      
      await order.save();

      // Send status update email on transitions to shipping or delivered (fire-and-forget)
      if (input.status && oldStatus !== input.status && (input.status === 'shipping' || input.status === 'delivered')) {
        const message = input.status === 'shipping'
          ? `Đơn hàng ${order.orderCode} của bạn đang được giao.`
          : `Đơn hàng ${order.orderCode} đã giao thành công. Cảm ơn bạn đã tin dùng sản phẩm của Fashion Store!`;

        User.findById(order.customer).then((user) => {
          if (user && user.email) {
            sendEmail(
              user.email,
              `Cập nhật trạng thái đơn hàng #${order.orderCode} | Fashion Store`,
              orderStatusTemplate({
                customerName: order.shippingAddress.fullName,
                orderCode: order.orderCode,
                orderId: order._id.toString(),
                status: input.status,
                message,
              })
            );
          }
        }).catch((err) => {
          console.error('[Email Trigger Error in Order Status Update]', err);
        });
      }

      // Emit status update to customer
      if (input.status) {
        ctx.io?.to(`user_${order.customer}`).emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: input.status,
          message: `Đơn hàng ${order.orderCode} của bạn đã chuyển sang trạng thái: ${input.status}`
        });
      }

      return JSON.parse(JSON.stringify(order));
    }),

  getStats: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }).optional())
    .query(async ({ input }) => {
      await connectDB();
      const query: any = {};
      
      if (input?.startDate && input?.endDate) {
        query.createdAt = {
          $gte: new Date(input.startDate),
          $lte: new Date(input.endDate)
        };
      }
      
      const stats = await Order.aggregate([
        { $match: { ...query, status: { $nin: ['cancelled', 'refunded'] } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      const ordersByStatus = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
      
      const totalRevenue = stats.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = stats.reduce((sum, day) => sum + day.orders, 0);
      
      return { stats, ordersByStatus, totalRevenue, totalOrders };
    }),

  requestRefund: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      reason: z.string(),
      description: z.string().optional(),
      images: z.array(z.string()).default([])
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const order = await Order.findById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' });
      }

      if (order.customer.toString() !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Bạn không có quyền yêu cầu hoàn tiền cho đơn hàng này' });
      }

      if (order.status !== 'delivered') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã giao thành công' });
      }

      if (order.paymentStatus !== 'paid') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Đơn hàng chưa được thanh toán' });
      }

      const existingRequest = await RefundRequest.findOne({ order: order._id });
      if (existingRequest) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Yêu cầu hoàn tiền đã tồn tại cho đơn hàng này' });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const refundRequest = new RefundRequest({
          order: order._id,
          customer: userId,
          reason: input.reason,
          description: input.description,
          images: input.images,
          amount: order.total,
          status: 'pending'
        });

        await refundRequest.save({ session });

        order.status = 'refund_requested';
        order.timeline.push({
          status: 'refund_requested',
          timestamp: new Date(),
          message: `Khách hàng yêu cầu trả hàng / hoàn tiền. Lý do: ${input.reason}`
        } as any);

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit to admin room
        ctx.io?.to('admin_room').emit('refund:new', {
          requestId: refundRequest._id.toString(),
          orderCode: order.orderCode,
          customerName: order.shippingAddress.fullName,
          amount: order.total,
          createdAt: new Date().toISOString()
        });

        return JSON.parse(JSON.stringify(refundRequest));
      } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message || 'Lỗi khi gửi yêu cầu hoàn tiền' });
      }
    }),

  getRefundRequests: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      status: z.string().optional()
    }))
    .query(async ({ input }) => {
      await connectDB();
      const skip = (input.page - 1) * input.limit;
      const query: any = {};

      if (input.status && input.status !== 'all') {
        query.status = input.status;
      }

      const [requests, total] = await Promise.all([
        RefundRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .populate('customer', 'name email')
          .populate('order')
          .lean(),
        RefundRequest.countDocuments(query)
      ]);

      return {
        requests: JSON.parse(JSON.stringify(requests)),
        total,
        totalPages: Math.ceil(total / input.limit)
      };
    }),

  resolveRefundRequest: adminProcedure
    .input(z.object({
      requestId: z.string(),
      action: z.enum(['approve', 'reject']),
      adminComment: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const adminId = ctx.session!.user!.id;
      const adminEmail = ctx.session!.user!.email || 'Admin';

      const request = await RefundRequest.findById(input.requestId)
        .populate('order')
        .populate('customer');

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu hoàn tiền' });
      }

      if (request.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Yêu cầu này đã được xử lý từ trước' });
      }

      const order = request.order as any;
      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng liên quan' });
      }

      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      try {
        if (input.action === 'approve') {
          // If payment was vnpay, process actual refund
          if (order.paymentMethod === 'vnpay') {
            let transactionNo = order.vnpayTransactionNo;
            let payDate = order.vnpayPayDate;

            // Fallback to VnpayLog if missing on order document
            if (!transactionNo || !payDate) {
              const log = await VnpayLog.findOne({ 
                orderCode: order.orderCode, 
                type: 'return', 
                verified: true 
              }).session(dbSession);

              if (log && log.query) {
                transactionNo = log.query.vnp_TransactionNo;
                payDate = log.query.vnp_PayDate;
              }
            }

            if (!transactionNo || !payDate) {
              throw new Error('Không tìm thấy thông tin giao dịch VNPay hợp lệ để hoàn tiền tự động. Vui lòng hoàn tiền thủ công.');
            }

            // Fire VNPay refund
            const vnpayResponse = await processVnpayRefund({
              requestId: `RF${Date.now()}`,
              orderId: order.orderCode,
              amount: order.total,
              transactionNo: String(transactionNo),
              transactionDate: String(payDate),
              ipAddr: '127.0.0.1', // server ip
              reason: request.reason || 'Hoan tra don hang',
              createdBy: adminEmail
            });

            if (!vnpayResponse.isSuccess) {
              throw new Error(`Cổng VNPay từ chối yêu cầu hoàn tiền: ${vnpayResponse.message}`);
            }

            request.vnpayResponse = vnpayResponse;
          }

          // Approve request
          request.status = 'approved';
          request.adminComment = input.adminComment;
          request.resolvedAt = new Date();
          request.resolvedBy = adminId as any;

          // Update order status
          order.status = 'refunded';
          order.paymentStatus = 'refunded';
          order.timeline.push({
            status: 'refunded',
            timestamp: new Date(),
            message: `Yêu cầu trả hàng / hoàn tiền đã được phê duyệt. Lý do: ${input.adminComment || 'N/A'}`
          });

          // Restore product inventory stock
          for (const item of order.items) {
            await Product.findOneAndUpdate(
              { _id: item.product },
              {
                $inc: {
                  'variants.$[v].sizes.$[s].stock': item.quantity,
                  'sold': -item.quantity
                }
              },
              {
                arrayFilters: [
                  { 'v.color': item.color },
                  { 's.size': item.size }
                ],
                session: dbSession
              }
            );
          }

          // Restore coupon if used
          if (order.coupon) {
            await Coupon.findByIdAndUpdate(order.coupon, {
              $inc: { usedCount: -1 },
              $pull: { usedBy: order.customer }
            }, { session: dbSession });
          }

        } else {
          // Reject request
          request.status = 'rejected';
          request.adminComment = input.adminComment;
          request.resolvedAt = new Date();
          request.resolvedBy = adminId as any;

          // Revert order status back to delivered
          order.status = 'delivered';
          order.timeline.push({
            status: 'delivered',
            timestamp: new Date(),
            message: `Yêu cầu trả hàng / hoàn tiền bị từ chối. Lý do: ${input.adminComment || 'N/A'}`
          });
        }

        await request.save({ session: dbSession });
        await order.save({ session: dbSession });

        await dbSession.commitTransaction();
        dbSession.endSession();
        invalidateProductCaches();

        // Emit notifications to customer
        ctx.io?.to(`user_${order.customer}`).emit('order:status_updated', {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          newStatus: order.status,
          message: `Yêu cầu trả hàng của đơn hàng ${order.orderCode} đã được: ${input.action === 'approve' ? 'Phê duyệt' : 'Từ chối'}`
        });

        // Send confirmation email
        const user = request.customer as any;
        if (user && user.email) {
          const emailSubject = input.action === 'approve'
            ? `Chấp nhận yêu cầu hoàn tiền #${order.orderCode} | Fashion Store`
            : `Từ chối yêu cầu hoàn tiền #${order.orderCode} | Fashion Store`;
          const emailMessage = input.action === 'approve'
            ? `Yêu cầu hoàn tiền cho đơn hàng ${order.orderCode} đã được phê duyệt thành công. Tiền sẽ được hoàn trả theo phương thức thanh toán của bạn.`
            : `Yêu cầu hoàn tiền cho đơn hàng ${order.orderCode} đã bị từ chối. Lý do: ${input.adminComment || 'Không có lý do chi tiết'}.`;

          sendEmail(
            user.email,
            emailSubject,
            orderStatusTemplate({
              customerName: order.shippingAddress.fullName,
              orderCode: order.orderCode,
              orderId: order._id.toString(),
              status: order.status,
              message: emailMessage,
            })
          ).catch(err => console.error('[Email Trigger Error in Resolve Refund]', err));
        }

        return JSON.parse(JSON.stringify(request));
      } catch (error: any) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message || 'Lỗi khi giải quyết yêu cầu hoàn tiền' });
      }
    })
});
