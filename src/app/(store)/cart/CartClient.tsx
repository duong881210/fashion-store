"use client";

import { useState, useTransition, useOptimistic, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { trpc } from "@/lib/trpc";
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export default function CartClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const localTotal = useCartStore((state) => state.total);
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState({ value: 0, message: "", isError: false, code: "" });

  const validateCoupon = trpc.coupon.validate.useMutation({
    onSuccess: (data) => {
      if (data.isValid) {
        setDiscount({ value: data.discount, message: data.message, isError: false, code: couponCode });
        toast.success(data.message);
      } else {
        setDiscount({ value: 0, message: data.message, isError: true, code: "" });
        toast.error(data.message);
      }
    },
    onError: (err) => {
      setDiscount({ value: 0, message: err.message, isError: true, code: "" });
      toast.error(err.message);
    }
  });

  const { mutate: backendRemoveItem } = trpc.cart.removeItem.useMutation({
    onError: (err) => toast.error(err.message || "Lỗi khi xóa sản phẩm")
  });
  
  const { mutate: backendUpdateQuantity } = trpc.cart.updateQuantity.useMutation({
    onError: (err) => toast.error(err.message || "Lỗi khi cập nhật số lượng")
  });

  const handleRemoveItem = (productId: string, color: string, size: string) => {
    removeItem(productId, color, size);
    if (isLoggedIn) {
      backendRemoveItem({ productId, color, size });
    }
  };

  const handleUpdateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    updateQuantity(productId, color, size, quantity);
    if (isLoggedIn) {
      backendUpdateQuantity({ productId, color, size, quantity });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;


  const subtotal = localTotal();
  const total = subtotal - discount.value;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCoupon.mutate({ code: couponCode, orderValue: subtotal });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-20 w-20 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá những bộ sưu tập mới nhất của chúng tôi.
        </p>
        <Button size="lg" asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/products">Khám phá sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
      {/* Left - Cart Items */}
      <div className="w-full lg:w-3/5 space-y-6">
        <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 pb-4 border-b">
          <div className="col-span-6">Sản phẩm</div>
          <div className="col-span-3 text-center">Số lượng</div>
          <div className="col-span-3 text-right">Tổng cộng</div>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={`${item.product}-${item.color}-${item.size}`} className="flex flex-col sm:flex-row gap-4 py-4 border-b group">
              <div className="relative w-24 h-32 sm:w-32 sm:h-40 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {/* Out of stock warning placeholder */}
                {/* <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Hết hàng</span>
                </div> */}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/products/${item.product}`} className="font-semibold text-slate-900 hover:text-slate-600 transition-colors text-lg pr-4">
                      {item.name}
                    </Link>
                    <button 
                      onClick={() => handleRemoveItem(item.product, item.color, item.size)}
                      className="text-slate-400 hover:text-red-500 transition-colors hidden sm:block p-2 -mr-2"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-500 space-y-1 mb-4">
                    <p>Màu sắc: <span className="font-medium text-slate-900">{item.color}</span></p>
                    <p>Size: <span className="font-medium text-slate-900">{item.size}</span></p>
                    <p className="font-medium text-slate-900">{formatCurrency(item.price)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto sm:mt-0">
                  <div className="flex items-center border rounded-md bg-white">
                    <button 
                      className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                      onClick={() => item.quantity > 1 && handleUpdateQuantity(item.product, item.color, item.size, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button 
                      className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                      onClick={() => handleUpdateQuantity(item.product, item.color, item.size, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-slate-900 hidden sm:block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button 
                      onClick={() => handleRemoveItem(item.product, item.color, item.size)}
                      className="text-slate-400 hover:text-red-500 transition-colors sm:hidden p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Order Summary */}
      <div className="w-full lg:w-2/5">
        <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 sticky top-24 border border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount.value > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({discount.code})</span>
                <span>-{formatCurrency(discount.value)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Phí giao hàng</span>
              <span className="text-slate-900">Tính khi thanh toán</span>
            </div>
          </div>

          <div className="border-t border-slate-200 py-6 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-slate-900">Tổng cộng</span>
              <span className="font-bold text-2xl text-slate-900">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-slate-500 text-right">Đã bao gồm VAT (nếu có)</p>
          </div>

          <div className="mb-8">
            <div className="flex gap-2">
              <Input 
                placeholder="Mã giảm giá" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className={`bg-white ${discount.isError ? 'border-red-500' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <Button variant="outline" onClick={handleApplyCoupon} disabled={validateCoupon.isPending}>
                Áp dụng
              </Button>
            </div>
            {discount.message && (
              <p className={`text-xs mt-2 ${discount.isError ? 'text-red-500' : 'text-green-600'}`}>
                {discount.message}
              </p>
            )}
          </div>

          <Button 
            className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white mb-6 shadow-xl shadow-slate-200"
            onClick={() => router.push(isLoggedIn ? '/checkout' : '/login?callbackUrl=/checkout')}
          >
            Tiến hành thanh toán
          </Button>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm justify-center">
              <ShieldCheck className="h-5 w-5 text-slate-400" />
              <span>Thanh toán bảo mật 100%</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-sm justify-center">
              <RefreshCcw className="h-5 w-5 text-slate-400" />
              <span>Đổi trả dễ dàng trong 30 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
