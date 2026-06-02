"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Storefront Error Boundary]", error);
  }, [error]);

  return (
    <div className="w-full min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 bg-white text-center">
      <div className="max-w-md w-full">
        {/* Error icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        {/* Messages */}
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đã xảy ra lỗi
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
          Hệ thống gặp sự cố không mong muốn trong khi tải trang. Vui lòng bấm thử lại hoặc quay lại trang chủ.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 py-5 flex items-center justify-center gap-2 border-0"
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="w-full sm:w-auto rounded-full px-6 py-5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
