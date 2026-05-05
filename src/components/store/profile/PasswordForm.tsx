'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const localChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof localChangePasswordSchema>;

export default function PasswordForm() {
  const changePasswordMutation = trpc.user.changePassword.useMutation();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(localChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Đổi mật khẩu thành công!");
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Đổi mật khẩu thất bại. Bạn có thể đang đăng nhập bằng Google.");
      }
    });
  };

  const isSubmitting = changePasswordMutation.isPending;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-xl font-semibold mb-2">Đổi Mật Khẩu</h3>
        <p className="text-gray-500 text-sm mb-6">Đảm bảo tài khoản của bạn đang sử dụng một mật khẩu dài, ngẫu nhiên để giữ an toàn.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu hiện tại</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
