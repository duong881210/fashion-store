import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import mongoose from 'mongoose';
import { router, protectedProcedure, adminProcedure } from '../middleware';
import { Order } from '../../db/models/Order';
import { Cart } from '../../db/models/Cart';
import { Product } from '../../db/models/Product';
import { Coupon } from '../../db/models/Coupon';
import connectDB from '../../db';

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
        const orderItems = [];

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
    .mutation(async ({ input }) => {
      await connectDB();
      const order = await Order.findById(input.id);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      
      if (input.status && order.status !== input.status) {
        order.status = input.status;
      }
      
      if (input.paymentStatus && order.paymentStatus !== input.paymentStatus) {
        order.paymentStatus = input.paymentStatus;
      }
      
      await order.save();
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
    })
});
