import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import mongoose from 'mongoose';
import { router, publicProcedure, protectedProcedure } from '../middleware';
import { Review } from '../../db/models/Review';
import { Order } from '../../db/models/Order';
import connectDB from '../../db';
import { revalidateTag } from 'next/cache';

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

export const reviewRouter = router({
  getByProductId: publicProcedure
    .input(z.object({
      productId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(5)
    }))
    .query(async ({ input }) => {
      await connectDB();
      const { productId, page, limit } = input;
      const skip = (page - 1) * limit;

      const pId = new mongoose.Types.ObjectId(productId);

      // 1. Fetch reviews with paginated list
      const [reviews, totalCount] = await Promise.all([
        Review.find({ product: pId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('customer', 'name email')
          .lean(),
        Review.countDocuments({ product: pId })
      ]);

      // 2. Fetch rating statistics via aggregation
      const statsResult = await Review.aggregate([
        { $match: { product: pId } },
        {
          $group: {
            _id: '$product',
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ]);

      let avgRating = 0;
      let reviewCount = 0;
      let breakdown = [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 }
      ];

      if (statsResult.length > 0) {
        const stats = statsResult[0];
        avgRating = Math.round(stats.avgRating * 10) / 10;
        reviewCount = stats.totalReviews;

        breakdown = [
          { stars: 5, count: stats.star5, percentage: Math.round((stats.star5 / reviewCount) * 100) },
          { stars: 4, count: stats.star4, percentage: Math.round((stats.star4 / reviewCount) * 100) },
          { stars: 3, count: stats.star3, percentage: Math.round((stats.star3 / reviewCount) * 100) },
          { stars: 2, count: stats.star2, percentage: Math.round((stats.star2 / reviewCount) * 100) },
          { stars: 1, count: stats.star1, percentage: Math.round((stats.star1 / reviewCount) * 100) }
        ];
      }

      return {
        reviews: JSON.parse(JSON.stringify(reviews)),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        stats: {
          rating: avgRating,
          reviewCount,
          breakdown
        }
      };
    }),

  checkEligibility: protectedProcedure
    .input(z.object({
      productId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      const { productId } = input;

      const pId = new mongoose.Types.ObjectId(productId);

      // Find all delivered orders for this user containing the product
      const orders = await Order.find({
        customer: userId,
        status: 'delivered',
        'items.product': pId
      }).sort({ createdAt: -1 }).lean();

      if (orders.length === 0) {
        return {
          eligible: false,
          message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và nhận được sản phẩm thành công.',
          orderId: undefined,
          orderCode: undefined
        };
      }

      // Find an order that hasn't been reviewed yet for this product
      for (const order of orders) {
        const existingReview = await Review.findOne({
          product: pId,
          customer: userId,
          order: order._id
        }).lean();

        if (!existingReview) {
          return {
            eligible: true,
            orderId: order._id.toString(),
            orderCode: order.orderCode,
            message: undefined
          };
        }
      }

      return {
        eligible: false,
        message: 'Bạn đã đánh giá sản phẩm này cho tất cả các đơn hàng đã mua.',
        orderId: undefined,
        orderCode: undefined
      };
    }),

  create: protectedProcedure
    .input(z.object({
      productId: z.string(),
      orderId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(10, { message: 'Nội dung đánh giá phải từ 10 ký tự trở lên' }),
      images: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      const { productId, orderId, rating, comment, images } = input;

      const pId = new mongoose.Types.ObjectId(productId);
      const oId = new mongoose.Types.ObjectId(orderId);

      // Verify the order exists, is delivered, and contains the product
      const order = await Order.findOne({
        _id: oId,
        customer: userId,
        status: 'delivered',
        'items.product': pId
      });

      if (!order) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Đơn hàng không hợp lệ hoặc sản phẩm chưa được giao thành công.'
        });
      }

      // Check if a review already exists for this order item
      const existingReview = await Review.findOne({
        product: pId,
        customer: userId,
        order: oId
      });

      if (existingReview) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bạn đã gửi đánh giá cho sản phẩm này của đơn hàng đã chọn.'
        });
      }

      // Create new review
      const review = new Review({
        product: pId,
        customer: userId,
        order: oId,
        rating,
        comment,
        images: images || [],
        isVerified: true
      });

      await review.save();
      invalidateProductCaches();

      return JSON.parse(JSON.stringify(review));
    })
});
