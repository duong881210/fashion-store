'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Copy, MapPin, Package, CreditCard, Clock } from "lucide-react";
import Image from "next/image";

interface OrderDetailSheetProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
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

export function OrderDetailSheet({ order, isOpen, onClose, onUpdate }: OrderDetailSheetProps) {
  const [status, setStatus] = useState<string>(order?.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState<string>(order?.paymentStatus || 'unpaid');

  const updateMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi cập nhật");
    }
  });

  if (!order) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      id: order._id,
      status: status as any,
      paymentStatus: paymentStatus as any,
    });
  };

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, variant: 'default' };
  const paymentStatusInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus, variant: 'default' };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-mono text-xl">{order.orderCode}</SheetTitle>
            <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
          </div>
          <SheetDescription>
            Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center text-muted-foreground">
              <UsersIcon className="w-4 h-4 mr-2" /> Thông tin khách hàng
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tên:</span>
                <span className="font-medium">{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">SĐT:</span>
                <div className="flex items-center gap-2 font-medium">
                  {order.shippingAddress.phone}
                  <button onClick={() => handleCopy(order.shippingAddress.phone)} className="text-muted-foreground hover:text-foreground">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{order.customer?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.ward}, {order.shippingAddress.district}</p>
              <p>{order.shippingAddress.province}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center text-muted-foreground">
              <Package className="w-4 h-4 mr-2" /> Sản phẩm ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium line-clamp-2">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Màu: {item.color} | Size: {item.size}
                    </p>
                    <div className="flex justify-between text-sm mt-2">
                      <span>{item.quantity} x {formatCurrency(item.price)}</span>
                      <span className="font-medium">{formatCurrency(item.quantity * item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí giao hàng:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center text-muted-foreground">
              <CreditCard className="w-4 h-4 mr-2" /> Thanh toán
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm flex justify-between items-center">
              <div>
                <p className="font-medium uppercase">{order.paymentMethod}</p>
              </div>
              <Badge variant={paymentStatusInfo.variant as any}>{paymentStatusInfo.label}</Badge>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" /> Lịch sử
              </h3>
              <div className="space-y-4 pl-2">
                {order.timeline.map((event: any, idx: number) => (
                  <div key={idx} className="relative pl-6 pb-4 last:pb-0 border-l border-muted">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground mb-1">{new Date(event.timestamp).toLocaleString('vi-VN')}</p>
                    <p className="text-sm">{event.message || `Chuyển sang: ${STATUS_MAP[event.status]?.label || event.status}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Update Status Form */}
          <div className="space-y-4 pt-2 pb-6">
            <h3 className="font-medium">Cập nhật đơn hàng</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Trạng thái giao hàng</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipping">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="refunded">Hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Trạng thái thanh toán</label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleUpdate}
                disabled={updateMutation.isPending || (status === order.status && paymentStatus === order.paymentStatus)}
              >
                {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật đơn hàng"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Just a quick icon helper since Users is used but not imported at top
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
