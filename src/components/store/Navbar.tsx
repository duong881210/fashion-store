'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, X, Loader2 } from 'lucide-react';
import MobileNav from './MobileNav';
import { MiniCart } from './MiniCart';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';

import { useUIStore } from '@/stores/useUIStore';
import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCart = useCartStore((state) => state.setCart);
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { openCartSidebar } = useUIStore();
  const { data: session } = useSession();
  const { data: profile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = trpc.product.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: isSearchOpen && debouncedQuery.trim().length > 1,
    }
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSearchClick = () => {
    if (isSearchOpen) {
      if (searchQuery.trim()) {
        handleSearchSubmit();
      } else {
        setIsSearchOpen(false);
      }
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSelectProduct = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

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
          {!isSearchOpen && (
            <Link href="/" className="hidden md:flex font-display text-2xl font-bold tracking-tight transition-opacity duration-300">
              Fashion Store
            </Link>
          )}
        </div>

        {/* Centered Logo for mobile */}
        {!isSearchOpen && (
          <Link href="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xl font-bold tracking-tight transition-opacity duration-300">
            Fashion
          </Link>
        )}

        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search container */}
          <div ref={searchContainerRef} className="relative flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isSearchOpen
                  ? "w-32 min-[400px]:w-48 sm:w-72 md:w-96 opacity-100 mr-2"
                  : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-9 px-3 py-2 text-sm bg-background/50 backdrop-blur-sm border border-input rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary transition-all shadow-sm"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-muted"
              onClick={handleSearchClick}
              title={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>

            {/* Dropdown for suggestions */}
            {isSearchOpen && searchQuery.trim().length > 1 && (
              <div className="absolute right-0 top-12 z-50 w-[280px] min-[400px]:w-[320px] sm:w-[400px] bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Đang tìm kiếm...</span>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50">
                      Gợi ý sản phẩm ({searchResults.length})
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults.map((product: any) => {
                        const image = product.images?.[0] || '/images/placeholder.jpg';
                        return (
                          <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            onClick={handleSelectProduct}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-muted/70 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0 relative border border-border/50">
                              <img
                                src={image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs font-semibold text-primary mt-0.5">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(product.price)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-border/50 mt-1 px-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-primary font-medium hover:text-primary-hover hover:bg-muted/50 rounded-lg justify-center"
                        onClick={handleSearchSubmit}
                      >
                        Xem tất cả kết quả cho &quot;{searchQuery}&quot;
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Không tìm thấy kết quả nào
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

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
                    <AvatarImage src={profile?.avatar || session.user?.image || ""} alt={profile?.name || session.user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10">
                      {(profile?.name || session.user?.name) ? (profile?.name || session.user.name).charAt(0).toUpperCase() : "U"}
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
