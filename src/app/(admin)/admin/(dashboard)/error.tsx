"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Dashboard Error Boundary]", error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
      <div className="max-w-md w-full">
        {/* Alert icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-5">
          <AlertTriangle className="w-7 h-7" />
        </div>
        
        {/* Messages */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Lỗi tải trang quản trị
        </h2>
        <p className="text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto text-sm">
          Đã có lỗi xảy ra khi xử lý dữ liệu quản trị viên. Vui lòng bấm thử lại hoặc quay lại Dashboard chính.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-5 py-4 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="w-full sm:w-auto rounded-lg px-5 py-4 border-slate-200 text-slate-700 hover:bg-slate-50 bg-white"
          >
            <Link href="/admin">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Bảng điều khiển
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
