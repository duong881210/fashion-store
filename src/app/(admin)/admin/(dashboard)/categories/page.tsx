'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Folder, Loader2 } from 'lucide-react';

interface CategoryFormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  isActive: boolean;
  order: number;
}

const initialFormState: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  parent: null,
  isActive: true,
  order: 0,
};

export default function AdminCategoriesPage() {
  const { data: categoriesData, isLoading, refetch } = trpc.category.getAll.useQuery();
  const categories = (categoriesData || []) as any[];
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>(initialFormState);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = trpc.category.create.useMutation({
    onSuccess: () => {
      toast.success("Thêm danh mục mới thành công");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi thêm danh mục");
    }
  });

  const updateMutation = trpc.category.update.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi cập nhật danh mục");
    }
  });

  const deleteMutation = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Xóa danh mục thành công");
      refetch();
      setIsDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi xóa danh mục");
    }
  });

  // Slug generator helper
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s-]|_)+/g, '')
      .trim()
      .replace(/\s+/g, '-');
      
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: any) => {
    setFormData({
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent || null,
      isActive: category.isActive !== false,
      order: category.order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng điền đầy đủ Tên và Đường dẫn slug");
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      parent: formData.parent ? formData.parent : null,
      isActive: formData.isActive,
      order: Number(formData.order),
    };

    if (formData.id) {
      updateMutation.mutate({
        id: formData.id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  // Find parent name
  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return '—';
    const parent = categories.find(c => c._id === parentId);
    return parent ? parent.name : '—';
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter list of potential parents (exclude current category if editing)
  const potentialParents = categories.filter(c => !formData.id || c._id !== formData.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground text-sm">Quản lý các nhóm sản phẩm trong cửa hàng của bạn.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            Hiện có {categories.length} danh mục sản phẩm trên hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p>Chưa có danh mục nào được tạo.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Danh mục cha</TableHead>
                    <TableHead className="text-center">Thứ tự</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-semibold">{category.name}</TableCell>
                      <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                      <TableCell>{getParentName(category.parent)}</TableCell>
                      <TableCell className="text-center">{category.order}</TableCell>
                      <TableCell className="text-center">
                        {category.isActive !== false ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Ẩn</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleOpenDelete(category._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết của danh mục dưới đây. Nhấp lưu để hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleNameChange(e.target.value)} 
                placeholder="Ví dụ: Áo Thun Nam"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Đường dẫn tĩnh)</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} 
                placeholder="ao-thun-nam"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Danh mục cha (Tùy chọn)</Label>
              <Select 
                value={formData.parent || 'none'} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, parent: val === 'none' ? null : val }))}
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                  {potentialParents.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (Không bắt buộc)</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả cho nhóm danh mục này..."
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự hiển thị</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between self-end pb-3">
                <Label htmlFor="isActive" className="cursor-pointer">Kích hoạt</Label>
                <Switch 
                  id="isActive" 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu Danh Mục'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa Danh Mục</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu. 
              Lưu ý: Không thể xóa nếu danh mục này đang chứa các danh mục con khác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xác Nhận Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
