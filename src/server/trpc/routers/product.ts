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

export const productRouter = router({
  getAll: publicProcedure
    .input(getAllProductsPublicSchema)
    .query(async ({ input }) => {
      await connectDB();
      const { page, limit, categorySlug, priceMin, priceMax, sizes, colors, sort } = input;
      const skip = (page - 1) * limit;

      const query: any = { isPublished: true };

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
        products: products.map(p => ({ 
          ...p, 
          _id: p._id?.toString(), 
          category: p.category ? { ...(p.category as any), _id: (p.category as any)._id?.toString() } : p.category 
        })),
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
      
      return { 
        ...product, 
        _id: product._id?.toString(),
        category: product.category ? { ...(product.category as any), _id: (product.category as any)._id?.toString() } : product.category 
      };
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      await connectDB();
      const products = await Product.find({ isPublished: true, isFeatured: true })
        .limit(input.limit)
        .populate('category', 'name slug')
        .lean<IProduct[]>();
      return products.map(p => ({ ...p, _id: p._id?.toString() }));
    }),

  getNewArrivals: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      await connectDB();
      const products = await Product.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(input.limit)
        .populate('category', 'name slug')
        .lean<IProduct[]>();
      return products.map(p => ({ ...p, _id: p._id?.toString() }));
    }),

  getBestSellers: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      await connectDB();
      const products = await Product.find({ isPublished: true })
        .sort({ sold: -1 })
        .limit(input.limit)
        .populate('category', 'name slug')
        .lean<IProduct[]>();
      return products.map(p => ({ ...p, _id: p._id?.toString() }));
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      await connectDB();
      const products = await Product.find(
        { $text: { $search: input.query }, isPublished: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .select('name slug price images')
        .lean<IProduct[]>();
      
      return products.map(p => ({ ...p, _id: p._id?.toString() }));
    }),

  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const product = await Product.create(input as any);
      return product.toObject();
    }),

  update: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const { id, ...data } = input;
      const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
      return product.toObject();
    }),

  softDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectDB();
      const product = await Product.findByIdAndUpdate(input.id, { 
        $set: { isPublished: false, deletedAt: new Date() } 
      }, { new: true });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
      return true;
    }),

  hardDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectDB();
      const product = await Product.findById(input.id);
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });

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
      return true;
    }),

  updateVariantStock: adminProcedure
    .input(updateVariantStockSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const product = await Product.findById(input.productId);
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });

      const variant = product.variants.find(v => v.color === input.color);
      if (!variant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Color not found' });

      const sizeObj = variant.sizes.find(s => s.size === input.size);
      if (!sizeObj) throw new TRPCError({ code: 'NOT_FOUND', message: 'Size not found' });

      sizeObj.stock = input.newStock;
      await product.save();
      return product.toObject();
    }),

  bulkAction: adminProcedure
    .input(bulkActionSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      if (input.action === 'publish') {
        await Product.updateMany({ _id: { $in: input.ids } }, { $set: { isPublished: true } });
      } else if (input.action === 'unpublish') {
        await Product.updateMany({ _id: { $in: input.ids } }, { $set: { isPublished: false } });
      } else if (input.action === 'delete') {
         await Product.updateMany({ _id: { $in: input.ids } }, { $set: { isPublished: false, deletedAt: new Date() } });
      }
      return true;
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
        products: products.map(p => ({ 
          ...p, 
          _id: p._id?.toString(),
          category: p.category ? { ...(p.category as any), _id: (p.category as any)._id?.toString() } : p.category
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    })
});
