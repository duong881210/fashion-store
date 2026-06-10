'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Calendar, CreditCard, User, MessageSquare, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';

interface RefundDetailSheetProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const REQUEST_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  approved: { label: 'Đã chấp nhận', variant: 'success' },
  rejected: { label: 'Đã từ chối', variant: 'destructive' },
};

export function RefundDetailSheet({ request, isOpen, onClose, onUpdate }: RefundDetailSheetProps) {
  const [adminComment, setAdminComment] = useState('');

  const resolveMutation = trpc.order.resolveRefundRequest.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.status === 'approved' 
          ? 'Đã phê duyệt yêu cầu hoàn tiền thành công!' 
          : 'Đã từ chối yêu cầu hoàn tiền!'
      );
      onUpdate();
      onClose();
      setAdminComment('');
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi xử lý yêu cầu');
    },
  });

  if (!request) return null;

  const order = request.order;
  const statusInfo = REQUEST_STATUS_MAP[request.status] || { label: request.status, variant: 'default' };

  const handleAction = (action: 'approve' | 'reject') => {
    if (action === 'approve') {
      const confirmMsg = order?.paymentMethod === 'vnpay'
        ? 'Bạn có chắc chắn muốn phê duyệt yêu cầu này? Hệ thống sẽ gọi API VNPay để tự động hoàn tiền giao dịch này.'
        : 'Bạn có chắc chắn muốn phê duyệt yêu cầu này? Vì đơn hàng là COD, vui lòng đảm bảo đã hoàn tiền thủ công cho khách hàng.';
      if (!confirm(confirmMsg)) return;
    } else {
      if (!adminComment.trim()) {
        toast.error('Vui lòng nhập lý do từ chối vào ô phản hồi.');
        return;
      }
      if (!confirm('Từ chối yêu cầu hoàn tiền này?')) return;
    }

    resolveMutation.mutate({
      requestId: request._id,
      action,
      adminComment,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-bold text-xl">Chi tiết yêu cầu hoàn trả</SheetTitle>
            <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
          </div>
          <SheetDescription>
            Gửi ngày {new Date(request.createdAt).toLocaleString('vi-VN')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Customer info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center text-slate-500 uppercase tracking-wider">
              <User className="w-4 h-4 mr-2" /> Khách hàng
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-medium text-slate-800">{request.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{request.customer?.email}</span>
              </div>
            </div>
          </div>

          {/* Order info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center text-slate-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 mr-2" /> Đơn hàng liên quan
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-slate-900">{order?.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức thanh toán:</span>
                <span className="font-medium text-slate-800 uppercase">{order?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng tiền đơn hàng:</span>
                <span className="font-bold text-slate-900">{formatCurrency(request.amount)}</span>
              </div>
            </div>
          </div>

          {/* Refund Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center text-slate-500 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 mr-2" /> Lý do & Mô tả
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Lý do chính</span>
                <span className="text-sm font-semibold text-slate-800">{request.reason}</span>
              </div>
              {request.description && (
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Mô tả chi tiết</span>
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed whitespace-pre-line">
                    {request.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Images Proof */}
          {request.images && request.images.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center text-slate-500 uppercase tracking-wider">
                Hình ảnh bằng chứng ({request.images.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {request.images.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-square border rounded-2xl overflow-hidden bg-slate-50 hover:opacity-95 transition-opacity cursor-pointer">
                    <Image src={imgUrl} alt={`Proof image ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Resolved details if not pending */}
          {request.status !== 'pending' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center text-slate-500 uppercase tracking-wider">
                Kết quả xử lý
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-sm border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`font-semibold ${request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                    {request.status === 'approved' ? 'Chấp nhận hoàn tiền' : 'Từ chối hoàn tiền'}
                  </span>
                </div>
                {request.adminComment && (
                  <div>
                    <span className="text-slate-500 block mb-1">Ghi chú của Admin:</span>
                    <p className="p-3 bg-white border rounded-xl text-slate-600 leading-relaxed">{request.adminComment}</p>
                  </div>
                )}
                {request.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời gian xử lý:</span>
                    <span>{new Date(request.resolvedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Area for Pending Requests */}
          {request.status === 'pending' && (
            <div className="space-y-4 pt-2 pb-6 border-t">
              <div className="space-y-2">
                <Label htmlFor="adminComment" className="font-semibold text-slate-800">Phản hồi của Admin <span className="text-slate-400 font-normal">(Bắt buộc nếu từ chối)</span></Label>
                <Textarea
                  id="adminComment"
                  placeholder="Ghi chú lý do từ chối hoặc thông tin hướng dẫn hoàn trả..."
                  className="min-h-20 rounded-xl focus:ring-slate-900 border-slate-200"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 h-11 rounded-xl cursor-pointer"
                  onClick={() => handleAction('reject')}
                  disabled={resolveMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl cursor-pointer"
                  onClick={() => handleAction('approve')}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Phê duyệt
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
