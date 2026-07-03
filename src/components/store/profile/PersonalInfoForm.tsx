'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';

const localUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50),
  phone: z.string().optional(),
  avatar: z.string().optional()
});

type ProfileFormValues = z.infer<typeof localUpdateProfileSchema>;

export default function PersonalInfoForm({ profile }: { profile: any }) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.user.updateProfile.useMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(localUpdateProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
    },
  });

  const avatarUrl = form.watch('avatar');

  // Keep form fields synced when parent profile data changes (after invalidation/refetch)
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Cập nhật hồ sơ thành công!");
        utils.user.getProfile.invalidate();
      },
      onError: (err) => {
        toast.error(err.message || "Cập nhật hồ sơ thất bại");
      }
    });
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-xl font-semibold mb-2">Thông Tin Cá Nhân</h3>
        <p className="text-gray-500 text-sm mb-6">Cập nhật thông tin cá nhân của bạn tại đây.</p>
      </div>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Form validation failed:", errors);
            toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
          })} 
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start gap-3">
                <FormLabel>Ảnh đại diện</FormLabel>
                <div className="flex flex-row items-center gap-6 w-full">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'products'}
                      onSuccess={(result: any) => {
                        const url = result.info.secure_url;
                        form.setValue('avatar', url, { shouldDirty: true, shouldTouch: true });
                        toast.success("Tải ảnh đại diện thành công!");
                      }}
                      options={{
                        maxFiles: 1,
                        resourceType: 'image',
                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                      }}
                    >
                      {({ open }) => (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 cursor-pointer border-slate-300 hover:bg-slate-50 rounded-xl"
                          onClick={() => open()}
                          disabled={isSubmitting}
                        >
                          <Camera className="w-4 h-4" />
                          Chọn ảnh từ thiết bị
                        </Button>
                      )}
                    </CldUploadWidget>
                    <p className="text-xs text-slate-400">
                      Hỗ trợ JPG, PNG, WEBP, GIF.
                    </p>
                  </div>
                </div>
                <FormControl>
                  <input type="hidden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Tên của bạn" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Số điện thoại của bạn" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
