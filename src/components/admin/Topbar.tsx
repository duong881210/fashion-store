'use client';

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/useCartStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { clearCart } = useCartStore();
  
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotificationStore();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Bảng Điều Khiển';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      const segment = segments[1];
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    return 'Quản Trị';
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      router.push(link);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-lg">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute flex h-4 w-4 shrink-0 -top-0.5 -right-0.5 items-center justify-center rounded-full p-0 text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end" forceMount>
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-sm">Thông báo</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={markAllRead}>
                Đánh dấu đã đọc
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Không có thông báo nào.</div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id} 
                    className={`flex flex-col items-start p-4 cursor-pointer gap-1 ${notif.isRead ? 'opacity-70' : 'bg-muted/50'}`}
                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                  >
                    <div className="flex justify-between w-full gap-2">
                      <span className="font-medium text-sm">{notif.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Admin"} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "Quản Trị Viên"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "admin@fashionstore.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href="/profile">Cài Đặt Hồ Sơ</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { clearCart(); signOut({ callbackUrl: '/' }); }}>
              Đăng Xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
