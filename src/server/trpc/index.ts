import { publicProcedure, router } from './middleware';
import { userRouter } from './routers/user';
import { productRouter } from './routers/product';
import { categoryRouter } from './routers/category';

export const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v11!'),
  user: userRouter,
  product: productRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
