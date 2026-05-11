"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useCartStore } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Type definition based on trpc output for IProduct
export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images: string[];
    rating: number;
    reviewCount: number;
    isPublished: boolean;
    variants: Array<{
      color: string;
      colorHex: string;
      sizes: Array<{ size: string; stock: number }>;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false); // Default local state, actual feature requires auth
  const { data: session } = useSession();
  const [imgSrc, setImgSrc] = useState(product.images[0] || "/placeholder.svg");
  const [imgSrc2, setImgSrc2] = useState(product.images[1] || null);

  const toggleWishlist = trpc.user?.toggleWishlist?.useMutation({
    onSuccess: () => setIsWishlisted(!isWishlisted)
  });

  const { mutate: addToBackendCart } = trpc.cart.addItem.useMutation({
    onError: (err) => {
      toast.error(err.message || "Không thể thêm vào giỏ hàng");
    }
  });

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist.mutate({ productId: product._id });
    } else {
      setIsWishlisted(!isWishlisted);
    }
  };

  // Find total stock across all variants
  const totalStock = product.variants?.reduce((sum, v) =>
    sum + v.sizes.reduce((s, size) => s + size.stock, 0), 0) || 0;

  const isOutOfStock = totalStock <= 0;
  const isSale = !!product.salePrice && product.salePrice < product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // For products with variants, ideally we open a modal or navigate to detail page.
    // For now, if there's only 1 default size, we can add it directly. 
    // Otherwise we redirect to product options (detail page).
    const allSizes = product.variants?.flatMap(v => v.sizes) || [];
    if (allSizes.length === 1) {
      const v = product.variants[0];
      const s = v.sizes[0];
      
      // Optimistic local update
      addItem({
        product: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: imgSrc,
        color: v.color,
        size: s.size,
        quantity: 1
      });

      // Sync to backend if logged in
      if (session) {
        addToBackendCart({
          productId: product._id,
          color: v.color,
          size: s.size,
          quantity: 1
        });
      }
      
      toast.success("Đã thêm vào giỏ hàng!");
    } else {
      // Use client-side routing instead of hard reload
      toast.info("Vui lòng chọn màu sắc và kích thước");
      router.push(`/products/${product.slug}`);
    }
  };

  const formattedPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price);
  const formattedSalePrice = product.salePrice
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.salePrice)
    : null;

  return (
    <div className="group block h-full relative">
      <div
        className="relative flex flex-col h-full bg-white transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden border border-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`Xem ${product.name}`} />

        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 pointer-events-none">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            onError={() => setImgSrc("/placeholder.svg")}
            className={`object-cover transition-opacity duration-500 ${isHovered && imgSrc2 ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {imgSrc2 && (
            <Image
              src={imgSrc2}
              alt={`${product.name} alternate view`}
              fill
              onError={() => setImgSrc2(null)}
              className={`object-cover absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isSale && (
              <Badge variant="destructive" className="bg-red-600 text-white border-0 font-medium">
                -{Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)}%
              </Badge>
            )}
            {/* New badge could be added here based on createdAt */}
          </div>

          {/* OOS Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
              <span className="font-semibold text-slate-800 text-lg uppercase tracking-wider px-4 py-2 bg-white/90 shadow-sm rounded-md">Hết hàng</span>
            </div>
          )}

          {/* Add to Cart Overlay Bottom */}
          <div className={`absolute bottom-0 inset-x-0 p-3 z-20 bg-gradient-to-t from-black/50 to-transparent transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:opacity-0 md:translate-y-4'}`}>
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg rounded-full h-10 font-medium pointer-events-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </Button>
          </div>
        </div>

        {/* Action Buttons (Right Side) */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 z-20 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 md:opacity-0'}`}>
          <Button
            size="icon"
            variant="secondary"
            className={`rounded-full shadow-md bg-white hover:bg-slate-50 transition-colors ${isWishlisted ? 'text-red-500' : 'text-slate-600'}`}
            onClick={handleWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1 relative z-10 pointer-events-none">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs text-slate-600 ml-1 font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
          </div>

          <h3 className="font-medium text-slate-900 line-clamp-2 leading-snug mb-2 flex-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            {isSale ? (
              <>
                <span className="font-bold text-red-600">{formattedSalePrice}</span>
                <span className="text-sm text-slate-400 line-through">{formattedPrice}</span>
              </>
            ) : (
              <span className="font-bold text-slate-900">{formattedPrice}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
