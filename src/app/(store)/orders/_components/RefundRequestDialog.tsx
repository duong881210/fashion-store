'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'sonner';
import { Image as ImageIcon, Trash2, Loader2, Camera } from 'lucide-react';
import Image from 'next/image';

interface RefundRequestDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS = [
  'Sản phẩm lỗi hoặc hỏng hóc khi nhận hàng',
  'Giao sai sản phẩm (sai kích thước, màu sắc hoặc mẫu mã)',
  'Sản phẩm khác biệt đáng kể so với hình ảnh/mô tả',
  'Kích thước không vừa (muốn đổi size/trả hàng)',
  'Khác (vui lòng nêu rõ lý do bên dưới)',
];

export function RefundRequestDialog({ order, isOpen, onClose, onSuccess }: RefundRequestDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  const requestRefundMutation = trpc.order.requestRefund.useMutation({
    onSuccess: () => {
      toast.success('Gửi yêu cầu hoàn tiền thành công!');
      onSuccess();
      onClose();
      // Reset states
      setReason('');
      setDescription('');
      setImages([]);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi gửi yêu cầu hoàn tiền');
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Vui lòng chọn lý do trả hàng/hoàn tiền');
      return;
    }
    requestRefundMutation.mutate({
      orderId: order._id,
      reason,
      description,
      images,
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Yêu cầu trả hàng & hoàn tiền</DialogTitle>
          <DialogDescription className="text-slate-500">
            Vui lòng điền đầy đủ thông tin bên dưới để gửi yêu cầu hoàn tiền cho đơn hàng <strong>#{order?.orderCode}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Predefined Reasons */}
          <div className="space-y-2">
            <Label className="font-semibold text-slate-800">Lý do hoàn tiền <span className="text-red-500">*</span></Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 h-11 focus:ring-slate-900">
                <SelectValue placeholder="Chọn lý do chính..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-semibold text-slate-800">Mô tả chi tiết (Tùy chọn)</Label>
            <Textarea
              placeholder="Vui lòng cung cấp thêm thông tin chi tiết về sự cố sản phẩm của bạn..."
              className="min-h-24 rounded-xl border-slate-200 focus:ring-slate-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label className="font-semibold text-slate-800">Hình ảnh bằng chứng (Tối đa 4 ảnh)</Label>
            
            {/* Uploaded Images List */}
            <div className="grid grid-cols-4 gap-4 mt-2">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border bg-slate-50 group">
                  <Image src={imgUrl} alt="Proof" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 animate-in fade-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'products'}
                  onSuccess={(result: any) => setImages((prev) => [...prev, result.info.secure_url])}
                  onOpen={() => {
                    // Fix Radix UI Dialog body style pointer-events: none blocking click interactions
                    setTimeout(() => {
                      document.body.style.pointerEvents = 'auto';
                    }, 100);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="border border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors bg-slate-50/50 cursor-pointer"
                    >
                      <Camera className="w-6 h-6 mb-1 text-slate-400" />
                      <span className="text-[10px] font-medium">Tải ảnh</span>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cung cấp hình ảnh rõ nét về lỗi sản phẩm để được phê duyệt nhanh hơn.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="ghost" onClick={onClose} disabled={requestRefundMutation.isPending} className="rounded-xl">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestRefundMutation.isPending || !reason}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {requestRefundMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi yêu cầu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
