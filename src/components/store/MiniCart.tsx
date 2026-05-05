"use client";

import { useCartStore } from "@/stores/useCartStore";
import { useUIStore } from "@/stores/useUIStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function MiniCart() {
  const { isCartSidebarOpen, closeCartSidebar, openCartSidebar } = useUIStore();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const localTotal = useCartStore((state) => state.total);
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const { mutate: backendRemoveItem } = trpc.cart.removeItem.useMutation({
    onError: (err) => toast.error(err.message || "Lỗi khi xóa sản phẩm")
  });

  const handleRemoveItem = (productId: string, color: string, size: string) => {
    removeItem(productId, color, size);
    if (session) {
      backendRemoveItem({ productId, color, size });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={isCartSidebarOpen} onOpenChange={(open) => open ? openCartSidebar() : closeCartSidebar()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white border-l-0 shadow-2xl p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold font-serif">
              Giỏ hàng ({items.reduce((acc, item) => acc + item.quantity, 0)})
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-lg">Giỏ hàng của bạn đang trống</p>
              <Button asChild className="mt-4" onClick={closeCartSidebar}>
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.product}-${item.color}-${item.size}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {/* Fallback to a placeholder if no image exists in local storage */}
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <Link href={`/products/${item.product}`} onClick={closeCartSidebar} className="font-medium text-slate-900 hover:text-slate-600 transition-colors line-clamp-2 pr-4">
                        {item.name}
                      </Link>
                      <button 
                        onClick={() => handleRemoveItem(item.product, item.color, item.size)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 text-sm text-slate-500 space-x-2">
                      <span>Màu: <span className="font-medium">{item.color}</span></span>
                      <span>•</span>
                      <span>Size: <span className="font-medium">{item.size}</span></span>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm font-medium">SL: {item.quantity}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-white mt-auto">
            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(localTotal())}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" asChild onClick={closeCartSidebar}>
                <Link href="/cart">Xem giỏ hàng</Link>
              </Button>
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" asChild onClick={closeCartSidebar}>
                <Link href="/checkout">Thanh toán</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
