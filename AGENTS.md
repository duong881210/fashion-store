# ═══════════════════════════════════════════
# PHASE 7 — VNPAY + EMAIL + FINAL POLISH
# ═══════════════════════════════════════════

## PROMPT 7.1 — VNPay Payment Gateway

```
Context: Full project (Phase 1-6) complete. Now integrate VNPay.

## TASK: VNPay payment flow (sandbox + production ready)

### Test credentials
VNPay Sandbox URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
Test card: 9704198526191432198 | 07/15 | OTP: 123456 (Napas)

### 1. VNPay Utility (`src/lib/vnpay.ts`)

**Required functions:**

`createPaymentUrl(params: CreatePaymentParams): string`
```typescript
interface CreatePaymentParams {
  orderId: string       // vnp_TxnRef — use order.orderCode
  amount: number        // in VND — multiply by 100 for VNPay
  orderInfo: string     // URL-encoded description
  ipAddr: string        // customer's IP
  locale?: 'vn' | 'en'
  returnUrl: string
}
```
Steps:
1. Build vnp_Params object with all required fields
2. vnp_CreateDate: `format(new Date(), 'yyyyMMddHHmmss')` (use date-fns)
3. vnp_ExpireDate: 15 minutes later
4. Sort params keys alphabetically
5. Build query string (do NOT encode values when building hash, only for URL)
6. Sign with HMAC-SHA512 (Node.js `crypto.createHmac('sha512', hashSecret)`)
7. Append vnp_SecureHash to query string and return full URL

`verifySignature(query: Record<string, string>): boolean`
- Extract and remove vnp_SecureHash and vnp_SecureHashType
- Sort remaining params, rebuild query
- Recompute HMAC-SHA512, compare with extracted hash
- Return boolean

`getTransactionMessage(responseCode: string): string`
Map common VNPay response codes to Vietnamese messages:
00→Thành công, 07→Giao dịch bị nghi ngờ lừa đảo, 09→Chưa đăng ký Internet Banking,
24→Giao dịch bị hủy, 51→Không đủ số dư, 65→Vượt hạn mức ngày, 75→Ngân hàng bảo trì,
99→Lỗi không xác định

### 2. Create Payment API (`src/app/api/vnpay/create-payment/route.ts`)
```typescript
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { orderId } = await req.json()
  // Find order, verify belongs to session user
  // Verify status === 'pending' and paymentStatus === 'unpaid'
  // Get IP from headers: req.headers.get('x-forwarded-for')
  // Call createPaymentUrl()
  return Response.json({ paymentUrl })
}
```

### 3. VNPay Return URL (`src/app/api/vnpay/return/route.ts`)
```typescript
export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = Object.fromEntries(url.searchParams)
  
  if (!verifySignature(query)) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-error`)
  }
  
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = query
  
  // Idempotency check: if order already paid, just redirect to success
  const order = await Order.findOne({ orderCode: vnp_TxnRef })
  if (!order) return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-error`)
  
  if (vnp_ResponseCode === '00') {
    // VERIFY: vnp_Amount / 100 must equal order.total
    if (parseInt(vnp_Amount) / 100 !== order.total) {
      // Amount mismatch — fraud prevention
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-error`)
    }
    if (order.paymentStatus !== 'paid') {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'paid',
        vnpayTransactionId: vnp_TransactionNo,
        $push: { timeline: { status: 'paid', message: 'Thanh toán VNPay thành công', timestamp: new Date() } }
      })
      // Emit socket notification to admin (via global io)
    }
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/success`)
  } else {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/failed?reason=${vnp_ResponseCode}`)
  }
}
```

### 4. VNPay IPN Handler (`src/app/api/vnpay/ipn/route.ts`)
POST handler (VNPay server-to-server callback — more reliable):
- Verify signature
- Check order exists + amount matches
- Update payment status if not already done
- Return EXACT JSON: `{ RspCode: '00', Message: 'Confirm Success' }` (VNPay requires this)

### 5. VnpayLog Model (for debugging)
```typescript
// src/server/db/models/VnpayLog.ts
{ orderCode: String, type: 'return'|'ipn', query: Object, verified: Boolean, createdAt: Date }
```
Log ALL VNPay interactions regardless of outcome.

### QUALITY REQUIREMENTS
- NEVER trust vnp_Amount from VNPay — always verify against your DB order.total
- Signature verification ALWAYS server-side, never client-side
- Idempotency: handle duplicate IPN calls gracefully
- Amount encoding: order.total VND × 100 = vnp_Amount (e.g. 150,000đ → 15000000)
```

---

## PROMPT 7.2 — Email Notifications with Resend

```
Context: Orders, VNPay complete. Phase 7 Step 2: email system.

## TASK: Transactional email with Resend

### 1. Email utility (`src/lib/email.ts`)
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await resend.emails.send({
      from: 'Cửa hàng Fashion <noreply@yourstore.com>',
      to, subject, html
    })
  } catch (error) {
    console.error('[Email Error]', error) // Never throw — email failure should not break flow
  }
}
```

### 2. HTML email templates (inline CSS only, no Tailwind)
Create as functions returning HTML strings:

`orderConfirmedTemplate(data: { customerName, orderCode, items, total, shippingAddress, paymentMethod }): string`
- Clean table layout
- Store logo (Cloudinary URL)
- Order items table with images, names, prices
- Price breakdown
- "Theo dõi đơn hàng" CTA button linking to `{NEXT_PUBLIC_APP_URL}/orders/{orderId}`

`orderStatusTemplate(data: { customerName, orderCode, status, message }): string`
- Status-specific color header: shipping=blue (#3B82F6), delivered=green (#22C55E)
- Status icon + message
- For delivered: "Đánh giá ngay" CTA button

`passwordResetTemplate(data: { customerName, resetUrl }): string`
- Reset link with 1-hour expiry notice
- Security note: "Nếu bạn không yêu cầu..."

### 3. Trigger points
In order.create (after successful transaction):
```typescript
// Fire and forget — don't await
sendEmail(user.email, `Xác nhận đơn hàng #${order.orderCode}`, orderConfirmedTemplate({...}))
```

In order.updateStatus:
- status === 'shipping': send orderStatusTemplate
- status === 'delivered': send orderStatusTemplate

### 4. Password Reset Flow
- `src/app/(store)/forgot-password/page.tsx`: email input
- `POST /api/auth/forgot-password`: generate token with `crypto.randomBytes(32).toString('hex')`,
  hash with SHA256, store in User (resetToken, resetTokenExpiry: Date.now() + 3600000),
  send passwordResetTemplate
- `src/app/(store)/reset-password/page.tsx?token=...`: new password form
- `POST /api/auth/reset-password`: verify token hash, update password, clear token fields

### QUALITY REQUIREMENTS
- Always fire-and-forget email sends (no await in main request flow)
- HTML emails: test with tables for Outlook compat
- Reset token: store hashed (SHA256) in DB, compare with hash of incoming token
```

