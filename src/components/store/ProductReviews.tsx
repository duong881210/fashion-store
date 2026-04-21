"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const [page, setPage] = useState(1);

  // Mock data for display purposes
  const breakdown = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  const mockReviews = [
    { id: 1, author: "Nguyễn Văn A", rating: 5, date: "15/05/2026", content: "Chất lượng sản phẩm tuyệt vời, mặc rất thoải mái. Giao hàng nhanh chóng." },
    { id: 2, author: "Trần Thị B", rating: 4, date: "12/05/2026", content: "Màu sắc giống hình, form áo đẹp. Sẽ ủng hộ shop thêm." },
    { id: 3, author: "Lê Văn C", rating: 5, date: "10/05/2026", content: "Đóng gói cẩn thận, sản phẩm chất lượng cao." },
  ];

  return (
    <section id="reviews" className="py-12 border-t border-slate-100">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Đánh Giá Khách Hàng
      </h2>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Rating Breakdown */}
        <div className="w-full lg:w-1/3 flex flex-col items-center bg-slate-50 rounded-2xl p-8 border border-slate-100 h-fit">
          <div className="text-5xl font-bold text-slate-900 mb-2">{rating.toFixed(1)}</div>
          <div className="flex text-yellow-500 mb-2">
             {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-current" : "text-slate-300"}`} />
             ))}
          </div>
          <p className="text-sm text-slate-500 mb-6">Dựa trên {reviewCount} đánh giá</p>

          <div className="w-full space-y-3 mb-8">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center text-sm text-slate-600">
                <span className="w-12 flex items-center font-medium">{row.stars} <Star className="w-3.5 h-3.5 ml-1 fill-yellow-500 text-yellow-500" /></span>
                <div className="flex-1 h-2 mx-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: `${row.percentage}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-slate-400">{row.percentage}%</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-slate-900 text-white rounded-full">Viết đánh giá</Button>
        </div>

        {/* Reviews List */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {mockReviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h4 className="font-semibold text-slate-900">{review.author}</h4>
                   <div className="flex text-yellow-500 mt-1">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-300"}`} />
                     ))}
                   </div>
                 </div>
                 <span className="text-sm text-slate-400">{review.date}</span>
               </div>
               <p className="text-slate-700 mt-3 text-sm leading-relaxed">{review.content}</p>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Button variant="outline" className="rounded-full shadow-sm text-slate-600 border-slate-200" onClick={() => setPage(p => p+1)}>
              Xem thêm đánh giá
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
