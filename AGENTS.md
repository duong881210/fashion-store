## PROMPT 3.3 — Storefront Product Pages

```
Context: Product backend complete. Storefront layout from Phase 1. Next.js 16 App Router.
Phase 3 Step 3: Customer-facing product catalog.

## TASK: Build all storefront product pages

### IMPORTANT: Next.js 16 async params
```typescript
// CORRECT in Next.js 16:
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // MUST await
  // ...
}

// generateMetadata also receives async params:
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // ...
}
```

### 1. Product Listing Page (`src/app/(store)/products/page.tsx`)
Server Component with Suspense:
- URL-based filters: `?category=ao&priceMin=0&priceMax=500000&sizes=S,M&sort=newest`
- Read filters from `searchParams` (also async in Next.js 16: `const sp = await searchParams`)
- Fetch products server-side, pass to client ProductGrid component

Filter Sidebar (Client Component, Sheet on mobile):
- Category accordion (multi-select checkboxes)
- Price range slider (Radix Slider, 0–5,000,000đ)
- Size buttons (XS/S/M/L/XL/XXL toggle)
- Color swatches (colored circles)
- Rating filter (star icons, "4 stars & up")
- "Xóa bộ lọc" link — clears all query params

ProductGrid (Client Component):
- CSS Grid: 3 cols desktop, 2 tablet, 1 mobile
- ProductCard (see below)
- Pagination with Next.js `<Link>` for SEO-friendly navigation

ProductCard Component:
- next/image with hover: show second image on hover (CSS transition opacity)
- Sale badge: red badge showing "-%{percent}"
- Out of Stock overlay: semi-transparent with "Hết hàng" text
- Name, price (del if on sale), rating stars + count
- Wishlist button (heart icon, calls `trpc.user.toggleWishlist`)
- "Thêm vào giỏ" quick-add (opens size selector Popover if multiple sizes, or adds directly)
- Quick View on hover → Dialog with condensed product info

### 2. Product Detail Page (`src/app/(store)/products/[slug]/page.tsx`)
Server Component (SEO-critical):
```typescript
export async function generateStaticParams() {
  // return slugs of top 100 products for ISR
}
export const revalidate = 3600 // ISR: revalidate every hour
```

generateMetadata: use product.seoTitle/seoDescription/images[0] for og:image.

Layout (2-column on desktop):
**Left: Image Gallery**
- Main image: `fill` layout, objectFit: contain, click to zoom (Dialog with full-size)
- Thumbnails: horizontal scroll strip, click updates main image
- Mobile: touch-swipeable carousel (use `embla-carousel-react`)

**Right: Product Info**
- Breadcrumb: Home > {category.name} > {product.name}
- Name (Playfair Display, 2xl)
- Rating: star display (half stars) + "{count} đánh giá" anchor link
- Price: `{salePrice}đ` bold red | `{price}đ` gray strikethrough
- Color selector: pill buttons, selected shows border + checkmark
- Size selector: grid of size buttons (disabled + line-through if out of stock)
- Size guide link → Dialog with size chart table
- Low stock warning: "Chỉ còn {n} sản phẩm" if stock < 5
- Quantity stepper
- "Thêm vào giỏ hàng" (primary, full width) — adds to `useCartStore`
- "Mua ngay" (secondary) — add + redirect /checkout
- Product description accordion tabs

**Below: Related Products** (same category, limit 8, horizontal scroll on mobile)

**Below: Reviews** (Client Component, pagination)
- Rating breakdown bar chart
- Review cards + "Viết đánh giá" (only if delivered order + not yet reviewed)

### 3. Homepage (`src/app/(store)/page.tsx`)
Server Component with multiple Suspense boundaries:
- Hero carousel (Client Component, auto-advance, 3 banners)
- Category grid (Server Component with next/image)
- New Arrivals (Server Component + horizontal scroll)
- Promotional banner with countdown timer (Client Component)
- Best Sellers section

### QUALITY REQUIREMENTS
- Use `React.use()` for unwrapping server data promises where applicable
- All images: explicit width/height OR layout="fill" with parent position:relative
- `loading="lazy"` on below-fold images, `priority` on hero/first product image
- Structured data (JSON-LD) in product detail page for Google Shopping
```

---

---
