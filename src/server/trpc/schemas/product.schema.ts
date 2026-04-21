import { z } from 'zod/v4';

export const getAllProductsPublicSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  categorySlug: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'best_seller', 'top_rated']).default('newest')
});

export const productVariantSizeSchema = z.object({
  size: z.string(),
  stock: z.number().min(0).default(0)
});

export const productVariantSchema = z.object({
  color: z.string(),
  colorHex: z.string(),
  sizes: z.array(productVariantSizeSchema)
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  salePrice: z.number().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).default([]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional()
}).refine(data => !data.salePrice || data.salePrice < data.price, {
  message: "Sale price must be less than regular price",
  path: ["salePrice"]
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string()
});

export const updateVariantStockSchema = z.object({
  productId: z.string(),
  color: z.string(),
  size: z.string(),
  newStock: z.number().min(0)
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string()),
  action: z.enum(['publish', 'unpublish', 'delete'])
});

export const getAdminListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'published', 'draft']).default('all')
});
