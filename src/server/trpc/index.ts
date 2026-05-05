import { publicProcedure, router } from './middleware';
import { userRouter } from './routers/user';
import { productRouter } from './routers/product';
import { categoryRouter } from './routers/category';
import { cartRouter } from './routers/cart';
import { couponRouter } from './routers/coupon';
import { orderRouter } from './routers/order';

export const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v11!'),
  user: userRouter,
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  coupon: couponRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
