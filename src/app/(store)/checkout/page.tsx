import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CheckoutClient from './CheckoutClient';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';

export const metadata = {
  title: 'Thanh toán | FS Store'
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout');
  }

  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  let profile = null;
  try {
    profile = await caller.user.getProfile();
  } catch (e) {
    console.error("Failed to fetch profile", e);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl min-h-[60vh]">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Thanh toán
      </h1>
      <CheckoutClient profile={profile} />
    </div>
  );
}
