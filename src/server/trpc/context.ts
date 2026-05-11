import { auth } from '@/auth';
import { inferAsyncReturnType } from '@trpc/server';
import { type Server } from 'socket.io';

export async function createTRPCContext() {
  const session = await auth();
  const io: Server | undefined = (global as any).__io;
  return {
    session,
    io,
  };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;
