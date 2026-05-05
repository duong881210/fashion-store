'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const localUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50),
  phone: z.string().optional(),
  avatar: z.string().url('Phải là một URL hợp lệ').optional().or(z.literal(''))
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn ảnh đại diện</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.jpg" {...field} disabled={isSubmitting} />
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
