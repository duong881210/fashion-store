"use client";

import { trpc } from "@/lib/trpc";
import { ProductCard } from "@/components/store/ProductCard";
import { HeartCrack, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = trpc.user.getWishlist.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-2">Danh sách yêu thích</h1>
      <p className="text-slate-500 mb-8">Những sản phẩm bạn đã lưu lại để mua sau.</p>

      {!wishlist || wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <HeartCrack className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Danh sách yêu thích trống</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Hãy tiếp tục khám phá và lưu lại những món đồ bạn thích nhé!
          </p>
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {wishlist.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
