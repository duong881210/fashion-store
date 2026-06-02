import { Suspense } from 'react';
import { Metadata } from 'next';
import { AnalyticsDashboard } from './_components/AnalyticsDashboard';
import { Loader2 } from 'lucide-react';
import { connection } from 'next/server';

export const metadata: Metadata = {
  title: 'Quản Trị - Phân Tích',
};

async function AnalyticsPageContent() {
  await connection();
  return <AnalyticsDashboard />;
}

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Phân Tích Dữ Liệu</h1>
      </div>
      <Suspense fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AnalyticsPageContent />
      </Suspense>
    </div>
  );
}
