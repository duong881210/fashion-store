"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Minus, Plus, Ruler, Heart, ShieldCheck, Truck, Check } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

// Represents the data structure passed down from the product query
interface ProductInfoProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    rating: number;
    reviewCount: number;
    images: string[];
    category: { name: string; slug: string };
    variants: Array<{
      color: string;
      colorHex: string;
      sizes: Array<{ size: string; stock: number }>;
    }>;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCartStore();

  // Selected state
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Derive contextual data from variants
  const activeVariant = product.variants?.find(v => v.color === selectedColor);
  const activeSizeData = activeVariant?.sizes?.find(s => s.size === selectedSize);
  const maxStock = activeSizeData ? activeSizeData.stock : 0;
  
  const isOutOfStock = maxStock < 1;
  const isLowStock = maxStock > 0 && maxStock < 5;

  const formattedPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price);
  const formattedSalePrice = product.salePrice 
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.salePrice)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước");
      return;
    }
    if (isOutOfStock) return;
    
    addItem({
      product: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '',
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (selectedSize && !isOutOfStock) {
      router.push("/checkout"); // Assumes this route exist
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 space-x-2 mb-4">
        <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-slate-900 transition-colors">
          {product.category?.name || "Danh mục"}
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Header & Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
        {product.name}
      </h1>

      {/* Ratings */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center">
          <div className="flex text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-slate-300"}`} />
            ))}
          </div>
          <span className="ml-2 font-medium text-sm text-slate-700">{product.rating.toFixed(1)}</span>
        </div>
        <div className="text-sm text-slate-500">
          <a href="#reviews" className="hover:text-slate-900 underline underline-offset-4 decoration-slate-300 transition-colors">
            {product.reviewCount} đánh giá
          </a>
        </div>
        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          Còn hàng
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 mb-8">
        {formattedSalePrice ? (
          <>
            <span className="text-3xl font-bold text-red-600">{formattedSalePrice}</span>
            <span className="text-lg text-slate-400 line-through mb-1">{formattedPrice}</span>
            <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-sm mb-1 uppercase">Sale</span>
          </>
        ) : (
          <span className="text-3xl font-bold text-slate-900">{formattedPrice}</span>
        )}
      </div>

      <div className="w-full h-px bg-slate-100 mb-8" />

      {/* Color Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 flex justify-between mb-3">
          <span>Màu sắc: <span className="font-normal text-slate-500 ml-1">{selectedColor}</span></span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {product.variants?.map((v) => (
            <button
              key={v.color}
              onClick={() => {
                setSelectedColor(v.color);
                setSelectedSize(''); // Reset size when color changes
                setQuantity(1);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                selectedColor === v.color ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : "ring-1 ring-slate-200 hover:scale-105"
              }`}
              style={{ backgroundColor: v.colorHex || '#ddd' }}
              aria-label={`Select color ${v.color}`}
            >
              {selectedColor === v.color && (
                <Check className={`w-5 h-5 ${v.colorHex === '#ffffff' || v.colorHex === '#fff' ? 'text-slate-900' : 'text-white'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Kích thước: <span className="font-normal text-slate-500 ml-1">{selectedSize || 'Vui lòng chọn'}</span>
          </h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-slate-500 hover:text-slate-900 flex items-center underline underline-offset-4 decoration-slate-300">
                <Ruler className="w-4 h-4 mr-1.5" /> Bảng kích thước
              </button>
            </DialogTrigger>
            <DialogContent>
               <DialogTitle>Bảng Kích Thước (Size Chart)</DialogTitle>
               <div className="overflow-x-auto mt-4">
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="border p-3 font-medium">Size</th>
                        <th className="border p-3 font-medium">Chiều cao (cm)</th>
                        <th className="border p-3 font-medium">Cân nặng (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['XS','S','M','L','XL','XXL'].map((s,i) => (
                        <tr key={s} className="border-b">
                          <td className="border p-3 font-medium">{s}</td>
                          <td className="border p-3">{155 + i*5} - {160 + i*5}</td>
                          <td className="border p-3">{45 + i*8} - {50 + i*8}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {activeVariant?.sizes?.map((s) => {
            const outOfStockLocal = s.stock < 1;
            return (
              <button
                key={s.size}
                disabled={outOfStockLocal}
                onClick={() => {
                  setSelectedSize(s.size);
                  setQuantity(1);
                }}
                className={`h-12 rounded-md font-medium text-sm transition-all border outline-none ${
                  selectedSize === s.size
                    ? "border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                    : outOfStockLocal
                    ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>

        {isLowStock && selectedSize && (
          <p className="text-sm mt-3 font-medium text-amber-600 flex items-center">
            🔥 Chỉ còn {maxStock} sản phẩm. Nhanh tay đặt ngay!
          </p>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center border border-slate-200 rounded-lg h-12 bg-white w-full sm:w-32">
          <button 
            type="button" 
            className="w-10 flex items-center justify-center text-slate-500 hover:text-slate-900"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input 
            type="number" 
            min="1" 
            max={Math.max(1, maxStock)} 
            className="flex-1 text-center font-medium bg-transparent border-none focus:ring-0 outline-none w-full"
            value={quantity}
            readOnly
          />
          <button 
            type="button" 
            className="w-10 flex items-center justify-center text-slate-500 hover:text-slate-900"
            onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <Button 
          size="lg" 
          variant="outline" 
          className="h-12 flex-1 rounded-lg border-2" 
          onClick={handleAddToCart}
          disabled={isOutOfStock || !selectedSize}
        >
          {isOutOfStock && selectedSize ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>

        <Button 
          size="lg" 
          className="h-12 flex-[2] rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5"
          onClick={handleBuyNow}
          disabled={isOutOfStock || !selectedSize}
        >
          Mua ngay
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="block font-medium text-slate-900">Cam kết chính hãng</span>
            <span className="text-slate-500">100% Authentic</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="block font-medium text-slate-900">Giao hàng hỏa tốc</span>
            <span className="text-slate-500">Miễn phí Đơn từ 500k</span>
          </div>
        </div>
      </div>
    </div>
  );
}
