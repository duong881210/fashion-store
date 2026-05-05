import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardCharts from './_components/DashboardCharts';

export const metadata: Metadata = {
  title: 'Quản Trị - Tổng Quan',
};

const STATUS_MAP: Record<string, { label: string, variant: string }> = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  processing: { label: 'Đang xử lý', variant: 'default' },
  shipping: { label: 'Đang giao', variant: 'info' },
  delivered: { label: 'Đã giao', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
  refunded: { label: 'Hoàn tiền', variant: 'secondary' },
};

export default async function AdminDashboard() {
  const caller = appRouter.createCaller(await createTRPCContext());

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // Fetch data concurrently
  const [
    thisMonthStats,
    lastMonthStats,
    recentOrdersData,
    topProducts,
    newCustomersCount,
    lowStockCount
  ] = await Promise.all([
    caller.order.getStats({ startDate: thirtyDaysAgo.toISOString(), endDate: now.toISOString() }).catch(() => ({ stats: [], ordersByStatus: [], totalRevenue: 0, totalOrders: 0 })),
    caller.order.getStats({ startDate: sixtyDaysAgo.toISOString(), endDate: thirtyDaysAgo.toISOString() }).catch(() => ({ stats: [], ordersByStatus: [], totalRevenue: 0, totalOrders: 0 })),
    caller.order.getAll({ limit: 10, page: 1 }).catch(() => ({ orders: [], total: 0, totalPages: 0 })),
    caller.product.getBestSellers({ limit: 5 }).catch(() => []),
    caller.user.getNewCustomersCount().catch(() => 0),
    caller.product.getLowStockCount({ threshold: 10 }).catch(() => 0),
  ]);

  const recentOrders = recentOrdersData.orders;
  const pendingOrdersCount = thisMonthStats.ordersByStatus.find((s: any) => s._id === 'pending')?.count || 0;

  // Calculate percentage changes
  const revenueChange = lastMonthStats.totalRevenue === 0 
    ? 100 
    : ((thisMonthStats.totalRevenue - lastMonthStats.totalRevenue) / lastMonthStats.totalRevenue) * 100;
  
  const ordersChange = lastMonthStats.totalOrders === 0
    ? 100
    : ((thisMonthStats.totalOrders - lastMonthStats.totalOrders) / lastMonthStats.totalOrders) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tổng Quan Bảng Điều Khiển</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Tháng Này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {revenueChange >= 0 ? (
                <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> {revenueChange.toFixed(1)}%</span>
              ) : (
                <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1" /> {Math.abs(revenueChange).toFixed(1)}%</span>
              )}
              <span className="ml-1">so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn Hàng (30 ngày)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {thisMonthStats.totalOrders}
              {pendingOrdersCount > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">+{pendingOrdersCount} chờ</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {ordersChange >= 0 ? (
                <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> {ordersChange.toFixed(1)}%</span>
              ) : (
                <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1" /> {Math.abs(ordersChange).toFixed(1)}%</span>
              )}
              <span className="ml-1">so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Hàng Mới (7 ngày)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Đăng ký trong tuần qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Phẩm Sắp Hết</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Sản phẩm có tồn kho &lt; 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts 
        revenueData={thisMonthStats.stats} 
        ordersByStatus={thisMonthStats.ordersByStatus} 
      />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Đơn Hàng Gần Đây</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Mã ĐH</th>
                    <th className="pb-3 font-medium">Khách Hàng</th>
                    <th className="pb-3 font-medium">Trạng Thái</th>
                    <th className="pb-3 font-medium text-right">Tổng Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => {
                      const statusInfo = STATUS_MAP[order.status] || { label: order.status, variant: 'default' };
                      return (
                        <tr key={order._id} className="border-b last:border-0">
                          <td className="py-3 font-mono text-xs">{order.orderCode}</td>
                          <td className="py-3 truncate max-w-[120px]">{order.customer?.name || 'Guest'}</td>
                          <td className="py-3">
                            <Badge variant={statusInfo.variant as any} className="text-[10px]">
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">Không có đơn hàng nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Sản Phẩm Bán Chạy</CardTitle>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product: any, index: number) => (
                  <div key={product._id} className="flex items-center gap-4">
                    <div className="font-bold text-muted-foreground w-4 text-center">{index + 1}</div>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0] && (
                        <Image 
                          src={product.images[0]} 
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sold} đã bán</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-muted-foreground text-sm">Chưa có sản phẩm nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
