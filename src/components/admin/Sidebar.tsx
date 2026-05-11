'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { useNotificationStore } from '@/stores/useNotificationStore';

const navItems = [
  { name: 'Bảng Điều Khiển', href: '/admin', icon: LayoutDashboard },
  { name: 'Sản Phẩm', href: '/admin/products', icon: Package },
  { name: 'Đơn Hàng', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Khách Hàng', href: '/admin/customers', icon: Users },
  { name: 'Trò Chuyện', href: '/admin/chat', icon: MessageSquare, badge: true },
  { name: 'Thống Kê', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Cài Đặt', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const chatUnread = useNotificationStore(state => state.chatUnread);

  return (
    <aside className={cn(
      "bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 flex flex-col z-50",
      collapsed ? "w-[80px]" : "w-[240px]"
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/admin" className="font-display font-bold text-lg tracking-tight truncate">
            Bảng Quản Trị
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="font-display font-bold text-lg mx-auto">
            A
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "hidden md:flex absolute -right-4 bg-card border rounded-full")}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
          return (
            <Link key={item.name} href={item.href}>
              <span className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center"
              )}>
                <div className="flex items-center">
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </div>
                {!collapsed && item.badge && chatUnread > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {chatUnread > 99 ? '99+' : chatUnread}
                  </span>
                )}
                {collapsed && item.badge && chatUnread > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer link to store */}
      <div className="p-4 border-t border-border">
        <Link href="/">
          <span className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <ChevronLeft className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>Trở về Cửa Hàng</span>}
          </span>
        </Link>
      </div>
    </aside>
  );
}
