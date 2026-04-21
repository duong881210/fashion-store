import { auth } from '@/auth';
import { inferAsyncReturnType } from '@trpc/server';

export async function createTRPCContext() {
  const session = await auth();
  return {
    session,
  };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;
