"use client";

import { useState, useEffect } from "react";
import { Star, Camera, Trash2, Loader2, CheckCircle2, MessageSquare, AlertCircle, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const reviewParam = searchParams.get("review");
  const orderIdParam = searchParams.get("orderId");

  const [limit, setLimit] = useState(5);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form states
  const [userRating, setUserRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 1. Fetch reviews list and statistics
  const { data, isLoading, refetch } = trpc.review.getByProductId.useQuery(
    {
      productId,
      page: 1,
      limit,
    },
    {
      placeholderData: (prev) => prev,
    }
  );

  // 2. Fetch eligibility (only when modal is open and orderId wasn't passed via search query)
  const shouldCheckEligibility = isWriteModalOpen && !orderIdParam && !!session;
  const eligibilityQuery = trpc.review.checkEligibility.useQuery(
    { productId },
    { enabled: shouldCheckEligibility }
  );

  const eligibility = eligibilityQuery.data as { eligible: boolean; orderId?: string; orderCode?: string; message?: string } | undefined;

  // Invalidate and fetch on load if query parameters ask for review modal
  useEffect(() => {
    if (reviewParam === "true") {
      if (!session) {
        toast.error("Vui lòng đăng nhập để viết đánh giá.");
        // Redirect to login page or open auth modal, keeping callback url
        router.push(`/login?callbackUrl=/products/${productId}?review=true${orderIdParam ? `&orderId=${orderIdParam}` : ""}`);
        return;
      }
      setIsWriteModalOpen(true);
      if (orderIdParam) {
        setSelectedOrderId(orderIdParam);
      }
    }
  }, [reviewParam, orderIdParam, session, productId, router]);

  // Set order ID from eligibility query if not provided by param
  useEffect(() => {
    if (eligibility?.eligible && !orderIdParam && eligibility.orderId) {
      setSelectedOrderId(eligibility.orderId);
    }
  }, [eligibility, orderIdParam]);

  // 3. Create review mutation
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Đăng đánh giá thành công!");
      setIsWriteModalOpen(false);
      
      // Explicitly reset body styles to restore page scroll
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
      
      refetch();
      // Reset form
      setUserRating(5);
      setComment("");
      setImages([]);
      setSelectedOrderId(null);

      // Clean search parameters from URL
      const params = new URLSearchParams(window.location.search);
      params.delete("review");
      params.delete("orderId");
      const newSearch = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại.");
    },
  });

  const handleWriteReviewClick = () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để viết đánh giá.");
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }
    setIsWriteModalOpen(true);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.error("Không tìm thấy đơn hàng hợp lệ để đánh giá.");
      return;
    }
    if (comment.length < 10) {
      toast.error("Đánh giá phải từ 10 ký tự trở lên.");
      return;
    }

    createReviewMutation.mutate({
      productId,
      orderId: selectedOrderId,
      rating: userRating,
      comment,
      images,
    });
  };

  // Derive ratings stats (SSR fallback to initial props)
  const activeRating = data?.stats.rating ?? rating;
  const activeReviewCount = data?.stats.reviewCount ?? reviewCount;
  const activeBreakdown = data?.stats.breakdown ?? [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const handleCloseModal = () => {
    setIsWriteModalOpen(false);
    
    // Explicitly reset body styles to restore page scroll
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    
    // Clean params if modal is closed
    if (reviewParam === "true") {
      const params = new URLSearchParams(window.location.search);
      params.delete("review");
      params.delete("orderId");
      const newSearch = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <section id="reviews" className="py-12 border-t border-slate-100 mt-16 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Đánh Giá Khách Hàng
      </h2>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Rating Breakdown Card */}
        <div className="w-full md:w-[35%] flex flex-col items-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100 h-fit">
          <div className="text-5xl font-bold text-slate-900 mb-2">{activeRating.toFixed(1)}</div>
          <div className="flex text-yellow-500 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < Math.floor(activeRating) ? "fill-current text-yellow-500" : "text-slate-300"}`} />
            ))}
          </div>
          <p className="text-sm text-slate-500 mb-6">Dựa trên {activeReviewCount} đánh giá</p>

          <div className="w-full space-y-3 mb-6">
            {activeBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center text-sm text-slate-600">
                <span className="w-10 flex items-center font-medium gap-0.5">
                  {row.stars} <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                </span>
                <div className="flex-1 h-2 mx-3 bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: `${row.percentage}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-slate-400">{row.percentage}%</span>
              </div>
            ))}
          </div>

          <Button onClick={handleWriteReviewClick} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-5 shadow-md transition-all hover:scale-[1.01]">
            Viết đánh giá
          </Button>
        </div>

        {/* Reviews List */}
        <div className="w-full md:w-[65%] flex flex-col gap-6">
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Đang tải đánh giá...</p>
            </div>
          ) : !data || data.reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="font-semibold text-slate-800 mb-1">Chưa có đánh giá nào</h4>
              <p className="text-xs text-slate-500 max-w-[280px]">Hãy là khách hàng đầu tiên mua và chia sẻ cảm nhận về sản phẩm này!</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 divide-y divide-slate-100">
                {data.reviews.map((review: any) => (
                  <div key={review._id} className="pt-6 first:pt-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-slate-200 border border-slate-300">
                          <AvatarFallback className="text-slate-700 text-xs font-bold font-sans">
                            {getUserInitials(review.customer?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">{review.customer?.name || "Khách hàng"}</h4>
                            {review.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.2">
                                <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
                                Đã mua
                              </span>
                            )}
                          </div>
                          <div className="flex text-yellow-500 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <p className="text-slate-700 mt-3.5 text-sm leading-relaxed whitespace-pre-line pl-12">{review.comment}</p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pl-12">
                        {review.images.map((imgUrl: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in transition hover:opacity-95 bg-slate-50"
                          >
                            <Image src={imgUrl} alt={`Review photo ${idx + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* View More Button */}
              {data.totalPages > 1 && limit < data.totalCount && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    className="rounded-full shadow-sm text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors text-xs px-6"
                    onClick={() => setLimit((l) => l + 5)}
                  >
                    Xem thêm đánh giá ({data.totalCount - limit})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. Write Review Modal */}
      <Dialog open={isWriteModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh] rounded-3xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Viết đánh giá sản phẩm</DialogTitle>
            <DialogDescription className="text-slate-500">
              Chia sẻ trải nghiệm chân thực của bạn để giúp những người mua sắm khác lựa chọn tốt hơn.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Content - Depends on eligibility */}
          {eligibilityQuery.isLoading && !orderIdParam ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Đang kiểm tra điều kiện đánh giá...</p>
            </div>
          ) : !selectedOrderId && eligibility?.eligible === false ? (
            <div className="space-y-4 py-4 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 px-4 leading-relaxed">
                {eligibility.message}
              </p>
              <DialogFooter className="w-full pt-4">
                <Button onClick={handleCloseModal} className="w-full bg-slate-900 text-white rounded-xl">
                  Đóng lại
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 py-2">
              {/* Stars Selection */}
              <div className="space-y-2 text-center bg-slate-50/50 rounded-2xl py-4 border border-slate-100">
                <Label className="font-semibold text-slate-800 block text-xs tracking-wider uppercase mb-1">Mức độ hài lòng</Label>
                <div className="flex gap-2.5 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = hoveredRating !== null ? star <= hoveredRating : star <= userRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        className="transition-transform active:scale-95 focus:outline-none"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        onClick={() => setUserRating(star)}
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 cursor-pointer transition-colors duration-100",
                            isFilled ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-semibold text-amber-600 mt-1">
                  {userRating === 5 && "Cực kỳ hài lòng"}
                  {userRating === 4 && "Hài lòng"}
                  {userRating === 3 && "Bình thường"}
                  {userRating === 2 && "Không hài lòng"}
                  {userRating === 1 && "Rất không hài lòng"}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="font-semibold text-slate-800">Nhập nội dung đánh giá <span className="text-red-500">*</span></Label>
                  <span className="text-[10px] text-slate-400 font-medium">Tối thiểu 10 ký tự</span>
                </div>
                <Textarea
                  placeholder="Sản phẩm mặc lên phom dáng như thế nào? Chất vải dày hay mỏng? Đường may có tỉ mỉ không?..."
                  className="min-h-24 rounded-xl border-slate-200 focus:ring-slate-900 focus-visible:ring-slate-900"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Vui lòng viết tiếng Việt có dấu.</span>
                  <span className={cn(comment.length >= 10 ? "text-emerald-600 font-medium" : "text-slate-400")}>
                    Đã nhập: {comment.length} ký tự
                  </span>
                </div>
              </div>

              {/* Cloudinary Upload Widget */}
              <div className="space-y-2">
                <Label className="font-semibold text-slate-800">Đính kèm hình ảnh (Tối đa 4 ảnh)</Label>

                {/* Uploaded Previews */}
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border bg-slate-50 group">
                      <Image src={imgUrl} alt="Review attachment" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 animate-in fade-in cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {images.length < 4 && (
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "products"}
                      onSuccess={(result: any) => setImages((prev) => [...prev, result.info.secure_url])}
                      onOpen={() => {
                        // Fix Radix UI Dialog body style pointer-events blocking clicks in CldWidget
                        setTimeout(() => {
                          document.body.style.pointerEvents = "auto";
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
              </div>

              {/* Order Info verification badge */}
              {selectedOrderId && (
                <div className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <span>Liên kết với đơn hàng:</span>
                  <span className="font-bold text-slate-700">
                    {eligibility?.orderCode || "Chi tiết đơn hàng"}
                  </span>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={createReviewMutation.isPending} className="rounded-xl">
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={createReviewMutation.isPending || comment.length < 10 || !selectedOrderId}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  {createReviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Đăng đánh giá"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Image Lightbox Overlay Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 transition-all duration-300"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] aspect-auto overflow-hidden rounded-lg" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Review attachment full screen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </section>
  );
}
