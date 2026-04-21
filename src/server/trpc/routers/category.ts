import { router, publicProcedure } from '../middleware';
import { Category, ICategory } from '../../db/models/Category';
import connectDB from '../../db';

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
    })
});
