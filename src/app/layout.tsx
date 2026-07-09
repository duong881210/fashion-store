import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import TRPCProvider from '@/components/providers/TRPCProvider';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { auth } from '@/auth';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { ClientNotificationListener } from '@/components/store/ClientNotificationListener';
import { ChatWidget } from '@/components/store/ChatWidget';
import { Suspense } from 'react';

import connectDB from '@/server/db';
import { Settings } from '@/server/db/models/Settings';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean();
    const title = settings?.storeInfo?.name || 'Fashion Store';
    const description = settings?.storeInfo?.description || 'Your one-stop shop for the latest fashion trends.';
    const logoUrl = settings?.storeInfo?.logo || '/favicon.ico';

    return {
      title,
      description,
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
    };
  } catch (error) {
    return {
      title: 'Fashion Store',
      description: 'Your one-stop shop for the latest fashion trends.',
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

async function SessionWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      <body>
        <Suspense fallback={null}>
          <SessionWrapper>
            <SocketProvider>
              <TRPCProvider>
                {children}
                <ClientNotificationListener />
                <ChatWidget />
                <Toaster />
              </TRPCProvider>
            </SocketProvider>
          </SessionWrapper>
        </Suspense>
      </body>
    </html>
  );
}
