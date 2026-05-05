'use client';

import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CldUploadWidget } from 'next-cloudinary';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, Image as ImageIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface SettingsClientProps {
  initialSettings: any;
  initialCoupons: any[];
}

export function SettingsClient({ initialSettings, initialCoupons }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('store');
  const [formData, setFormData] = useState(initialSettings);
  const [isDirty, setIsDirty] = useState(false);

  // Coupon states
  const [coupons, setCoupons] = useState(initialCoupons);
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 100, expiresAt: ''
  });

  // Check if form is dirty
  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialSettings));
  }, [formData, initialSettings]);

  const updateMutation = trpc.settings.updateSettings.useMutation({
    onSuccess: (data) => {
      toast.success('Cập nhật cài đặt thành công');
      setIsDirty(false);
      // In a real app we'd update initialSettings context or refresh
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi cập nhật cài đặt');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleStoreChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      storeInfo: { ...prev.storeInfo, [field]: value }
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      storeInfo: {
        ...prev.storeInfo,
        socials: { ...prev.storeInfo.socials, [field]: value }
      }
    }));
  };

  const handleShippingChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value }
    }));
  };

  const handleProvinceFeeChange = (code: string, fee: number) => {
    setFormData((prev: any) => {
      const newProvinces = prev.shipping.provinces.map((p: any) =>
        p.code === code ? { ...p, fee } : p
      );
      return {
        ...prev,
        shipping: { ...prev.shipping, provinces: newProvinces }
      };
    });
  };

  const handleEmailChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      emailTemplates: { ...prev.emailTemplates, [field]: value }
    }));
  };

  const handlePaymentChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  // Coupon Mutations
  const utils = trpc.useUtils();
  const createCoupon = trpc.coupon.create.useMutation({
    onSuccess: () => {
      toast.success('Thêm mã giảm giá thành công');
      utils.coupon.getAll.invalidate();
      setNewCoupon({ code: '', type: 'percentage', value: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 100, expiresAt: '' });
    },
    onError: (err) => toast.error(err.message)
  });

  const toggleCoupon = trpc.coupon.toggle.useMutation({
    onSuccess: () => utils.coupon.getAll.invalidate()
  });

  const deleteCoupon = trpc.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success('Đã xóa mã giảm giá');
      utils.coupon.getAll.invalidate();
    }
  });

  // Auto-refresh coupons if we can
  const { data: latestCoupons } = trpc.coupon.getAll.useQuery(undefined, {
    initialData: initialCoupons,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const displayCoupons = latestCoupons || coupons;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-auto p-1 bg-muted/50 w-full lg:w-3/4 mb-6">
            <TabsTrigger value="store" className="py-2.5">
              Cửa Hàng {isDirty && <span className="text-primary ml-1">*</span>}
            </TabsTrigger>
            <TabsTrigger value="shipping" className="py-2.5">
              Vận Chuyển {isDirty && <span className="text-primary ml-1">*</span>}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="py-2.5">Khuyến Mãi</TabsTrigger>
            <TabsTrigger value="emails" className="py-2.5">
              Email {isDirty && <span className="text-primary ml-1">*</span>}
            </TabsTrigger>
            <TabsTrigger value="payment" className="py-2.5">
              Thanh Toán {isDirty && <span className="text-primary ml-1">*</span>}
            </TabsTrigger>
          </TabsList>

          {/* STORE INFO TAB */}
          <TabsContent value="store" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Chung</CardTitle>
                <CardDescription>Các thông tin cơ bản về cửa hàng của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tên cửa hàng</Label>
                      <Input value={formData.storeInfo.name} onChange={(e) => handleStoreChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả ngắn</Label>
                      <Textarea value={formData.storeInfo.description || ''} onChange={(e: any) => handleStoreChange('description', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input value={formData.storeInfo.phone || ''} onChange={(e) => handleStoreChange('phone', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email liên hệ</Label>
                        <Input type="email" value={formData.storeInfo.email || ''} onChange={(e) => handleStoreChange('email', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Logo cửa hàng</Label>
                    <div className="flex items-center gap-6">
                      <div className="h-32 w-32 relative border rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                        {formData.storeInfo.logo ? (
                          <Image src={formData.storeInfo.logo} alt="Logo" fill className="object-contain p-2" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={(result: any) => handleStoreChange('logo', result.info.secure_url)}
                      >
                        {({ open }) => (
                          <Button type="button" variant="outline" onClick={() => open()}>
                            Tải ảnh lên
                          </Button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Mạng Xã Hội</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input placeholder="https://facebook.com/..." value={formData.storeInfo.socials?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input placeholder="https://instagram.com/..." value={formData.storeInfo.socials?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>TikTok</Label>
                      <Input placeholder="https://tiktok.com/@..." value={formData.storeInfo.socials?.tiktok || ''} onChange={(e) => handleSocialChange('tiktok', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Shopee</Label>
                      <Input placeholder="https://shopee.vn/..." value={formData.storeInfo.socials?.shopee || ''} onChange={(e) => handleSocialChange('shopee', e.target.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SHIPPING TAB */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cấu Hình Giao Hàng</CardTitle>
                <CardDescription>Thiết lập phí vận chuyển theo từng khu vực.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Loại phí vận chuyển</Label>
                  <RadioGroup
                    value={formData.shipping.type}
                    onValueChange={(val) => handleShippingChange('type', val)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card">
                      <RadioGroupItem value="flat" id="flat" />
                      <Label htmlFor="flat" className="flex-1 cursor-pointer">Đồng giá toàn quốc</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card">
                      <RadioGroupItem value="province" id="province" />
                      <Label htmlFor="province" className="flex-1 cursor-pointer">Tính theo Tỉnh / Thành phố</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Phí đồng giá (VND)</Label>
                    <Input
                      type="number"
                      value={formData.shipping.flatRate}
                      onChange={(e) => handleShippingChange('flatRate', Number(e.target.value))}
                      disabled={formData.shipping.type !== 'flat'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Miễn phí vận chuyển cho đơn từ (VND)</Label>
                    <Input
                      type="number"
                      value={formData.shipping.freeShippingThreshold}
                      onChange={(e) => handleShippingChange('freeShippingThreshold', Number(e.target.value))}
                    />
                  </div>
                </div>

                {formData.shipping.type === 'province' && (
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="font-medium">Phí theo Tỉnh / Thành phố (63 Tỉnh thành)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[400px] overflow-y-auto p-4 border rounded-lg bg-muted/20">
                      {formData.shipping.provinces.map((prov: any) => (
                        <div key={prov.code} className="flex items-center justify-between gap-4 bg-background p-2 rounded border">
                          <span className="text-sm font-medium w-1/2 truncate" title={prov.name}>{prov.name}</span>
                          <Input
                            type="number"
                            className="h-8 w-28 text-right"
                            value={prov.fee}
                            onChange={(e) => handleProvinceFeeChange(prov.code, Number(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* COUPONS TAB */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Tạo Mã Giảm Giá</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mã giảm giá (Code)</Label>
                    <Input
                      placeholder="VD: SUMMER2024"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại giảm giá</Label>
                    <Select value={newCoupon.type} onValueChange={(val: any) => setNewCoupon({ ...newCoupon, type: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                        <SelectItem value="fixed">Số tiền cố định (VND)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Giá trị ({newCoupon.type === 'percentage' ? '%' : 'VND'})</Label>
                    <Input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} />
                  </div>
                  {newCoupon.type === 'percentage' && (
                    <div className="space-y-2">
                      <Label>Giảm tối đa (VND) - Tùy chọn</Label>
                      <Input type="number" value={newCoupon.maxDiscount} onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Đơn tối thiểu (VND)</Label>
                    <Input type="number" value={newCoupon.minOrderValue} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lượt sử dụng</Label>
                      <Input type="number" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ngày hết hạn</Label>
                      <Input type="date" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-2"
                    disabled={!newCoupon.code || !newCoupon.value || !newCoupon.expiresAt || createCoupon.isPending}
                    onClick={() => createCoupon.mutate(newCoupon as any)}
                  >
                    {createCoupon.isPending ? "Đang tạo..." : <><Plus className="w-4 h-4 mr-2" /> Tạo mã</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Danh Sách Mã Giảm Giá</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
                        <tr>
                          <th className="py-3 px-4 font-medium">Mã</th>
                          <th className="py-3 px-4 font-medium">Giảm</th>
                          <th className="py-3 px-4 font-medium text-center">Đã Dùng</th>
                          <th className="py-3 px-4 font-medium">Hết Hạn</th>
                          <th className="py-3 px-4 font-medium text-center">TTrạng</th>
                          <th className="py-3 px-4 font-medium text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {displayCoupons.map((c: any) => (
                          <tr key={c._id} className="hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono font-bold text-primary">{c.code}</td>
                            <td className="py-3 px-4">
                              {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                            </td>
                            <td className="py-3 px-4 text-center">{c.usedCount} / {c.usageLimit}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{format(new Date(c.expiresAt), 'dd/MM/yyyy')}</td>
                            <td className="py-3 px-4 text-center">
                              <Switch
                                checked={c.isActive}
                                onCheckedChange={() => toggleCoupon.mutate({ id: c._id })}
                                disabled={toggleCoupon.isPending}
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => {
                                if (confirm('Xóa mã này?')) deleteCoupon.mutate({ id: c._id });
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {displayCoupons.length === 0 && (
                          <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Chưa có mã giảm giá nào</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EMAILS TAB */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mẫu Email Tự Động</CardTitle>
                <CardDescription>Cấu hình nội dung email gửi đến khách hàng. Sử dụng biến <code>{`{{customerName}}`}</code>, <code>{`{{orderCode}}`}</code>.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-base">Xác Nhận Đơn Hàng</Label>
                  <Textarea className="h-32 font-mono text-sm" value={formData.emailTemplates.orderConfirmed} onChange={(e: any) => handleEmailChange('orderConfirmed', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Đơn Đang Giao</Label>
                  <Textarea className="h-32 font-mono text-sm" value={formData.emailTemplates.orderShipped} onChange={(e: any) => handleEmailChange('orderShipped', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Giao Thành Công</Label>
                  <Textarea className="h-32 font-mono text-sm" value={formData.emailTemplates.orderDelivered} onChange={(e: any) => handleEmailChange('orderDelivered', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Quên Mật Khẩu</Label>
                  <Textarea className="h-32 font-mono text-sm" value={formData.emailTemplates.passwordReset} onChange={(e: any) => handleEmailChange('passwordReset', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENT TAB */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cổng Thanh Toán VNPay</CardTitle>
                <CardDescription>Cấu hình môi trường thanh toán cho website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base">Môi Trường Test (Sandbox)</Label>
                    <p className="text-sm text-muted-foreground">Bật để sử dụng môi trường thử nghiệm. Tắt để chạy thật (Production).</p>
                  </div>
                  <Switch
                    checked={formData.payment.isSandbox}
                    onCheckedChange={(val: boolean) => handlePaymentChange('isSandbox', val)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>VNPay TmnCode</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      value={formData.payment.vnpayTmnCode || '****************'}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                    <Button variant="outline" onClick={() => toast.info('Vui lòng cấu hình qua biến môi trường (.env)')}>Sửa</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Khóa cấu hình VNPay được thiết lập trong tệp `.env` vì lý do bảo mật.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Floating Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-card border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex justify-between items-center animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="destructive" className="animate-pulse">Chưa lưu</Badge>
            <span className="text-muted-foreground hidden sm:inline">Bạn có thay đổi chưa được lưu.</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setFormData(initialSettings); setIsDirty(false); }}>Hủy bỏ</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
