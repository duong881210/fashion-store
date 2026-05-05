"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, MapPin, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import Image from "next/image";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export default function CheckoutClient({ profile }: { profile: any }) {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(profile?.addresses?.[0]?._id?.toString() || "new");
  
  const [newAddress, setNewAddress] = useState({
    fullName: profile?.name || "",
    phone: profile?.phone || "",
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState({ value: 0, code: "" });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      clearCart();
      if (data.paymentMethod === "cod") {
        router.push(`/orders/${data.orderId}/success`);
      } else {
        // Mock VNPay redirect for now
        toast.success("Chuyển hướng đến VNPay...");
        setTimeout(() => {
          router.push(`/orders/${data.orderId}/success`);
        }, 1500);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi tạo đơn hàng");
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <Button onClick={() => router.push('/products')}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  const subtotal = total();
  const shippingFee = 30000;
  const finalTotal = subtotal + shippingFee - discount.value;

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedAddressId === "new") {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.ward || !newAddress.district || !newAddress.province) {
          toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
          return;
        }
      }
      setStep(2);
    }
  };

  const handlePlaceOrder = () => {
    let shippingAddress = null;
    if (selectedAddressId === "new") {
      shippingAddress = newAddress;
    } else {
      const addr = profile.addresses.find((a: any) => a._id.toString() === selectedAddressId);
      if (addr) {
        shippingAddress = {
          fullName: profile.name, // assuming we use profile name
          phone: addr.phone,
          street: addr.street,
          ward: addr.ward,
          district: addr.district,
          province: addr.province
        };
      }
    }

    if (!shippingAddress) {
      toast.error("Không tìm thấy địa chỉ giao hàng");
      return;
    }

    createOrder.mutate({
      shippingAddress,
      paymentMethod,
      couponCode: discount.code || undefined
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
      {/* Left side - Steps */}
      <div className="w-full lg:w-3/5 space-y-8">
        {/* Progress Tracker */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <span className="text-sm font-medium">Giao hàng</span>
          </div>
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <span className="text-sm font-medium">Thanh toán</span>
          </div>
        </div>

        {/* Step 1: Address */}
        <div className={`bg-white border rounded-2xl p-6 ${step !== 1 && 'opacity-60 pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900">Thông tin giao hàng</h2>
          </div>
          
          <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
            {profile?.addresses?.map((addr: any) => (
              <div key={addr._id.toString()} className={`border rounded-xl p-4 flex items-start gap-4 transition-all ${selectedAddressId === addr._id.toString() ? 'border-slate-900 bg-slate-50/50' : 'border-slate-200'}`}>
                <RadioGroupItem value={addr._id.toString()} id={addr._id.toString()} className="mt-1" />
                <Label htmlFor={addr._id.toString()} className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900 mb-1">{profile.name} <span className="font-normal text-slate-500 ml-2">{addr.phone}</span></div>
                  <div className="text-slate-600 font-normal leading-relaxed">
                    {addr.street}<br/>
                    {addr.ward}, {addr.district}, {addr.province}
                  </div>
                </Label>
              </div>
            ))}
            
            <div className={`border rounded-xl p-4 flex gap-4 transition-all ${selectedAddressId === "new" ? 'border-slate-900 bg-slate-50/50' : 'border-slate-200'}`}>
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="new" className="font-semibold text-slate-900 cursor-pointer block mb-4">Giao đến địa chỉ khác</Label>
                {selectedAddressId === "new" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      <Input value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} placeholder="0901234567" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Địa chỉ (Số nhà, đường)</Label>
                      <Input value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} placeholder="123 Lê Lợi" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tỉnh / Thành phố</Label>
                      <Input value={newAddress.province} onChange={e => setNewAddress({...newAddress, province: e.target.value})} placeholder="Hồ Chí Minh" />
                    </div>
                    <div className="space-y-2">
                      <Label>Quận / Huyện</Label>
                      <Input value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} placeholder="Quận 1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phường / Xã</Label>
                      <Input value={newAddress.ward} onChange={e => setNewAddress({...newAddress, ward: e.target.value})} placeholder="Phường Bến Nghé" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>

          {step === 1 && (
            <Button onClick={handleNextStep} className="w-full mt-8 h-12 text-lg">Tiếp tục tới thanh toán</Button>
          )}
        </div>

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white border rounded-2xl p-6 border-slate-900 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">Phương thức thanh toán</h2>
            </div>
            
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-4">
              <div className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`} onClick={() => setPaymentMethod('cod')}>
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 flex items-center gap-3 cursor-pointer text-base">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm font-normal text-slate-500">Thanh toán bằng tiền mặt khi giao hàng</div>
                  </div>
                </Label>
              </div>

              <div className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`} onClick={() => setPaymentMethod('vnpay')}>
                <RadioGroupItem value="vnpay" id="vnpay" />
                <Label htmlFor="vnpay" className="flex-1 flex items-center gap-3 cursor-pointer text-base">
                  <div className="w-10 h-10 rounded-full bg-[#005BAA]/10 flex items-center justify-center">
                    {/* Placeholder VNPay icon */}
                    <div className="font-bold text-[#005BAA] text-xs">VNPAY</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Thanh toán qua VNPay</div>
                    <div className="text-sm font-normal text-slate-500">Thẻ ATM / Thẻ tín dụng / Ví điện tử</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-8 flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6">Quay lại</Button>
              <Button 
                onClick={handlePlaceOrder} 
                className="flex-1 h-12 text-lg bg-slate-900 hover:bg-slate-800"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                Đặt hàng
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Order Summary */}
      <div className="w-full lg:w-2/5">
        <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 sticky top-24 border border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Tóm tắt đơn hàng ({items.length} sản phẩm)</h2>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={`${item.product}-${item.color}-${item.size}`} className="flex gap-4">
                <div className="relative w-16 h-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                  <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center z-10">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-slate-900 line-clamp-2">{item.name}</p>
                  <p className="text-slate-500 mt-1">{item.color} / {item.size}</p>
                  <p className="font-medium text-slate-900 mt-1">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-6 text-sm border-t border-slate-200 pt-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount.value > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({discount.code})</span>
                <span>-{formatCurrency(discount.value)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Phí giao hàng</span>
              <span className="font-medium text-slate-900">{formatCurrency(shippingFee)}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 py-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-slate-900">Tổng thanh toán</span>
              <span className="font-bold text-2xl text-slate-900">{formatCurrency(finalTotal)}</span>
            </div>
            <p className="text-xs text-slate-500 text-right mt-1">Đã bao gồm VAT (nếu có)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
