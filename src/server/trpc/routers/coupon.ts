import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { router, protectedProcedure, adminProcedure } from '../middleware';
import { Coupon } from '../../db/models/Coupon';
import connectDB from '../../db';

export const couponRouter = router({
  validate: protectedProcedure
    .input(z.object({
      code: z.string(),
      orderValue: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const coupon = await Coupon.findOne({ code: input.code.toUpperCase() });
      if (!coupon) {
        return { isValid: false, discount: 0, message: 'Mã giảm giá không tồn tại' };
      }
      
      if (!coupon.isActive) {
        return { isValid: false, discount: 0, message: 'Mã giảm giá đã ngưng hoạt động' };
      }
      
      if (new Date() > new Date(coupon.expiresAt)) {
        return { isValid: false, discount: 0, message: 'Mã giảm giá đã hết hạn' };
      }
      
      if (coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, discount: 0, message: 'Mã giảm giá đã hết lượt sử dụng' };
      }
      
      if (input.orderValue < coupon.minOrderValue) {
        return { isValid: false, discount: 0, message: `Đơn hàng tối thiểu phải từ ${coupon.minOrderValue.toLocaleString()}đ` };
      }
      
      if (coupon.usedBy.includes(userId as any)) {
        return { isValid: false, discount: 0, message: 'Bạn đã sử dụng mã giảm giá này' };
      }
      
      let discount = 0;
      if (coupon.type === 'fixed') {
        discount = coupon.value;
      } else if (coupon.type === 'percentage') {
        discount = Math.floor((input.orderValue * coupon.value) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
      
      return { isValid: true, discount, message: 'Áp dụng thành công', couponId: coupon._id };
    }),

  create: adminProcedure
    .input(z.object({
      code: z.string(),
      type: z.enum(['percentage', 'fixed']),
      value: z.number(),
      minOrderValue: z.number().default(0),
      maxDiscount: z.number().optional(),
      usageLimit: z.number(),
      expiresAt: z.string()
    }))
    .mutation(async ({ input }) => {
      await connectDB();
      const exists = await Coupon.findOne({ code: input.code.toUpperCase() });
      if (exists) throw new TRPCError({ code: 'CONFLICT', message: 'Mã đã tồn tại' });
      
      const coupon = await Coupon.create({
        ...input,
        code: input.code.toUpperCase(),
        expiresAt: new Date(input.expiresAt)
      });
      return coupon;
    }),

  getAll: adminProcedure.query(async () => {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return coupons;
  }),

  toggle: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectDB();
      const coupon = await Coupon.findById(input.id);
      if (!coupon) throw new TRPCError({ code: 'NOT_FOUND' });
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return coupon;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectDB();
      const result = await Coupon.findByIdAndDelete(input.id);
      if (!result) throw new TRPCError({ code: 'NOT_FOUND' });
      return { success: true };
    })
});
