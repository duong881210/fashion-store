"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useCartStore } from "@/stores/useCartStore";
import { Ticket, Gift, Sparkles, AlertCircle, Check, Loader2, Info, Percent } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CouponSelectorProps {
  orderValue: number;
  isLoggedIn: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export default function CouponSelector({ orderValue, isLoggedIn }: CouponSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [validateError, setValidateError] = useState("");

  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);
  const clearAppliedCoupon = useCartStore((state) => state.clearAppliedCoupon);

  interface AvailableCoupon {
    _id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
    maxDiscount?: number;
    expiresAt: Date | string;
    description: string;
  }

  // Fetch available coupons
  const { data: couponsData, isLoading, refetch } = trpc.coupon.listAvailable.useQuery(undefined, {
    enabled: isOpen, // only load when modal opens
  });
  const coupons = couponsData as AvailableCoupon[] | undefined;

  // Validate coupon mutation
  const validateCoupon = trpc.coupon.validate.useMutation({
    onSuccess: (data) => {
      if (data.isValid) {
        // Find coupon details from our query data to store it, or reconstruct it
        const couponDetail = coupons?.find((c) => c.code === manualCode.toUpperCase()) || {
          code: manualCode.toUpperCase(),
          type: data.discount > 0 ? ("fixed" as const) : ("percentage" as const), // rough fallback
          value: data.discount,
          minOrderValue: 0,
        };

        // If we selected a coupon from the list, it's easier
        const selectedCoupon = coupons?.find((c) => c.code === manualCode.toUpperCase());
        
        if (selectedCoupon) {
          setAppliedCoupon({
            code: selectedCoupon.code,
            type: selectedCoupon.type as "percentage" | "fixed",
            value: selectedCoupon.value,
            minOrderValue: selectedCoupon.minOrderValue,
            maxDiscount: selectedCoupon.maxDiscount,
          });
        } else {
          // If manually typed, set it based on server response (approx details)
          setAppliedCoupon({
            code: manualCode.toUpperCase(),
            type: data.discount === 30000 && manualCode.toUpperCase() === "FREESHIP" ? "fixed" : "percentage", // fallback estimation
            value: data.discount,
            minOrderValue: 0,
          });
        }

        toast.success(data.message || "Áp dụng mã giảm giá thành công!");
        setManualCode("");
        setValidateError("");
        setIsOpen(false);
      } else {
        setValidateError(data.message || "Mã giảm giá không hợp lệ");
        toast.error(data.message || "Mã giảm giá không hợp lệ");
      }
    },
    onError: (err) => {
      setValidateError(err.message || "Đã xảy ra lỗi khi kiểm tra mã");
      toast.error(err.message || "Lỗi áp dụng mã giảm giá");
    },
  });

  const handleApplyCoupon = (code: string) => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá");
      return;
    }
    setManualCode(code);
    validateCoupon.mutate({ code, orderValue });
  };

  const handleManualApply = () => {
    if (!manualCode.trim()) return;
    handleApplyCoupon(manualCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAppliedCoupon();
    toast.info("Đã hủy áp dụng mã giảm giá");
  };

  return (
    <div className="w-full">
      {/* Trigger Button or Active Coupon display */}
      {!appliedCoupon ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl transition-all duration-200 text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Mã giảm giá</div>
                  <div className="text-xs text-slate-500">Chọn hoặc nhập mã giảm giá của bạn</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                Chọn mã
              </span>
            </button>
          </SheetTrigger>

          <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-slate-50 p-0">
            <div className="p-6 bg-white border-b border-slate-100">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                  Mã giảm giá khả dụng
                </SheetTitle>
                <SheetDescription className="text-slate-500">
                  Chọn mã từ danh sách bên dưới hoặc tự nhập mã.
                </SheetDescription>
              </SheetHeader>

              {/* Manual code input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Nhập mã giảm giá..."
                    value={manualCode}
                    onChange={(e) => {
                      setManualCode(e.target.value.toUpperCase());
                      setValidateError("");
                    }}
                    className={`bg-white uppercase tracking-wider font-semibold border-slate-200 focus:border-slate-900 ${
                      validateError ? "border-red-500" : ""
                    }`}
                    onKeyDown={(e) => e.key === "Enter" && handleManualApply()}
                  />
                  {validateError && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 absolute -bottom-4 left-0">
                      {validateError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleManualApply}
                  disabled={validateCoupon.isPending || !manualCode.trim()}
                  className="bg-slate-950 hover:bg-slate-800 text-white min-w-[80px]"
                >
                  {validateCoupon.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Áp dụng"
                  )}
                </Button>
              </div>
            </div>

            {/* List scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-sm">Đang tải mã giảm giá...</p>
                </div>
              ) : !coupons || coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <AlertCircle className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium">Hiện không có mã giảm giá nào khả dụng</p>
                </div>
              ) : (
                coupons.map((coupon) => {
                  const isEligible = orderValue >= coupon.minOrderValue;
                  const discountValueFormatted =
                    coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value);
                  const progressPercentage = Math.min(
                    (orderValue / coupon.minOrderValue) * 100,
                    100
                  );
                  const amountNeeded = coupon.minOrderValue - orderValue;
                  const isCurrentlyApplied = false;

                  return (
                    <div
                      key={coupon._id}
                      className={`relative flex rounded-xl border overflow-hidden transition-all duration-300 bg-white ${
                        isCurrentlyApplied
                          ? "border-emerald-500 shadow-emerald-50 shadow-md"
                          : !isEligible
                          ? "opacity-75 border-slate-100"
                          : "border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      {/* Ticket Cutout Circles */}
                      <div className="absolute top-1/2 left-[28%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10 hidden sm:block"></div>
                      <div className="absolute -top-2 left-[28%] -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10"></div>
                      <div className="absolute -bottom-2 left-[28%] -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10"></div>

                      {/* Ticket Left Part - Visual Badge */}
                      <div
                        className={`w-[28%] flex flex-col items-center justify-center text-white px-2 py-4 relative select-none ${
                          isCurrentlyApplied
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                            : !isEligible
                            ? "bg-slate-300"
                            : coupon.type === "percentage"
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                            : "bg-gradient-to-br from-amber-500 to-orange-500"
                        }`}
                      >
                        {coupon.type === "percentage" ? (
                          <Percent className="h-6 w-6 mb-1 opacity-90" />
                        ) : (
                          <Gift className="h-6 w-6 mb-1 opacity-90" />
                        )}
                        <span className="text-xs font-bold text-center leading-tight">
                          {coupon.type === "percentage" ? "SALE" : "VOUCHER"}
                        </span>
                        <span className="text-sm font-extrabold tracking-wide mt-0.5">
                          {discountValueFormatted}
                        </span>
                      </div>

                      {/* Ticket Right Part - Info & Actions */}
                      <div className="flex-1 flex flex-col justify-between p-4 border-l border-dashed border-slate-200 pl-6">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded tracking-wider">
                              {coupon.code}
                            </span>
                            {isCurrentlyApplied && (
                              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                Đã áp dụng
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {coupon.description}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Hạn dùng: {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>

                        {/* Minimum Spend Details & Progress Bar */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          {coupon.minOrderValue > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                              <span>Đơn tối thiểu: {formatCurrency(coupon.minOrderValue)}</span>
                              {!isEligible && (
                                <span className="text-amber-600">
                                  Thiếu {formatCurrency(amountNeeded)}
                                </span>
                              )}
                            </div>
                          )}

                          {coupon.minOrderValue > 0 && !isEligible && (
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex justify-end mt-2">
                            {isCurrentlyApplied ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRemoveCoupon}
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50/50 hover:text-red-700"
                              >
                                Hủy áp dụng
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={
                                  !isEligible ||
                                  (validateCoupon.isPending && manualCode === coupon.code)
                                }
                                onClick={() => handleApplyCoupon(coupon.code)}
                                className={`h-8 px-4 font-semibold text-xs transition-all ${
                                  !isEligible
                                    ? "bg-slate-100 hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                                }`}
                              >
                                {validateCoupon.isPending && manualCode === coupon.code ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : !isEligible ? (
                                  "Chưa đủ ĐK"
                                ) : (
                                  "Áp dụng"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* Display Active Applied Coupon Card */
        <div className="w-full flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-500/50 rounded-xl shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center relative shadow-sm">
              <Check className="h-5 w-5 stroke-[3]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                Đã áp dụng
                <span className="inline-block px-1 bg-emerald-500 text-white rounded font-mono font-extrabold text-[8px]">
                  {appliedCoupon.code}
                </span>
              </div>
              <div className="text-sm font-extrabold text-emerald-900 mt-0.5">
                {appliedCoupon.type === "percentage"
                  ? `Giảm ${appliedCoupon.value}%${
                      appliedCoupon.maxDiscount
                        ? ` (tối đa ${formatCurrency(appliedCoupon.maxDiscount)})`
                        : ""
                    }`
                  : `Giảm ${formatCurrency(appliedCoupon.value)}`}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 transition-colors">
                  Thay đổi
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-slate-50 p-0">
                <div className="p-6 bg-white border-b border-slate-100">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                      Mã giảm giá khả dụng
                    </SheetTitle>
                    <SheetDescription className="text-slate-500">
                      Chọn mã từ danh sách bên dưới hoặc tự nhập mã.
                    </SheetDescription>
                  </SheetHeader>

                  {/* Manual code input inside modal */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Nhập mã giảm giá..."
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value.toUpperCase());
                          setValidateError("");
                        }}
                        className={`bg-white uppercase tracking-wider font-semibold border-slate-200 focus:border-slate-900 ${
                          validateError ? "border-red-500" : ""
                        }`}
                        onKeyDown={(e) => e.key === "Enter" && handleManualApply()}
                      />
                      {validateError && (
                        <p className="text-[10px] text-red-500 font-medium mt-1 absolute -bottom-4 left-0">
                          {validateError}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleManualApply}
                      disabled={validateCoupon.isPending || !manualCode.trim()}
                      className="bg-slate-950 hover:bg-slate-800 text-white min-w-[80px]"
                    >
                      {validateCoupon.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <p className="text-sm">Đang tải mã giảm giá...</p>
                    </div>
                  ) : !coupons || coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                      <AlertCircle className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">Hiện không có mã giảm giá nào khả dụng</p>
                    </div>
                  ) : (
                    coupons.map((coupon) => {
                      const isEligible = orderValue >= coupon.minOrderValue;
                      const discountValueFormatted =
                        coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : formatCurrency(coupon.value);
                      const progressPercentage = Math.min(
                        (orderValue / coupon.minOrderValue) * 100,
                        100
                      );
                      const amountNeeded = coupon.minOrderValue - orderValue;
                      const isCurrentlyApplied = appliedCoupon?.code === coupon.code;

                      return (
                        <div
                          key={coupon._id}
                          className={`relative flex rounded-xl border overflow-hidden transition-all duration-300 bg-white ${
                            isCurrentlyApplied
                              ? "border-emerald-500 shadow-emerald-50 shadow-md"
                              : !isEligible
                              ? "opacity-75 border-slate-100"
                              : "border-slate-200 hover:border-slate-300 shadow-sm"
                          }`}
                        >
                          {/* Ticket Cutout Circles */}
                          <div className="absolute top-1/2 left-[28%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10 hidden sm:block"></div>
                          <div className="absolute -top-2 left-[28%] -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10"></div>
                          <div className="absolute -bottom-2 left-[28%] -translate-x-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full z-10"></div>

                          {/* Ticket Left Part */}
                          <div
                            className={`w-[28%] flex flex-col items-center justify-center text-white px-2 py-4 relative select-none ${
                              isCurrentlyApplied
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                : !isEligible
                                ? "bg-slate-300"
                                : coupon.type === "percentage"
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                                : "bg-gradient-to-br from-amber-500 to-orange-500"
                            }`}
                          >
                            {coupon.type === "percentage" ? (
                              <Percent className="h-6 w-6 mb-1 opacity-90" />
                            ) : (
                              <Gift className="h-6 w-6 mb-1 opacity-90" />
                            )}
                            <span className="text-xs font-bold text-center leading-tight">
                              {coupon.type === "percentage" ? "SALE" : "VOUCHER"}
                            </span>
                            <span className="text-sm font-extrabold tracking-wide mt-0.5">
                              {discountValueFormatted}
                            </span>
                          </div>

                          {/* Ticket Right Part */}
                          <div className="flex-1 flex flex-col justify-between p-4 border-l border-dashed border-slate-200 pl-6">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded tracking-wider">
                                  {coupon.code}
                                </span>
                                {isCurrentlyApplied && (
                                  <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    Đã áp dụng
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {coupon.description}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Hạn dùng:{" "}
                                {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>

                            {/* Minimum Spend Details */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100">
                              {coupon.minOrderValue > 0 && (
                                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                                  <span>
                                    Đơn tối thiểu: {formatCurrency(coupon.minOrderValue)}
                                  </span>
                                  {!isEligible && (
                                    <span className="text-amber-600">
                                      Thiếu {formatCurrency(amountNeeded)}
                                    </span>
                                  )}
                                </div>
                              )}

                              {coupon.minOrderValue > 0 && !isEligible && (
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                                  <div
                                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              )}

                              <div className="flex justify-end mt-2">
                                {isCurrentlyApplied ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRemoveCoupon}
                                    className="h-8 border-red-200 text-red-600 hover:bg-red-50/50 hover:text-red-700"
                                  >
                                    Hủy áp dụng
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={
                                      !isEligible ||
                                      (validateCoupon.isPending && manualCode === coupon.code)
                                    }
                                    onClick={() => handleApplyCoupon(coupon.code)}
                                    className={`h-8 px-4 font-semibold text-xs transition-all ${
                                      !isEligible
                                        ? "bg-slate-100 hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-900 hover:bg-slate-800 text-white"
                                    }`}
                                  >
                                    {validateCoupon.isPending && manualCode === coupon.code ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : !isEligible ? (
                                      "Chưa đủ ĐK"
                                    ) : (
                                      "Áp dụng"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={handleRemoveCoupon}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Gỡ bỏ mã"
            >
              <span className="text-xs font-semibold text-red-600 block sm:inline">Gỡ mã</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
