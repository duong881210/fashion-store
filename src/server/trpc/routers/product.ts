import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '../middleware';
import { Product, IProduct } from '../../db/models/Product';
import { Category } from '../../db/models/Category';
import connectDB from '../../db';
import {
  getAllProductsPublicSchema,
  createProductSchema,
  updateProductSchema,
  updateVariantStockSchema,
  bulkActionSchema,
  getAdminListSchema
} from '../schemas/product.schema';
import { z } from 'zod/v4';
import { v2 as cloudinary } from 'cloudinary';
import DOMPurify from 'isomorphic-dompurify';
import { revalidateTag } from 'next/cache';
import { getCachedFeatured, getCachedNewArrivals, getCachedBestSellers } from '@/lib/cache';

function makeVietnameseRegex(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
  
  let escaped = base.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  return escaped
    .replace(/a/g, '[aàáảãạăằắẳẵặâầấẩẫậ]')
    .replace(/e/g, '[eèéẻẽẹêềếểễệ]')
    .replace(/i/g, '[iìíỉĩị]')
    .replace(/o/g, '[oòóỏõọôồốổỗộơờớởỡợ]')
    .replace(/u/g, '[uùúủũụưừứửự]')
    .replace(/y/g, '[yỳýỷỹỵ]')
    .replace(/d/g, '[dđ]');
}

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

export const productRouter = router({
  getAll: publicProcedure
    .input(getAllProductsPublicSchema)
    .query(async ({ input }) => {
      await connectDB();
      const { page, limit, categorySlug, priceMin, priceMax, sizes, colors, sort, search } = input;
      const skip = (page - 1) * limit;

      const query: any = { isPublished: true };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug }).lean();
        if (category) query.category = category._id;
      }
      
      if (priceMin !== undefined || priceMax !== undefined) {
        query.price = {};
        if (priceMin !== undefined) query.price.$gte = priceMin;
        if (priceMax !== undefined) query.price.$lte = priceMax;
      }

      if (colors && colors.length > 0) {
        query['variants.color'] = { $in: colors };
      }

      if (sizes && sizes.length > 0) {
        query['variants.sizes.size'] = { $in: sizes };
      }

      let sortOption: any = { createdAt: -1 };
      switch (sort) {
        case 'price_asc': sortOption = { price: 1 }; break;
        case 'price_desc': sortOption = { price: -1 }; break;
        case 'best_seller': sortOption = { sold: -1 }; break;
        case 'top_rated': sortOption = { rating: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
      }

      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .populate('category', 'name slug')
          .lean<IProduct[]>(),
        Product.countDocuments(query)
      ]);

      return {
        products: JSON.parse(JSON.stringify(products)),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      await connectDB();
      const product = await Product.findOne({ slug: input.slug, isPublished: true })
        .populate('category', 'name slug')
        .lean<IProduct>();

      if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      
      return JSON.parse(JSON.stringify(product));
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      try {
        return await getCachedFeatured(input.limit);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch featured products',
        });
      }
    }),

  getNewArrivals: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      try {
        return await getCachedNewArrivals(input.limit);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch new arrivals',
        });
      }
    }),

  getBestSellers: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      try {
        return await getCachedBestSellers(input.limit);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch best sellers',
        });
      }
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      await connectDB();
      const cleanQuery = input.query.trim();
      if (!cleanQuery) return [];

      const regexQuery = makeVietnameseRegex(cleanQuery);
      const products = await Product.find({
        name: { $regex: regexQuery, $options: 'i' },
        isPublished: true
      })
        .limit(10)
        .select('name slug price images')
        .lean<IProduct[]>();
      
      return JSON.parse(JSON.stringify(products));
    }),

  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        if (input.description) {
          input.description = DOMPurify.sanitize(input.description);
        }
        const product = await Product.create(input as any);
        invalidateProductCaches();
        return product.toObject();
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create product',
        });
      }
    }),

  update: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        const { id, ...data } = input;
        if (data.description) {
          data.description = DOMPurify.sanitize(data.description);
        }
        const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true });
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        invalidateProductCaches();
        return product.toObject();
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update product',
        });
      }
    }),

  softDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        const product = await Product.findByIdAndUpdate(input.id, { 
          $set: { isPublished: false, deletedAt: new Date() } 
        }, { new: true });
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        invalidateProductCaches();
        return true;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to soft delete product',
        });
      }
    }),

  hardDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        const product = await Product.findById(input.id);
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

        if (product.images && product.images.length > 0) {
          for (const imgUrl of product.images) {
            try {
              const parts = imgUrl.split('/');
              const filename = parts[parts.length - 1];
              const publicId = filename.split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (e) {
              console.error('Failed to delete from Cloudinary:', e);
            }
          }
        }

        await Product.findByIdAndDelete(input.id);
        invalidateProductCaches();
        return true;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to hard delete product',
        });
      }
    }),

  updateVariantStock: adminProcedure
    .input(updateVariantStockSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        const product = await Product.findById(input.productId);
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

        const variant = product.variants.find(v => v.color === input.color);
        if (!variant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Color not found' });

        const sizeObj = variant.sizes.find(s => s.size === input.size);
        if (!sizeObj) throw new TRPCError({ code: 'NOT_FOUND', message: 'Size not found' });

        sizeObj.stock = input.newStock;
        await product.save();
        invalidateProductCaches();
        return product.toObject();
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update stock',
        });
      }
    }),

  bulkAction: adminProcedure
    .input(bulkActionSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        if (input.action === 'publish') {
          await Product.updateMany({ _id: { $in: input.ids } }, { $set: { isPublished: true } });
        } else if (input.action === 'unpublish') {
          await Product.updateMany({ _id: { $in: input.ids } }, { $set: { isPublished: false } });
        } else if (input.action === 'delete') {
           const products = await Product.find({ _id: { $in: input.ids } });
           for (const p of products) {
             if (p.images && p.images.length > 0) {
               for (const imgUrl of p.images) {
                 try {
                   const parts = imgUrl.split('/');
                   const filename = parts[parts.length - 1];
                   const publicId = filename.split('.')[0];
                   await cloudinary.uploader.destroy(publicId);
                 } catch (e) {
                   console.error('Failed to delete from Cloudinary:', e);
                 }
               }
             }
           }
           await Product.deleteMany({ _id: { $in: input.ids } });
        }
        invalidateProductCaches();
        return true;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to execute bulk action',
        });
      }
    }),

  getLowStockCount: adminProcedure
    .input(z.object({ threshold: z.number().optional().default(10) }).optional())
    .query(async ({ input }) => {
      await connectDB();
      const threshold = input?.threshold || 10;
      
      const products = await Product.aggregate([
        { $unwind: "$variants" },
        { $unwind: "$variants.sizes" },
        {
          $group: {
            _id: "$_id",
            totalStock: { $sum: "$variants.sizes.stock" }
          }
        },
        { $match: { totalStock: { $lt: threshold } } }
      ]);
      
      return products.length;
    }),

  getAdminList: adminProcedure
    .input(getAdminListSchema)
    .query(async ({ input }) => {
      await connectDB();
      const { page, limit, search, category, status } = input;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } }
        ];
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (status === 'published') query.isPublished = true;
      if (status === 'draft') query.isPublished = false;

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('category', 'name slug')
          .lean<IProduct[]>(),
        Product.countDocuments(query)
      ]);

      return {
        products: JSON.parse(JSON.stringify(products)),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    })
});
