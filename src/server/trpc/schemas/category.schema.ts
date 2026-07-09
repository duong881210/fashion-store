import { z } from 'zod/v4';

export const getAllCategoriesSchema = z.object({
  includeUnpublished: z.boolean().optional().default(false)
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().default(0)
});

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').optional(),
  slug: z.string().min(2, 'Slug danh mục phải có ít nhất 2 ký tự').optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const deleteCategorySchema = z.object({
  id: z.string()
});
