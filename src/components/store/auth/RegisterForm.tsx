'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithCredentials } from '@/app/actions/auth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50),
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return score;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass) || /[^a-zA-Z0-9]/.test(pass)) score += 1;
  return score;
};

const getStrengthColor = (score: number) => {
  if (score === 0) return 'bg-gray-200';
  if (score === 1) return 'bg-red-500';
  if (score === 2) return 'bg-yellow-500';
  if (score === 3) return 'bg-blue-500';
  if (score === 4) return 'bg-green-500';
  return 'bg-gray-200';
};

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const registerMutation = trpc.user.register.useMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');
  const strengthScore = getPasswordStrength(passwordValue);

  const onSubmit = (values: RegisterFormValues) => {
    setError(null);
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password
    }, {
      onSuccess: () => {
        startTransition(async () => {
          const authResult = await signInWithCredentials(values.email, values.password, '/');
          if (authResult?.error) {
            setError(authResult.error);
          }
        });
      },
      onError: (err) => {
        setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  };

  const isSubmitting = isPending || registerMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tạo Tài Khoản</h1>
        <p className="text-gray-500">Đăng ký để mở khóa các tính năng và ưu đãi độc quyền</p>
      </div>

      {error && (
        <div className="p-3 text-sm font-medium text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                      {...field} 
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                
                {/* Password Strength Meter */}
                <div className="pt-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          strengthScore >= level ? getStrengthColor(strengthScore) : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {strengthScore === 0 && 'Nhập mật khẩu'}
                    {strengthScore === 1 && 'Mật khẩu yếu'}
                    {strengthScore === 2 && 'Mật khẩu trung bình'}
                    {strengthScore === 3 && 'Mật khẩu tốt'}
                    {strengthScore === 4 && 'Mật khẩu mạnh'}
                  </p>
                </div>
                
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      {...field} 
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-black hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
