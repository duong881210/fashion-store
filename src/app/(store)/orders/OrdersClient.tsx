"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PackageX, ChevronDown, ChevronUp, MapPin, CreditCard, XCircle, RotateCcw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import { RefundRequestDialog } from "./_components/RefundRequestDialog";

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
  refunded: { label: "Đã hoàn tiền", color: "bg-slate-100 text-slate-800" },
  refund_requested: { label: "Chờ hoàn tiền", color: "bg-orange-100 text-orange-800" }
};

const tabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refunded", label: "Hoàn tiền" },
];

export default function OrdersClient({ initialData }: { initialData: { orders: any[]; total: number; totalPages: number } }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<any | null>(null);
  const { addItem } = useCartStore();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.order.getMyOrders.useQuery(
    { page, limit, status: statusFilter },
    {
      initialData: page === 1 && statusFilter === "all" ? initialData : undefined,
      placeholderData: (prev) => prev,
      refetchOnWindowFocus: false,
    }
  );

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

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

  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const handlePayment = async (orderId: string) => {
    setPayingOrderId(orderId);
    toast.info("Đang chuyển hướng đến cổng thanh toán VNPay...");
    try {
      const res = await fetch("/api/vnpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi kết nối cổng thanh toán");
      }

      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error.message || "Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại sau.");
      setPayingOrderId(null);
    }
  };

  const hasNoOrdersAtAll = statusFilter === "all" && orders.length === 0 && !isLoading;

  if (hasNoOrdersAtAll) {
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
      {/* Horizontal Tabs Filter */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth gap-2 pb-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
                setExpandedId(null);
              }}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <PackageX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy đơn hàng</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Bạn không có đơn hàng nào ở trạng thái "{tabs.find((t) => t.value === statusFilter)?.label || statusFilter}".
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order: any) => {
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
                                    <Link href={`/products/${item.product}?review=true&orderId=${order._id}`}>Đánh giá</Link>
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
                        {order.paymentMethod === 'vnpay' && order.paymentStatus === 'unpaid' && order.status === 'pending' && (
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                            onClick={() => handlePayment(order._id)}
                            disabled={payingOrderId === order._id}
                          >
                            {payingOrderId === order._id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4 mr-2" />
                            )}
                            Thanh toán ngay
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleCancel(order._id)} disabled={payingOrderId === order._id}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Hủy đơn hàng
                          </Button>
                        )}
                        {order.status === 'delivered' && order.paymentStatus === 'paid' && (
                          <Button 
                            variant="outline" 
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700" 
                            onClick={() => setSelectedRefundOrder(order)}
                            disabled={payingOrderId === order._id}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Trả hàng / Hoàn tiền
                          </Button>
                        )}
                        <Button variant="outline" className="bg-slate-50 hover:bg-slate-100" onClick={() => handleReorder(order)} disabled={payingOrderId === order._id}>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 mt-8">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span> -{" "}
                <span className="font-semibold text-slate-900">{Math.min(page * limit, total)}</span> trong tổng số{" "}
                <span className="font-semibold text-slate-900">{total}</span> đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                
                {Array.from({ length: totalPages }, (_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === page;
                  return (
                    <Button
                      key={pageNum}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 p-0 rounded-lg ${
                        isCurrent 
                          ? "bg-slate-900 text-white hover:bg-slate-800" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedRefundOrder && (
        <RefundRequestDialog
          order={selectedRefundOrder}
          isOpen={!!selectedRefundOrder}
          onClose={() => setSelectedRefundOrder(null)}
          onSuccess={() => utils.order.getMyOrders.invalidate()}
        />
      )}
    </div>
  );
}
