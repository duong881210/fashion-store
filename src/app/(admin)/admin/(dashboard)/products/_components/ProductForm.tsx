'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { trpc } from '@/lib/trpc';
import { createProductSchema } from '@/server/trpc/schemas/product.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical, Star, X } from 'lucide-react';
import { toast } from 'sonner';

// Dynamic import for MD Editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Sortable Image Item Component
function SortableImage({ id, url, onRemove, isFirst }: { id: string, url: string, onRemove: () => void, isFirst: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group w-32 h-32 rounded-lg border overflow-hidden bg-muted">
      <div {...attributes} {...listeners} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing hover:bg-black/10 transition-colors" />
      <Image src={url} alt="Product image" fill className="object-cover" />
      {isFirst && <Badge className="absolute top-1 left-1 z-20 pointer-events-none" variant="default"><Star className="w-3 h-3 mr-1" /> Cover</Badge>}
      <Button 
        type="button" 
        variant="destructive" 
        size="icon" 
        className="absolute top-1 right-1 z-20 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

function generateSlug(text: string) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ProductForm({ initialData, categories }: { initialData?: any, categories: any[] }) {
  const router = useRouter();
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      category: '',
      tags: [],
      images: [],
      variants: [],
      isPublished: false,
      isFeatured: false,
      seoTitle: '',
      seoDescription: ''
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const createMutation = trpc.product.create.useMutation();
  const updateMutation = trpc.product.update.useMutation();

  // Watchers
  const watchName = form.watch('name');
  const watchImages = form.watch('images');
  const watchVariants = form.watch('variants');
  const [customSlug, setCustomSlug] = useState(initialData?.slug || '');
  const [tagInput, setTagInput] = useState('');

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  // Auto-save draft
  useEffect(() => {
    if (initialData) return; // don't draft-save edits
    const draft = localStorage.getItem('product_draft');
    if (draft && !draftLoaded) {
      if (confirm('A saved draft was found. Load it?')) {
        form.reset(JSON.parse(draft));
      }
      setDraftLoaded(true);
    }

    const timer = setInterval(() => {
      if (form.formState.isDirty) {
        setIsDraftSaving(true);
        localStorage.setItem('product_draft', JSON.stringify(form.getValues()));
        setTimeout(() => setIsDraftSaving(false), 1000);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [form, draftLoaded, initialData]);

  const onSubmit = async (values: any) => {
    try {
      if (initialData?._id) {
        await updateMutation.mutateAsync({ id: initialData._id, ...values });
        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Thêm sản phẩm thành công');
        localStorage.removeItem('product_draft'); // clear draft
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error('Lỗi khi lưu sản phẩm: ' + error.message);
    }
  };

  // Image dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = watchImages.indexOf(active.id);
      const newIndex = watchImages.indexOf(over.id);
      form.setValue('images', arrayMove(watchImages, oldIndex, newIndex), { shouldDirty: true });
    }
  };

  const handleTagKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && !form.getValues('tags').includes(tagInput.trim())) {
        form.setValue('tags', [...form.getValues('tags'), tagInput.trim()], { shouldDirty: true });
        setTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    form.setValue('tags', form.getValues('tags').filter((t: string) => t !== tag), { shouldDirty: true });
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* Main Content 2/3 */}
        <div className="flex-1 space-y-6">
          
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Sản Phẩm</FormLabel>
                  <FormControl><Input {...field} placeholder="Nhập tên sản phẩm" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Slug Preview: <Badge variant="secondary">{customSlug || generateSlug(watchName || '')}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh Mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Chọn một danh mục" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                           <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex border rounded-md p-1 flex-wrap gap-1 min-h-10 items-center">
                    {form.getValues('tags')?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 h-6">
                        {tag} <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                    <Input 
                      className="border-0 shadow-none focus-visible:ring-0 w-32 h-7 p-1 text-sm inline-flex flex-1" 
                      placeholder="Nhập & Enter..." 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeydown}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VND)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá Khuyến Mãi (VND)</FormLabel>
                    <FormControl><Input type="number" value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent>
               <CldUploadWidget 
                 uploadPreset="products" 
                 onSuccess={(result: any) => {
                   form.setValue('images', [...watchImages, result.info.secure_url], { shouldDirty: true });
                   setUploadProgress(0);
                 }}
                 options={{ multiple: true }}
               >
                 {({ open }) => (
                   <div 
                     onClick={() => open()} 
                     className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                   >
                     <Plus className="h-8 w-8 mb-2" />
                     <span>Nhấp hoặc thả hình ảnh để tải lên</span>
                   </div>
                 )}
               </CldUploadWidget>

               {watchImages?.length > 0 && (
                 <div className="mt-4">
                   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                     <SortableContext items={watchImages} strategy={horizontalListSortingStrategy}>
                       <div className="flex flex-wrap gap-4">
                         {watchImages.map((url: string, i: number) => (
                           <SortableImage 
                             key={url} 
                             id={url} 
                             url={url} 
                             isFirst={i === 0}
                             onRemove={() => form.setValue('images', watchImages.filter((u: string) => u !== url), { shouldDirty: true })} 
                           />
                         ))}
                       </div>
                     </SortableContext>
                   </DndContext>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent data-color-mode="light">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MDEditor value={field.value || ''} onChange={val => field.onChange(val || '')} height={400} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="flex flex-row justify-between items-center">
               <div>
                 <CardTitle>Biến Thể</CardTitle>
                 <CardDescription>Quản lý màu sắc, kích thước và tồn kho</CardDescription>
               </div>
               <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ color: '', colorHex: '#000000', sizes: [] })}>
                 <Plus className="h-4 w-4 mr-2"/> Thêm Màu
               </Button>
             </CardHeader>
             <CardContent className="space-y-6">
               {variantFields.map((field, index) => (
                 <VariantBuilder key={field.id} form={form} nestIndex={index} removeVariant={() => removeVariant(index)} />
               ))}
               
               <div className="pt-4 border-t flex justify-end">
                 <div className="text-sm font-medium">Total Stock: {
                   watchVariants?.reduce((acc: number, v: any) => acc + (v.sizes?.reduce((sAcc: number, s: any) => sAcc + (s.stock || 0), 0) || 0), 0) || 0
                 }</div>
               </div>
             </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Search Engine Optimization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="seoTitle" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>SEO Title</FormLabel>
                      <span className="text-xs text-muted-foreground">{field.value?.length || 0}/60</span>
                    </div>
                    <FormControl><Input {...field} maxLength={60} /></FormControl>
                  </FormItem>
               )} />
               <FormField control={form.control} name="seoDescription" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>SEO Description</FormLabel>
                      <span className="text-xs text-muted-foreground">{field.value?.length || 0}/160</span>
                    </div>
                    <FormControl><Input {...field} maxLength={160} /></FormControl>
                  </FormItem>
               )} />
            </CardContent>
          </Card>

        </div>

        {/* Sidebar 1/3 */}
        <div className="w-full lg:w-80 space-y-6 sticky top-6 self-start">
           <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              
              <FormField control={form.control} name="isPublished" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Xuất Bản</FormLabel>
                    <FormDescription>Hiển thị sản phẩm cho khách hàng</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nổi Bật</FormLabel>
                    <FormDescription>Nổi bật trên trang chủ</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

            </CardContent>
           </Card>

           <Card>
             <CardContent className="p-4 space-y-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => {
                  form.setValue('isPublished', false);
                  form.handleSubmit(onSubmit as any)();
                }} disabled={isSubmitting}>
                  Lưu Nháp
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập Nhật Sản Phẩm' : 'Xuất Bản Sản Phẩm')}
                </Button>
                
                {isDraftSaving && <p className="text-xs text-center text-muted-foreground">Đang tự động lưu nháp...</p>}

                {initialData?._id && initialData?.isPublished && (
                   <Link href={`/products/${initialData.slug}`} target="_blank" className="block text-center text-sm font-medium text-blue-600 hover:underline">
                     Xem trên cửa hàng
                   </Link>
                )}
             </CardContent>
           </Card>
        </div>

      </form>
    </Form>
  );
}

