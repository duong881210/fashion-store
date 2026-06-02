"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Mã bảo mật không hợp lệ hoặc đã hết hạn");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi đổi mật khẩu mới");
      }

      toast.success("Mật khẩu mới đã đặt thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-slate-500">
          Nhập mật khẩu mới của bạn bên dưới để hoàn tất việc khôi phục quyền truy cập tài khoản.
        </p>
      </div>

      {!token ? (
        <div className="bg-red-50 text-red-600 rounded-2xl p-6 border border-red-100 text-center text-sm space-y-3">
          <p className="font-semibold">Mã xác minh bị thiếu</p>
          <p className="text-red-500">
            Liên kết này không chứa token xác thực hoặc mã này đã bị xóa khỏi URL. Vui lòng bấm vào liên kết chính xác trong email hoặc gửi lại yêu cầu.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" className="text-slate-900 border-slate-200">
              <Link href="/forgot-password">Yêu cầu mã mới</Link>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11"
                placeholder="••••••••"
              />
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11"
                placeholder="••••••••"
              />
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đặt lại mật khẩu mới
          </Button>
        </form>
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
  );
}
