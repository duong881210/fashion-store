import { publicProcedure, router } from './middleware';

import { userRouter } from './routers/user';
import { productRouter } from './routers/product';
import { categoryRouter } from './routers/category';
import { cartRouter } from './routers/cart';
import { couponRouter } from './routers/coupon';
import { orderRouter } from './routers/order';
import { settingsRouter } from './routers/settings';
import { analyticsRouter } from './routers/analytics';
import { chatRouter } from './routers/chat';
import { reviewRouter } from './routers/review';

export const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v11!'),
  user: userRouter,
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  coupon: couponRouter,
  order: orderRouter,
  settings: settingsRouter,
  analytics: analyticsRouter,
  chat: chatRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
