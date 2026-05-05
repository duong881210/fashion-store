"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PackageX, ChevronDown, ChevronUp, MapPin, CreditCard, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-800" },
  shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Đã giao thành công", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
  refunded: { label: "Đã hoàn tiền", color: "bg-slate-100 text-slate-800" }
};

export default function OrdersClient({ initialData }: { initialData: { orders: any[]; totalPages: number } }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const utils = trpc.useUtils();
  const cancelOrder = trpc.order.cancel.useMutation({
    onSuccess: () => {
      toast.success("Hủy đơn hàng thành công");
      utils.order.getMyOrders.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Không thể hủy đơn hàng");
    }
  });

  const handleCancel = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      cancelOrder.mutate({ id });
    }
  };

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        product: item.product,
        name: item.productName,
        image: item.productImage,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      });
    });
    toast.success("Đã thêm các sản phẩm vào giỏ hàng");
    router.push('/cart');
  };

  if (initialData.orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <PackageX className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có đơn hàng nào</h2>
        <p className="text-slate-500 mb-6">Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào.</p>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialData.orders.map((order) => {
        const isExpanded = expandedId === order._id;
        const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-slate-100 text-slate-800" };

        return (
          <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300">
            {/* Order Header - Always visible */}
            <div 
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-slate-50/50"
              onClick={() => setExpandedId(isExpanded ? null : order._id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Mã đơn hàng</p>
                  <p className="font-bold text-slate-900">{order.orderCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Ngày đặt</p>
                  <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tổng tiền</p>
                  <p className="font-bold text-slate-900">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 md:mt-0">
                <Button variant="ghost" size="sm" className="text-slate-500 md:hidden">
                  {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                </Button>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </div>

            {/* Order Details - Expandable */}
            {isExpanded && (
              <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 border-b pb-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Thông tin nhận hàng
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
                      <p className="font-semibold text-slate-900 mb-1">{order.shippingAddress.fullName}</p>
                      <p className="mb-2 text-slate-500">{order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 border-b pb-2">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      Thông tin thanh toán
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Phương thức:</span>
                        <span className="font-medium text-slate-900">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'VNPay'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí giao hàng:</span>
                        <span>{formatCurrency(order.shippingFee)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span>-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4 mb-8">
                  <div className="font-semibold text-slate-900 border-b pb-2">Sản phẩm đã đặt</div>
                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 py-2">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          <Image src={item.productImage || '/placeholder.png'} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <Link href={`/products/${item.product}`} className="font-medium text-slate-900 hover:text-slate-600 line-clamp-1">
                            {item.productName}
                          </Link>
                          <div className="text-sm text-slate-500 mt-1">
                            {item.color} / {item.size} <span className="mx-2">•</span> SL: {item.quantity}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="font-medium text-slate-900">
                            {formatCurrency(item.price)}
                          </div>
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                              <Link href={`/products/${item.product}?review=true`}>Đánh giá</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <div className="font-semibold text-slate-900 border-b pb-2">Trạng thái đơn hàng</div>
                    <div className="space-y-4 pl-4 border-l-2 border-slate-100 ml-2">
                      {order.timeline.map((event: any, idx: number) => (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${idx === order.timeline.length - 1 ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                          <p className="text-sm font-medium text-slate-900">{event.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(event.timestamp).toLocaleString('vi-VN')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-end border-t pt-6">
                  {order.status === 'pending' && (
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleCancel(order._id)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Hủy đơn hàng
                    </Button>
                  )}
                  <Button variant="outline" className="bg-slate-50 hover:bg-slate-100" onClick={() => handleReorder(order)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Mua lại đơn này
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
