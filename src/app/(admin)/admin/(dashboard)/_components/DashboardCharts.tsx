'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardChartsProps {
  revenueData: { _id: string; revenue: number; orders: number }[];
  ordersByStatus: { _id: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308', // yellow-500
  confirmed: '#3b82f6', // blue-500
  processing: '#8b5cf6', // violet-500
  shipping: '#f97316', // orange-500
  delivered: '#22c55e', // green-500
  cancelled: '#ef4444', // red-500
  refunded: '#64748b' // slate-500
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền'
};

export default function DashboardCharts({ revenueData, ordersByStatus }: DashboardChartsProps) {
  // Format revenue data for the line chart
  const formattedRevenueData = revenueData.map(item => ({
    date: item._id, // Format: YYYY-MM-DD
    revenue: item.revenue
  }));

  // Format status data for the donut chart
  const formattedStatusData = ordersByStatus.map(item => ({
    name: STATUS_LABELS[item._id] || item._id,
    value: item.count,
    color: STATUS_COLORS[item._id] || '#cbd5e1'
  }));

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Revenue Line Chart */}
      <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-6">Doanh Thu (30 ngày qua)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value === 0) return '0đ';
                  return `${(value / 1000000).toFixed(1)}M`;
                }}
              />
              <Tooltip 
                formatter={(value: any) => [formatVND(value as number), 'Doanh thu']}
                labelFormatter={(label) => {
                  const date = new Date(label as string);
                  return `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0f172a" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Donut Chart */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-6">Trạng Thái Đơn Hàng</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          {formattedStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {formattedStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [value, 'Đơn hàng']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground text-sm">Chưa có dữ liệu đơn hàng</div>
          )}
        </div>
      </div>
    </div>
  );
}
