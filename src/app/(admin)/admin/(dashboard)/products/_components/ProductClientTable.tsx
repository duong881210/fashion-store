'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function ProductClientTable({ initialData, categories }: { initialData: any, categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const categoryFilter = searchParams.get('category') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL on search change
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) params.set('search', debouncedSearch);
      else params.delete('search');
      
      // Reset page when search changes
      params.delete('page');
      
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const { data, refetch } = trpc.product.getAdminList.useQuery(
    { page, limit: 10, search: debouncedSearch, category: categoryFilter, status: statusFilter as any },
    { initialData: initialData as any }
  );

  const bulkMutation = trpc.product.bulkAction.useMutation({
    onSuccess: () => {
      toast.success('Thao tác hàng loạt hoàn tất');
      setSelectedIds([]);
      refetch();
    }
  });

  const handleBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
    if (!selectedIds.length) return;
    if (action === 'delete' && !confirm('Bạn có chắc chắn muốn xóa các sản phẩm này?')) return;
    bulkMutation.mutate({ ids: selectedIds, action });
  };

  const toggleAll = () => {
    if (selectedIds.length === data.products.length) setSelectedIds([]);
    else setSelectedIds(data.products.map((p: any) => p._id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(v) => {
             const params = new URLSearchParams(searchParams.toString());
             if (v !== 'all') params.set('category', v); else params.delete('category');
             params.set('page', '1');
             router.push(`${pathname}?${params.toString()}`);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => {
             const params = new URLSearchParams(searchParams.toString());
             if (v !== 'all') params.set('status', v); else params.delete('status');
             params.set('page', '1');
             router.push(`${pathname}?${params.toString()}`);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link href="/admin/products/new">
          <Button className="flex gap-2">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-muted px-4 py-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.length} đã chọn</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('publish')}>Xuất bản</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('unpublish')}>Hủy xuất bản</Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="h-4 w-4 mr-2" /> Xóa
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length === data.products.length && data.products.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product: any) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(product._id)}
                    onCheckedChange={() => toggleOne(product._id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 relative bg-muted rounded overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{product.slug}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.price.toLocaleString('vi-VN')} đ</span>
                    {product.salePrice && <span className="text-xs text-muted-foreground line-through">{product.salePrice.toLocaleString('vi-VN')} đ</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${product.totalStock < 5 ? 'text-red-500' : product.totalStock < 20 ? 'text-amber-500' : 'text-green-600'}`}>
                    {product.totalStock}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                    {product.isPublished ? 'Đã xuất bản' : 'Nháp'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/admin/products/${product._id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> Xem trên cửa hàng
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data.products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị trang {data.page} trên {Math.max(1, data.totalPages)}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', (page - 1).toString());
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            Trước
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', (page + 1).toString());
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
