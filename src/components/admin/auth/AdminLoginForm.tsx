'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsPending(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      
      if (result?.error) {
        setError('Email hoặc mật khẩu không hợp lệ, hoặc bạn không có quyền Admin');
        setIsPending(false);
      } else {
        // Force full refresh to clear Next.js layout cache and update SessionProvider
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('Đã xảy ra lỗi không mong muốn');
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="space-y-2 text-center flex flex-col items-center">
        <div className="h-12 w-12 bg-slate-900 rounded-full flex items-center justify-center mb-2 shadow-sm">
           <ShieldAlert className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
        <p className="text-sm text-slate-500">Đăng nhập vào hệ thống quản trị</p>
      </div>

      {error && (
        <div className="p-3 text-sm font-medium text-red-800 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Email quản trị</FormLabel>
                <FormControl>
                  <Input placeholder="admin@store.com" type="email" {...field} disabled={isPending} className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400" />
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-slate-700">Mật khẩu</FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                      {...field} 
                      disabled={isPending}
                      className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-colors" disabled={isPending}>
            {isPending ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </Button>
        </form>
      </Form>
      
      <div className="pt-4 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 hover:underline transition-colors">
          &larr; Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
}
