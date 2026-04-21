'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import MobileNav from './MobileNav';
import MiniCart from './MiniCart';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCartStore();
  const { data: session } = useSession();

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
          <Link href="/collections/new" className="text-sm font-medium hover:text-primary transition-colors">New Arrivals</Link>
          <Link href="/collections/shirts" className="text-sm font-medium hover:text-primary transition-colors">Shirts</Link>
          <Link href="/collections/pants" className="text-sm font-medium hover:text-primary transition-colors">Pants</Link>
          <Link href="/collections/outerwear" className="text-sm font-medium hover:text-primary transition-colors">Outerwear</Link>
          <Link href="/sale" className="text-sm font-medium text-primary transition-colors">Sale</Link>
        </nav>
        
        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex relative">
            <Heart className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="secondary">0</Badge>
          </Button>

          <Button variant="ghost" size="icon" className="relative pointer-events-auto" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="default">
                {totalItems()}
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
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/orders">Orders</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/wishlist">Wishlist</Link></DropdownMenuItem>
                {session.user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/admin">Admin Dashboard</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <MiniCart />
    </header>
  );
}