---

## PROMPT 7.3 — SEO, Performance & Production Readiness

```
Context: All features complete (Phase 1-7). Final polish.

## TASK: Performance, SEO, security, and production prep

### 1. Next.js 16 Metadata & SEO
Product detail page — full metadata:
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return {
    title: product.seoTitle || `${product.name} | Fashion Store`,
    description: product.seoDescription || product.description.slice(0, 160),
    openGraph: {
      images: [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
    }
  }
}
```

Sitemap (`src/app/sitemap.ts`):
- Static routes: /, /products, /login, /register
- Dynamic: all published product slugs + category slugs

Robots (`src/app/robots.ts`): disallow /admin, /api, /checkout, /orders

JSON-LD in product page:
```typescript
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "image": product.images,
  "offers": { "@type": "Offer", "price": product.salePrice || product.price, "priceCurrency": "VND" }
}) }} />
```

### 2. Next.js 16 Cache Components (new in v16)
Use the new `use cache` directive for expensive queries:
```typescript
// In server components that fetch product data:
'use cache'
import { cacheTag } from 'next/cache'
export async function getFeaturedProducts() {
  cacheTag('featured-products')
  return await Product.find({ isFeatured: true, isPublished: true }).lean()
}
// Invalidate cache from admin when products update:
import { revalidateTag } from 'next/cache'
revalidateTag('featured-products')
```

### 3. Image optimization
- All `next/image` must have explicit `sizes` prop:
  ```tsx
  <Image sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" ... />
  ```
- Use `priority` only on LCP images (hero, first product row)
- Configure allowed Cloudinary domain in `next.config.ts`

### 4. Security
Rate limiting (use `@upstash/ratelimit` + Redis, or simple in-memory for dev):
- `/api/auth/` routes: 5 req/min per IP
- `/api/vnpay/`: 20 req/min per IP

Security headers in `next.config.ts`:
```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
  ]
}]
```

Input sanitization: use `dompurify` (server-side: `isomorphic-dompurify`) on any HTML content
stored in MongoDB (product description, review comments).

### 5. Error handling audit
Every page needs: `loading.tsx` (skeleton) + `error.tsx` (error boundary + retry button).
Every mutation: try/catch with `toast.error` on failure.
tRPC: all procedures wrap in try/catch with TRPCError codes.

### 6. Seed Script (`scripts/seed.ts`)
```typescript
// Run: npx ts-node --esm scripts/seed.ts
// Creates:
// - 1 admin: admin@fashionstore.vn / Admin@123456
// - 5 categories
// - 20 products with variants and placeholder Cloudinary images
// - 10 customers with order history
// - 3 coupons: SALE10 (10%), NEWUSER (50,000đ fixed), FREESHIP (free shipping)
// - Store settings defaults
```

### 7. Docker + deployment config
`Dockerfile` for custom server (Socket.io requirement):
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
```

`docker-compose.yml`: app + mongodb (for local dev)

Health check: `GET /api/health` → `{ status: 'ok', db: 'connected', timestamp: ISO_STRING }`

### README.md must include:
- Prerequisites: Node 22 LTS, MongoDB 7.0+
- Installation steps
- Environment variables guide (with VNPay sandbox setup instructions)
- Deployment guide (Railway/Render/VPS)

### QUALITY REQUIREMENTS
- TypeScript: zero errors, zero `any`
- Lighthouse score target: Performance ≥ 90, SEO = 100, Accessibility ≥ 90 (mobile)
- All API routes return proper HTTP status codes
- All console.log removed in production (use conditional `if (process.env.NODE_ENV !== 'production')`)
```
