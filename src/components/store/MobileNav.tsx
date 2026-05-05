'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut, LayoutDashboard, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/stores/useCartStore';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCartStore();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] flex flex-col" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="text-left font-display text-2xl">Fashion Store</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8 flex-1">
          <Link href="/collections/new" onClick={() => setOpen(false)} className="text-lg font-medium">Hàng Mới Về</Link>
          <Link href="/collections/shirts" onClick={() => setOpen(false)} className="text-lg font-medium">Áo Sơ Mi</Link>
          <Link href="/collections/pants" onClick={() => setOpen(false)} className="text-lg font-medium">Quần</Link>
          <Link href="/collections/outerwear" onClick={() => setOpen(false)} className="text-lg font-medium">Áo Khoác</Link>
          <Link href="/sale" onClick={() => setOpen(false)} className="text-lg font-medium text-primary">Khuyến Mãi</Link>
        </div>

        <div className="mt-auto border-t border-border pt-4 pb-4">
          {session ? (
            <div className="flex flex-col gap-3">
              <div className="px-2 pb-2 mb-2 border-b border-border">
                <p className="font-medium text-sm">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
              <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium px-2 py-1">
                <User className="h-4 w-4" /> Hồ Sơ
              </Link>
              <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium px-2 py-1">
                <ShoppingBag className="h-4 w-4" /> Đơn Hàng
              </Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium px-2 py-1">
                <Heart className="h-4 w-4" /> Danh Sách Yêu Thích
              </Link>
              {session.user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium px-2 py-1 text-primary">
                  <LayoutDashboard className="h-4 w-4" /> Bảng Điều Khiển Admin
                </Link>
              )}
              <button onClick={() => { setOpen(false); clearCart(); signOut(); }} className="flex items-center gap-2 text-sm font-medium px-2 py-1 text-destructive mt-2 w-full text-left">
                <LogOut className="h-4 w-4" /> Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full justify-start" onClick={() => setOpen(false)}>
                <Link href="/login">Đăng Nhập</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
                <Link href="/register">Đăng Ký</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
