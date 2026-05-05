import { Metadata } from 'next';
import { AnalyticsDashboard } from './_components/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Quản Trị - Phân Tích',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Phân Tích Dữ Liệu</h1>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
