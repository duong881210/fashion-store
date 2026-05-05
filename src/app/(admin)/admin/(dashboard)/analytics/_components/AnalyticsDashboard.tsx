'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { subDays, startOfWeek, startOfMonth, format, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DateRangeType = 'this_week' | 'this_month' | 'last_3_months' | 'custom';

export function AnalyticsDashboard() {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('this_month');
  
  const dateRange = useMemo(() => {
    const today = new Date();
    let start = new Date();
    
    switch (dateRangeType) {
      case 'this_week':
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'this_month':
        start = startOfMonth(today);
        break;
      case 'last_3_months':
        start = subMonths(today, 3);
        break;
      case 'custom':
        // simplified custom to 30 days for this demo if not fully implemented
        start = subDays(today, 30);
        break;
    }
    
    return {
      startDate: start.toISOString(),
      endDate: today.toISOString()
    };
  }, [dateRangeType]);

  const { data, isLoading } = trpc.analytics.getDashboardAnalytics.useQuery(dateRange, {
    refetchOnWindowFocus: false
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { revenue, product, customer, fulfillment } = data;

  const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="font-semibold">Tổng quan phân tích</h2>
        <div className="w-48">
          <Select value={dateRangeType} onValueChange={(val) => setDateRangeType(val as DateRangeType)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">Tuần này</SelectItem>
              <SelectItem value="this_month">Tháng này</SelectItem>
              <SelectItem value="last_3_months">3 Tháng qua</SelectItem>
              <SelectItem value="custom">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Giá Trị ĐH Trung Bình</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(revenue.averageOrderValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thời Gian Giao Hàng TB</CardDescription>
            <CardTitle className="text-2xl">{fulfillment.avgDaysToShip.toFixed(1)} ngày</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Khách Hàng Mới</CardDescription>
            <CardTitle className="text-2xl">{customer.newVsReturning[0]?.value || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tỷ Lệ Hủy Đơn (TB)</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {(fulfillment.cancellationRate.reduce((acc: number, cur: any) => acc + cur.rate, 0) / (fulfillment.cancellationRate.length || 1)).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh Thu Theo Ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue.daily}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => format(new Date(val), 'dd/MM')} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    formatter={(val: any) => [formatCurrency(val), 'Doanh thu']}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0f172a" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theo Danh Mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip formatter={(val: any) => [formatCurrency(val), 'Doanh thu']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product & Customer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tình Trạng Kho Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={product.inventoryHealth}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {product.inventoryHealth.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="text-3xl font-bold">{product.inventoryHealth.reduce((acc: number, cur: any) => acc + cur.value, 0)}</span>
                <span className="text-xs text-muted-foreground">Sản phẩm</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khách Mới vs Khách Cũ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customer.newVsReturning}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {customer.newVsReturning.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Sản Phẩm (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4 font-medium">Sản phẩm</th>
                    <th className="py-3 px-4 font-medium text-center">Đã bán</th>
                    <th className="py-3 px-4 font-medium text-right">Doanh thu</th>
                    <th className="py-3 px-4 font-medium text-center">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {product.performance.slice(0, 10).map((prod: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={prod.name}>{prod.name}</td>
                      <td className="py-3 px-4 text-center">{prod.sold}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(prod.revenue)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={prod.stock === 0 ? "destructive" : prod.stock < 10 ? "warning" as any : "default"}>
                          {prod.stock}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {product.performance.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Khách Hàng (LTV)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4 font-medium">Khách hàng</th>
                    <th className="py-3 px-4 font-medium text-center">Số đơn</th>
                    <th className="py-3 px-4 font-medium text-right">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.topCustomers.map((cust: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="font-medium">{cust.name}</div>
                        <div className="text-xs text-muted-foreground">{cust.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">{cust.ordersCount}</td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">{formatCurrency(cust.ltv)}</td>
                    </tr>
                  ))}
                  {customer.topCustomers.length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Tỷ Lệ Hủy Đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fulfillment.cancellationRate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'dd/MM')} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(val) => `${val}%`} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <RechartsTooltip 
                  formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Tỷ lệ hủy']}
                  labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
