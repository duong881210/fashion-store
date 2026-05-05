'use client';

import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { OrderDetailSheet } from './OrderDetailSheet';
import { Download, Search, SlidersHorizontal, Loader2, CalendarIcon } from 'lucide-react';
import Papa from 'papaparse';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderClientTableProps {
  initialData: {
    orders: any[];
    total: number;
    totalPages: number;
  };
}

const STATUS_MAP: Record<string, { label: string, variant: string }> = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  processing: { label: 'Đang xử lý', variant: 'default' },
  shipping: { label: 'Đang giao', variant: 'info' },
  delivered: { label: 'Đã giao', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
  refunded: { label: 'Hoàn tiền', variant: 'secondary' },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string, variant: string }> = {
  unpaid: { label: 'Chưa thanh toán', variant: 'destructive' },
  paid: { label: 'Đã thanh toán', variant: 'success' },
  refunded: { label: 'Đã hoàn tiền', variant: 'secondary' },
};

export function OrderClientTable({ initialData }: OrderClientTableProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Using useInfiniteQuery for "load more on scroll" as requested
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    refetch
  } = trpc.order.getAll.useInfiniteQuery(
    {
      limit: 15,
      search: debouncedSearch,
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
    },
    {
      getNextPageParam: (lastPage: any, pages: any[]) => {
        if (pages.length < lastPage.totalPages) {
          return pages.length + 1; // next page number
        }
        return undefined;
      },
      initialData: {
        pages: [initialData],
        pageParams: [1]
      }
    }
  );

  const orders = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.orders) || [];
  }, [data]);

  const handleExportCSV = () => {
    const exportData = orders.map((order: any) => ({
      'Mã ĐH': order.orderCode,
      'Khách Hàng': order.shippingAddress.fullName,
      'SĐT': order.shippingAddress.phone,
      'Ngày Đặt': new Date(order.createdAt).toLocaleString('vi-VN'),
      'Trạng Thái': STATUS_MAP[order.status]?.label || order.status,
      'Thanh Toán': PAYMENT_STATUS_MAP[order.paymentStatus]?.label || order.paymentStatus,
      'PT Thanh Toán': order.paymentMethod.toUpperCase(),
      'Tổng Tiền': order.total,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mã ĐH hoặc khách hàng..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-background">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Trạng thái
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Trạng thái giao hàng</h4>
                    <select 
                      className="w-full text-sm border rounded p-1.5"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Thanh toán</h4>
                    <select 
                      className="w-full text-sm border rounded p-1.5"
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      {Object.entries(PAYMENT_STATUS_MAP).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-background hidden md:flex">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Ngày đặt
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  locale={vi}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Button onClick={handleExportCSV} variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
              <tr>
                <th className="py-4 px-6 font-medium">Mã ĐH</th>
                <th className="py-4 px-6 font-medium">Khách Hàng</th>
                <th className="py-4 px-6 font-medium text-center">SP</th>
                <th className="py-4 px-6 font-medium text-right">Tổng Tiền</th>
                <th className="py-4 px-6 font-medium text-center">Thanh Toán</th>
                <th className="py-4 px-6 font-medium text-center">Trạng Thái</th>
                <th className="py-4 px-6 font-medium">Ngày Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-6 font-mono font-medium">{order.orderCode}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{order.shippingAddress.fullName}</div>
                      <div className="text-xs text-muted-foreground">{order.customer?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-center">{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</td>
                    <td className="py-4 px-6 text-right font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-6 text-center space-y-1 flex flex-col items-center">
                      <Badge variant={PAYMENT_STATUS_MAP[order.paymentStatus]?.variant as any || 'default'} className="text-[10px]">
                        {PAYMENT_STATUS_MAP[order.paymentStatus]?.label || order.paymentStatus}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">{order.paymentMethod}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={STATUS_MAP[order.status]?.variant as any || 'default'}>
                        {STATUS_MAP[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {hasNextPage && (
          <div className="p-4 border-t flex justify-center bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()} 
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải thêm...</>
              ) : (
                'Tải thêm đơn hàng'
              )}
            </Button>
          </div>
        )}
      </div>

      <OrderDetailSheet 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={() => refetch()}
      />
    </div>
  );
}
