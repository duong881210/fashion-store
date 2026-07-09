import { router, publicProcedure, adminProcedure } from '../middleware';
import { Category, ICategory } from '../../db/models/Category';
import connectDB from '../../db';
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from '../schemas/category.schema';
import { TRPCError } from '@trpc/server';

export const categoryRouter = router({
  getAll: publicProcedure
    .query(async () => {
      await connectDB();
      const categories = await Category.find().sort({ order: 1 }).lean<ICategory[]>();
      return categories.map(c => ({
        ...c,
        _id: c._id?.toString(),
        parent: c.parent?.toString()
      }));
    }),

  create: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const existingCategory = await Category.findOne({ slug: input.slug });
      if (existingCategory) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slug danh mục đã tồn tại' });
      }

      const category = new Category({
        ...input,
        parent: input.parent ? input.parent : undefined
      });

      await category.save();
      return JSON.parse(JSON.stringify(category));
    }),

  update: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const { id, ...data } = input;

      const category = await Category.findById(id);
      if (!category) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' });
      }

      if (data.slug && data.slug !== category.slug) {
        const existingCategory = await Category.findOne({ slug: data.slug });
        if (existingCategory) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slug danh mục đã tồn tại' });
        }
      }

      const updateData: any = { ...data };
      const unsetData: any = {};
      
      if (data.parent === null || data.parent === '') {
        unsetData.parent = "";
        delete updateData.parent;
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        Object.keys(unsetData).length > 0 
          ? { $set: updateData, $unset: unsetData } 
          : { $set: updateData },
        { new: true }
      );

      return JSON.parse(JSON.stringify(updatedCategory));
    }),

  delete: adminProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const category = await Category.findById(input.id);
      if (!category) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' });
      }

      const childCount = await Category.countDocuments({ parent: input.id });
      if (childCount > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Không thể xóa danh mục đang chứa danh mục con' });
      }

      await Category.findByIdAndDelete(input.id);
      return { success: true };
    })
});
