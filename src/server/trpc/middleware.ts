import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const authed = t.middleware(({ next, ctx }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

const isAdmin = t.middleware(({ next, ctx }) => {
    if (ctx.session!.user!.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        }
    });
});

export const protectedProcedure = t.procedure.use(authed);
export const adminProcedure = t.procedure.use(authed).use(isAdmin);
