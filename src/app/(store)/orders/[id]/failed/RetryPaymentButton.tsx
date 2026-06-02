"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RetryPaymentButtonProps {
  orderId: string;
}

export default function RetryPaymentButton({ orderId }: RetryPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    toast.info("Đang kết nối đến cổng thanh toán VNPay...");
    try {
      const res = await fetch("/api/vnpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi kết nối cổng thanh toán");
      }

      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error.message || "Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleRetry} 
      disabled={loading}
      className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium min-w-[200px]"
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <RefreshCcw className="mr-2 h-5 w-5" />
      )}
      Thử lại thanh toán
    </Button>
  );
}
