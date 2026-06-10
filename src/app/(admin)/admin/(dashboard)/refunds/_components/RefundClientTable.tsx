'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { RefundDetailSheet } from './RefundDetailSheet';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface RefundClientTableProps {
  initialData: {
    requests: any[];
    total: number;
    totalPages: number;
  };
}

const REQUEST_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  approved: { label: 'Đã chấp nhận', variant: 'success' },
  rejected: { label: 'Đã từ chối', variant: 'destructive' },
};

export function RefundClientTable({ initialData }: RefundClientTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.order.getRefundRequests.useQuery(
    {
      page,
      limit: 15,
      status: statusFilter,
    },
    {
      initialData,
    }
  );

  const requests = data?.requests || [];

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-background">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Lọc Trạng thái
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Trạng thái yêu cầu</h4>
                  <select 
                    className="w-full text-sm border rounded p-1.5"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">Tất cả</option>
                    {Object.entries(REQUEST_STATUS_MAP).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
              <tr>
                <th className="py-4 px-6 font-medium">Mã ĐH</th>
                <th className="py-4 px-6 font-medium">Khách Hàng</th>
                <th className="py-4 px-6 font-medium">Lý Do</th>
                <th className="py-4 px-6 font-medium text-right">Số Tiền Hoàn</th>
                <th className="py-4 px-6 font-medium text-center">Trạng Thái</th>
                <th className="py-4 px-6 font-medium">Ngày Yêu Cầu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Không tìm thấy yêu cầu nào.
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => {
                  const statusInfo = REQUEST_STATUS_MAP[req.status] || { label: req.status, variant: 'default' };
                  return (
                    <tr 
                      key={req._id} 
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="py-4 px-6 font-mono font-medium">{req.order?.orderCode}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{req.customer?.name}</div>
                        <div className="text-xs text-muted-foreground">{req.customer?.email}</div>
                      </td>
                      <td className="py-4 px-6 truncate max-w-xs">{req.reason}</td>
                      <td className="py-4 px-6 text-right font-medium">{formatCurrency(req.amount)}</td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={statusInfo.variant as any}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
            >
              Trang trước
            </Button>
            <span className="text-xs text-muted-foreground">Trang {page} / {data.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(p => Math.min(p + 1, data.totalPages))}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>

      <RefundDetailSheet 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={() => refetch()}
      />
    </div>
  );
}
