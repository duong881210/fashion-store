'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CustomerClientTableProps {
  initialData: {
    users: any[];
    total: number;
    totalPages: number;
    page: number;
  };
}

export function CustomerClientTable({ initialData }: CustomerClientTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = trpc.user.getAll.useQuery(
    { page, limit: 10, search: debouncedSearch },
    { initialData: debouncedSearch === '' && page === 1 ? initialData : undefined }
  );

  const toggleActiveMutation = trpc.user.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('Cập nhật trạng thái khách hàng thành công');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });

  const handleToggleActive = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn thay đổi trạng thái khách hàng này?')) {
      toggleActiveMutation.mutate({ userId });
    }
  };

  const users = data?.users || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email, sđt..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
              <tr>
                <th className="py-4 px-6 font-medium">Khách Hàng</th>
                <th className="py-4 px-6 font-medium">Thông Tin</th>
                <th className="py-4 px-6 font-medium text-center">Đơn Hàng</th>
                <th className="py-4 px-6 font-medium text-right">Tổng Chi Tiêu</th>
                <th className="py-4 px-6 font-medium">Ngày Tham Gia</th>
                <th className="py-4 px-6 font-medium text-center">Trạng Thái</th>
                <th className="py-4 px-6 font-medium text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/customers/${user._id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium truncate max-w-[150px]">{user.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="py-4 px-6 text-center font-medium">
                      {user.ordersCount || 0}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-primary">
                      {formatCurrency(user.totalSpent || 0)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-sm whitespace-nowrap">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={user.isActive !== false ? "default" : "destructive"} className={user.isActive !== false ? "bg-emerald-500 hover:bg-emerald-600 font-normal" : "font-normal"}>
                        {user.isActive !== false ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/customers/${user._id}`);
                          }}>
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleToggleActive(e, user._id)}
                            className={user.isActive !== false ? "text-red-600 focus:text-red-600" : "text-emerald-600 focus:text-emerald-600"}
                          >
                            {user.isActive !== false ? (
                              <><Ban className="mr-2 h-4 w-4" /> Khóa tài khoản</>
                            ) : (
                              <><CheckCircle2 className="mr-2 h-4 w-4" /> Mở khóa</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Trang {page} / {data.totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