// Sub-component for Variant array
function VariantBuilder({ form, nestIndex, removeVariant }: { form: any, nestIndex: number, removeVariant: () => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${nestIndex}.sizes`
  });

  return (
    <div className="border rounded-md p-4 space-y-4 bg-muted/30 relative group">
      <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeVariant}>
        <X className="h-3 w-3" />
      </Button>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name={`variants.${nestIndex}.color`} render={({ field }) => (
          <FormItem>
            <FormLabel>Tên Màu</FormLabel>
            <FormControl><Input {...field} placeholder="VD: Đen" /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name={`variants.${nestIndex}.colorHex`} render={({ field }) => (
          <FormItem>
            <FormLabel>Mã Màu</FormLabel>
            <div className="flex gap-2">
               <FormControl><Input type="color" className="w-12 h-10 p-1" {...field} /></FormControl>
               <FormControl><Input {...field} /></FormControl>
            </div>
          </FormItem>
        )} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Kích Thước & Tồn Kho</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ size: '', stock: 0 })}>
            <Plus className="h-4 w-4 mr-2" /> Thêm Kích Thước
          </Button>
        </div>
        
        {fields.map((item, sizeIndex) => (
          <div key={item.id} className="flex gap-4 items-center">
            <FormField control={form.control} name={`variants.${nestIndex}.sizes.${sizeIndex}.size`} render={({ field }) => (
              <FormItem className="flex-1">
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name={`variants.${nestIndex}.sizes.${sizeIndex}.stock`} render={({ field }) => (
              <FormItem className="w-32">
                 <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl>
              </FormItem>
            )} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(sizeIndex)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
