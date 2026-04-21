import { notFound } from "next/navigation";
import { Metadata } from "next";
import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/context";
import connectDB from "@/server/db";
import { Product } from "@/server/db/models/Product";

import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { ProductReviews } from "@/components/store/ProductReviews";
import { RelatedProducts } from "@/components/store/RelatedProducts";

// Static Incremental Regeneration
export const revalidate = 3600;

export async function generateStaticParams() {
  await connectDB();
  // Fetch top products to statically generate at build
  const topProducts = await Product.find({ isPublished: true })
    .select('slug')
    .sort({ sold: -1 })
    .limit(100)
    .lean();
  
  return topProducts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);
  
  try {
    const product = await caller.product.getBySlug({ slug });
    return {
      title: `${product.seoTitle || product.name} | FS Store`,
      description: product.seoDescription || product.description?.substring(0, 160) || "",
      openGraph: {
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      }
    }
  } catch (e) {
    return { title: 'Sản phẩm không tồn tại | FS Store' }
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = typeof appRouter.createCaller === 'function' ? appRouter.createCaller(ctx) : (appRouter as any)(ctx);

  let product;
  let relatedProducts;

  try {
    product = await caller.product.getBySlug({ slug });
    relatedProducts = await caller.product.getAll({ 
      categorySlug: product.category?.slug, 
      limit: 9,
      page: 1
    });
  } catch (error) {
    notFound();
  }

  // Generate structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.seoDescription || product.name,
    sku: product._id,
    offers: {
      "@type": "Offer",
      url: `https://fs-store.com/products/${product.slug}`,
      priceCurrency: "VND",
      price: product.salePrice || product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 2-column layout container */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mb-16">
        <div className="w-full md:w-[45%] lg:w-1/2 md:sticky md:top-24 h-fit">
          <ProductGallery images={product.images} />
        </div>
        <div className="w-full md:w-[55%] lg:w-1/2">
          <ProductInfo product={product as any} />
        </div>
      </div>

      {/* Product Description */}
      <div className="border-t border-slate-100 pt-16 mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Chi tiết sản phẩm
        </h2>
        {product.description ? (
          <div 
            className="prose prose-slate max-w-none text-slate-600 leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />
        ) : (
          <p className="text-slate-500 italic">Nội dung mô tả đang được biên soạn.</p>
        )}
      </div>

      {/* Exclude the current product from related products */}
      <RelatedProducts products={relatedProducts.products.filter((p: any) => p._id !== product._id).slice(0, 8)} />
      
      <ProductReviews 
        productId={product._id} 
        rating={product.rating} 
        reviewCount={product.reviewCount} 
      />
    </div>
  );
}
