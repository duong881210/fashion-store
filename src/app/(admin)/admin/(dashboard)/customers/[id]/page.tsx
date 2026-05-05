import { Metadata } from 'next';
import { appRouter } from '@/server/trpc';
import { createTRPCContext } from '@/server/trpc/context';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Mail, Phone, MapPin, Calendar, ShoppingBag, CreditCard, Clock, Ban, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quản Trị - Chi Tiết Khách Hàng',
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

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const caller = appRouter.createCaller(await createTRPCContext());
  
  let customer;
  try {
    customer = await caller.user.getById({ id: params.id });
  } catch (error) {
    notFound();
  }

  const { orders, total: totalOrders } = await caller.order.getAll({ 
    customerId: params.id,
    limit: 50 // Fetch up to 50 latest orders for history
  }).catch(() => ({ orders: [], total: 0 }));

  const totalSpent = orders
    .filter((o: any) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum: number, o: any) => sum + o.total, 0);
    
  const validOrdersCount = orders.filter((o: any) => o.status !== 'cancelled' && o.status !== 'refunded').length;
  const avgOrderValue = validOrdersCount > 0 ? totalSpent / validOrdersCount : 0;
  const lastOrderDate = orders.length > 0 ? new Date(orders[0].createdAt) : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Khách Hàng</h1>
        <Link href="/admin/customers" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                <AvatarImage src={customer.image} alt={customer.name} />
                <AvatarFallback className="text-2xl">{customer.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <div className="mt-2">
              <Badge variant={customer.isActive !== false ? "default" : "destructive"} className={customer.isActive !== false ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                {customer.isActive !== false ? "Đang hoạt động" : "Bị khóa"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Tham gia: {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: vi })}</span>
            </div>
            
            {/* We will handle Ban/Unban via Client Component wrapper or just let the table do it for now */}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Tổng đơn hàng</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">Giá trị TB/đơn</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-orange-500/10 rounded-full text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold mt-1">
                    {lastOrderDate ? format(lastOrderDate, 'dd/MM/yyyy') : 'Chưa có'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Đơn hàng cuối</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="py-3 px-4 font-medium">Mã ĐH</th>
                        <th className="py-3 px-4 font-medium">Ngày</th>
                        <th className="py-3 px-4 font-medium text-center">Trạng Thái</th>
                        <th className="py-3 px-4 font-medium text-right">Tổng Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order: any) => {
                        const statusInfo = STATUS_MAP[order.status] || { label: order.status, variant: 'default' };
                        return (
                          <tr key={order._id} className="hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono">{order.orderCode}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  Khách hàng này chưa có đơn hàng nào.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
