'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error') === 'OAuthAccountNotLinked' 
    ? 'Email đã được sử dụng với nhà cung cấp khác' 
    : searchParams.get('error');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(urlError);
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
        setError('Email hoặc mật khẩu không hợp lệ');
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

  const onGoogleSignIn = () => {
    setIsPending(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chào mừng trở lại</h1>
        <p className="text-gray-500">Nhập thông tin đăng nhập để truy cập tài khoản của bạn một cách an toàn</p>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} disabled={isPending} />
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
                  <FormLabel>Mật khẩu</FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                      {...field} 
                      disabled={isPending}
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        type="button" 
        className="w-full" 
        onClick={onGoogleSignIn}
        disabled={isPending}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>

      <p className="text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-black hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
