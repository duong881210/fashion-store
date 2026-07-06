"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/login?callbackUrl=" + window.location.pathname);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, router, onClose]);

  const handleLoginNow = () => {
    router.push("/login?callbackUrl=" + window.location.pathname);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 border-slate-100 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center pt-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 relative animate-pulse">
            <div className="absolute inset-0 bg-red-100/50 rounded-full scale-125 -z-10 animate-ping" />
            <LockKeyhole className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Yêu cầu đăng nhập
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-2 text-sm leading-relaxed max-w-[280px]">
            Bạn cần đăng nhập tài khoản để thực hiện chức năng thêm sản phẩm vào giỏ hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
          {countdown > 0 ? (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              <span>Chuyển hướng đến trang đăng nhập sau {countdown} giây...</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Đang chuyển hướng...</span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleLoginNow} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 font-semibold">
            Đăng nhập ngay
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full text-slate-500 hover:text-slate-700 font-medium">
            Hủy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
