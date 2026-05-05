'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import MobileNav from './MobileNav';
import { MiniCart } from './MiniCart';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';

import { useUIStore } from '@/stores/useUIStore';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCart = useCartStore((state) => state.setCart);
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { openCartSidebar } = useUIStore();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const { data: backendCart } = trpc.cart.get.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session && backendCart?.items) {
      const formattedItems = backendCart.items.map((item: any) => ({
        product: item.product,
        name: item.productName,
        price: item.priceAtAdd,
        image: item.productImage,
        color: item.color,
        size: item.size,
        quantity: item.quantity
      }));
      setCart(formattedItems);
    }
  }, [session, backendCart, setCart]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between pointer-events-auto">

        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="hidden md:flex font-display text-2xl font-bold tracking-tight">
            Fashion Store
          </Link>
        </div>

        {/* Centered Logo for mobile */}
        <Link href="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xl font-bold tracking-tight">
          Fashion
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/collections/new" className="text-sm font-medium hover:text-primary transition-colors">Hàng Mới Về</Link>
          <Link href="/collections/shirts" className="text-sm font-medium hover:text-primary transition-colors">Áo Sơ Mi</Link>
          <Link href="/collections/pants" className="text-sm font-medium hover:text-primary transition-colors">Quần</Link>
          <Link href="/collections/outerwear" className="text-sm font-medium hover:text-primary transition-colors">Áo Khoác</Link>
          <Link href="/sale" className="text-sm font-medium text-primary transition-colors">Khuyến Mãi</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex relative" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="secondary">0</Badge> */}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative pointer-events-auto" onClick={openCartSidebar}>
            <ShoppingBag className="h-5 w-5" />
            {mounted && cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="default">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild><Link href="/profile">Hồ Sơ</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/orders">Đơn Hàng</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/wishlist">Danh Sách Yêu Thích</Link></DropdownMenuItem>
                {session.user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/admin">Bảng Điều Khiển Admin</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { clearCart(); signOut(); }}>Đăng Xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Đăng Nhập</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">Đăng Ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <MiniCart />
    </header>
  );
}
