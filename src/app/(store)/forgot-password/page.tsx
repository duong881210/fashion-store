"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Đã xảy ra lỗi khi gửi yêu cầu");
      }

      toast.success("Yêu cầu đặt lại mật khẩu đã được xử lý");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi yêu cầu đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Fashion Image */}
      <div className="hidden w-1/2 lg:block relative">
        <Image
          src="/images/auth/login-bg.jpg"
          alt="Fashion Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nâng Tầm Phong Cách Của Bạn
          </h2>
          <p className="text-lg text-white/90">
            Cổng thông tin bảo mật và quản lý tài khoản thành viên Fashion Store.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Quên mật khẩu?
            </h1>
            <p className="text-sm text-slate-500">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu bảo mật.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi liên kết đặt lại mật khẩu
              </Button>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900">Kiểm tra hộp thư của bạn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong className="text-slate-900">{email}</strong> nếu email tồn tại trong hệ thống. Vui lòng kiểm tra cả thư mục Spam/Quảng cáo nếu không thấy.
              </p>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
