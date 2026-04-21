# Fashion E-Commerce — Prompt Strategy (Updated March 2026)
# Chiến lược Prompt theo từng giai đoạn — Phiên bản mới nhất

---

## ✅ BẢNG PHIÊN BẢN TECH STACK (Đã kiểm tra tháng 3/2026)

| Package | Phiên bản cũ (prompt trước) | Phiên bản mới nhất | Ghi chú thay đổi quan trọng |
|---|---|---|---|
| **Next.js** | 14+ | **16.2** | App Router, async params bắt buộc, proxy.ts thay middleware, React 19.2 |
| **React** | 18 | **19.2** | View Transitions, useEffectEvent, Activity component |
| **TypeScript** | 5.x | **5.8+** | tRPC v11 yêu cầu tối thiểu TS 5.7.2 |
| **tRPC** | v11 | **v11.13.4** | Stable release từ March 2025 |
| **@trpc/server** | 11.x | **11.13.4** | |
| **@trpc/client** | 11.x | **11.13.4** | |
| **@trpc/next** | 11.x | **11.6.0** | |
| **@tanstack/react-query** | v5 | **v5 (latest)** | Bắt buộc dùng v5 với tRPC v11 |
| **Socket.io** | 4.x | **4.8.3** | WebTransport support, Bun engine |
| **socket.io-client** | 4.x | **4.8.3** | |
| **Mongoose** | 8.x | **9.3.1** | Breaking changes từ v9 (Nov 2025) |
| **next-auth** | v5 beta | **v5 beta (5.0.0-beta.x)** | Vẫn là beta, đủ stable cho production. Dùng `npm i next-auth@beta` |
| **Zod** | v3 | **v4.x** | `import { z } from "zod"` — dùng `zod/v4` subpath hoặc zod@4 |
| **Zustand** | 4.x | **5.0.12** | Breaking: không còn default export, dùng named `{ create }` |
| **shadcn/ui (CLI)** | shadcn-ui | **shadcn@4.1.0** | CLI đổi từ `shadcn-ui` → `shadcn` |
| **Tailwind CSS** | 3.x | **4.x** | Config thay đổi, dùng `@import "tailwindcss"` thay tailwind.config.js |
| **Cloudinary** | 2.x | **next-cloudinary latest** | |
| **bcryptjs** | 2.x | **3.x** | |
| **Node.js** | 18 | **22 LTS** | |

### ⚠️ Những thay đổi BREAKING cần lưu ý:

**Next.js 16:**
- `params` và `searchParams` trong page/layout bây giờ là **async** — phải `await props.params`
- `middleware.ts` được thay bởi `proxy.ts` cho network boundary
- Turbopack là default bundler
- `React.use()` là cách chính để unwrap promises trong Server Components

**Mongoose 9:**
- `strictQuery` mặc định là `true`
- Xóa bỏ callback API (chỉ còn Promise/async-await)
- `Model.findOne()` trả về `null` thay vì `undefined` khi không tìm thấy

**Zustand 5:**
- Không còn `import create from 'zustand'` — phải dùng `import { create } from 'zustand'`
- `useStore` hook API thay đổi

**Zod 4:**
- Import từ `"zod"` vẫn hoạt động (trỏ vào v3 cho backward compat)
- Để dùng v4: `import { z } from "zod/v4"` hoặc cài `zod@^4.0.0`
- Nhiều phương thức mới, performance tốt hơn 14x

---

## 🗺️ ROADMAP TỔNG QUAN

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
Foundation   Auth &      Product     Cart &      Admin       Real-Time   Payment &
& Setup      User        Catalog     Checkout    Dashboard   Socket.io   Polish
(1-2 ngày)  (1-2 ngày)  (2-3 ngày)  (2 ngày)   (3-4 ngày)  (2 ngày)    (2 ngày)
```

---

---

# ═══════════════════════════════════════════
# PHASE 1 — FOUNDATION & PROJECT SETUP
# Mục tiêu: Dự án chạy được, kết nối DB, tRPC hoạt động
# ═══════════════════════════════════════════

## PROMPT 1.1 — Project Initialization & Configuration

```
You are building a production-ready fashion e-commerce platform using the latest stable packages as of March 2026.

## EXACT VERSIONS TO USE
- next: 16.2 (App Router, TypeScript strict)
- react + react-dom: 19.2
- typescript: 5.8+
- @trpc/server + @trpc/client + @trpc/react-query: ^11.13.4
- @tanstack/react-query: ^5
- mongoose: ^9.3.1
- next-auth: beta (npm i next-auth@beta)
- socket.io + socket.io-client: ^4.8.3
- zustand: ^5.0.12
- zod: ^4.0.0 (import from "zod/v4")
- shadcn CLI: shadcn@4.1.0
- tailwindcss: ^4.x

## CRITICAL BREAKING CHANGES TO RESPECT
1. Next.js 16: params/searchParams are ASYNC — always use `const { slug } = await props.params`
2. Next.js 16: use proxy.ts instead of middleware.ts for route protection
3. Zustand 5: named import only — `import { create } from 'zustand'` (no default export)
4. Mongoose 9: Promise-only API (no callbacks), strictQuery defaults to true
5. Zod 4: import from "zod/v4" for latest features, or "zod" (still points to v3 root for compat)
6. React 19: use `React.use()` to unwrap promises in Server Components
7. Tailwind 4: use `@import "tailwindcss"` in CSS, no tailwind.config.js required

## TASK: Set up the complete project foundation

### 1. Initialize project
```bash
npx create-next-app@latest fashion-store \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*"
```

### 2. Install all dependencies
```bash
# Core
npm install @trpc/server@^11.13.4 @trpc/client@^11.13.4 @trpc/react-query@^11.13.4
npm install @tanstack/react-query@^5
npm install mongoose@^9.3.1
npm install next-auth@beta
npm install socket.io@^4.8.3 socket.io-client@^4.8.3
npm install zustand@^5.0.12
npm install zod@^4.0.0
npm install bcryptjs@^3
npm install next-cloudinary cloudinary
npm install resend              # email
npm install react-hook-form @hookform/resolvers
npm install sonner               # toast notifications
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge

# shadcn CLI and init
npx shadcn@latest init
```

### 3. Folder structure to create:
```
src/
├── app/
│   ├── (store)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       └── layout.tsx
│   └── api/
│       ├── trpc/[trpc]/route.ts
│       ├── auth/[...nextauth]/route.ts
│       └── vnpay/
│           ├── create-payment/route.ts
│           └── return/route.ts
├── server/
│   ├── db/
│   │   ├── index.ts           # MongoDB singleton
│   │   └── models/            # (populated in Phase 2-4)
│   └── trpc/
│       ├── index.ts           # Root router
│       ├── context.ts         # tRPC context with session
│       └── middleware.ts      # protectedProcedure, adminProcedure
├── lib/
│   ├── trpc.ts                # tRPC React client
│   ├── utils.ts
│   └── vnpay.ts               # (Phase 7)
├── components/
│   ├── store/
│   ├── admin/
│   └── providers/
│       ├── TRPCProvider.tsx
│       └── SocketProvider.tsx  # (Phase 6)
├── stores/
│   ├── useCartStore.ts
│   └── useUIStore.ts
└── types/
    └── index.ts
```

### 4. MongoDB singleton (`src/server/db/index.ts`)
Use the standard Next.js mongoose connection singleton pattern to cache the connection
across hot-reloads in development. Export `connectDB(): Promise<void>`.

### 5. tRPC v11 setup with Next.js 16 App Router
In `src/server/trpc/context.ts`: extract session using `auth()` from next-auth v5.
In `src/server/trpc/middleware.ts`: define `protectedProcedure` and `adminProcedure`.
In `src/app/api/trpc/[trpc]/route.ts`: use `fetchRequestHandler` from `@trpc/server/adapters/fetch`.

### 6. tRPC React client (`src/lib/trpc.ts`)
Use `createTRPCReact` from `@trpc/react-query`.
Create `src/components/providers/TRPCProvider.tsx` wrapping both TRPCProvider and QueryClientProvider.

### 7. Zustand stores (Zustand v5 syntax)
```typescript
// CORRECT v5 syntax:
import { create } from 'zustand'   // named import, NOT default

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, qty: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  // ... other actions
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}))
```

### 8. Base TypeScript types (`src/types/index.ts`)
Define all shared interfaces using strict types (no `any`): IUser, IProduct, IProductVariant,
ISizeStock, IOrder, IOrderItem, ICart, ICartItem, ICategory, IReview, IChatMessage, IAddress.

### 9. Environment variables template (`.env.local`)
```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/vnpay/return
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### QUALITY REQUIREMENTS
- TypeScript strict: `"strict": true, "noUncheckedIndexedAccess": true` in tsconfig
- Zero `any` types
- All async components properly typed with Next.js 16 PageProps pattern
```

---

## PROMPT 1.2 — Global Layout, Theme & Design System

```
Context: Next.js 16, Tailwind CSS v4, shadcn@4.1.0 initialized. Phase 1, Step 2.

## CRITICAL: Tailwind v4 syntax (NO tailwind.config.js approach)
```css
/* app/globals.css — Tailwind v4 style */
@import "tailwindcss";

@theme {
  --color-primary: #C9A84C;
  --color-primary-foreground: #FAFAF8;
  --color-background: #FAFAF8;
  --color-foreground: #111110;
  --color-muted: #F0EFEC;
  --color-border: #E5E4DF;
  --font-display: "Playfair Display", serif;
  --font-body: "DM Sans", sans-serif;
}
```

## TASK: Build visual foundation

### Design Direction
- Fashion editorial aesthetic: off-white background, near-black text, gold accent
- Typography: Playfair Display (headings) + DM Sans (body) via next/font/google
- Animations: subtle, tasteful — CSS transitions and Tailwind animate-* utilities

### 1. Root layout (`src/app/layout.tsx`)
- Load fonts via `next/font/google`
- Wrap children in `TRPCProvider` and `SessionProvider` (from next-auth/react)
- Add Sonner `<Toaster />` component

### 2. Store layout (`src/app/(store)/layout.tsx`)
- Navbar: logo, nav links, search icon, wishlist icon (badge), cart icon (badge from useCartStore), user avatar dropdown
- Footer: store name, columns (Shop, Help, Company), social icons, payment badges
- Mini-cart drawer component (slides from right on cart icon click)
- Mobile: hamburger → Sheet component from shadcn

### 3. Admin layout (`src/app/(admin)/admin/layout.tsx`)
- Sidebar (240px, collapsible): logo, nav items with icons (Dashboard, Products, Orders, Customers, Chat, Analytics, Settings)
- Topbar: page title, notification bell (badge), admin name + avatar
- Protect route: check session.user.role === 'admin', redirect if not (use Next.js 16 async auth())

### 4. shadcn components to install
```bash
npx shadcn@latest add button input label form sheet dialog dropdown-menu
npx shadcn@latest add badge card table tabs toast avatar skeleton
npx shadcn@latest add select checkbox radio-group slider separator
npx shadcn@latest add popover command tooltip accordion
```

### 5. Shared components
- `components/ui/SkeletonCard.tsx` — product card skeleton (aspect-ratio + animated pulse)
- `components/ui/EmptyState.tsx` — icon + title + description + optional CTA
- `components/ui/PageHeader.tsx` — admin page title + breadcrumb
- `components/store/Navbar.tsx`
- `components/store/Footer.tsx`
- `components/admin/Sidebar.tsx`
- `components/admin/Topbar.tsx`

### QUALITY REQUIREMENTS
- All font variables use CSS custom properties from @theme block
- Dark mode via media query (no class strategy needed with Tailwind v4)
- Responsive: 375px, 768px, 1024px, 1280px, 1440px
```

---

---

# ═══════════════════════════════════════════
# PHASE 2 — AUTHENTICATION & USER SYSTEM
# Mục tiêu: Đăng ký, đăng nhập, phân quyền hoàn chỉnh
# ═══════════════════════════════════════════

## PROMPT 2.1 — User Model & Auth.js v5 (NextAuth v5) Setup

```
Context: Next.js 16, Mongoose 9, NextAuth v5 beta. Phase 2.

## BREAKING CHANGES TO RESPECT
- Mongoose 9: callback API removed, use only async/await. `strictQuery: true` by default.
- NextAuth v5: config goes in `src/auth.ts` (root level), exports { handlers, auth, signIn, signOut }
- Next.js 16: use `auth()` function (not getServerSession), params are async

## TASK: Build complete authentication system

### 1. User Model (`src/server/db/models/User.ts`) — Mongoose 9 syntax
```typescript
import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAddress {
  _id: mongoose.Types.ObjectId
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  street: string
  isDefault: boolean
}

export interface IUser extends Document {
  name: string
  email: string
  password?: string           // optional (Google OAuth users may not have)
  phone?: string
  avatar?: string
  role: 'customer' | 'admin'
  addresses: IAddress[]
  wishlist: mongoose.Types.ObjectId[]
  isActive: boolean
  comparePassword(candidate: string): Promise<boolean>
}

// Pre-save: hash password only if modified
// Instance method: comparePassword
// Export User model with singleton pattern (important for Next.js hot-reload)
const UserSchema = new Schema<IUser>({...}, { timestamps: true })
export const User: Model<IUser> = mongoose.models.User || mongoose.model('User', UserSchema)
```

### 2. NextAuth v5 Config (`src/auth.ts`)
```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from '@/server/db'
import { User } from '@/server/db/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({ clientId: ..., clientSecret: ... }),
    Credentials({
      authorize: async (credentials) => {
        // validate, find user, comparePassword, return user object with id+role
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'customer' | 'admin'
      return session
    }
  },
  pages: { signIn: '/login', error: '/login' }
})

// Extend types in types/next-auth.d.ts:
declare module 'next-auth' {
  interface Session { user: { id: string; role: 'customer' | 'admin' } & DefaultSession['user'] }
  interface User { role: 'customer' | 'admin' }
}
```

### 3. Auth API Route (`src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### 4. Route Protection (`src/proxy.ts` — Next.js 16 uses proxy.ts)
```typescript
// Next.js 16: proxy.ts replaces middleware.ts for network boundary
export { auth as default } from '@/auth'
export const config = {
  matcher: ['/admin/:path*', '/checkout', '/orders/:path*', '/profile/:path*']
}
```

Note: In Next.js 16, you may still use middleware.ts for auth if proxy.ts is not yet stable
for your use case. Check the latest Next.js 16 docs for the recommended approach.

### 5. tRPC User Router (`src/server/trpc/routers/user.ts`) — Zod 4 syntax
```typescript
import { z } from 'zod/v4'   // Use Zod v4

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain uppercase, lowercase and number')
})
```

Procedures:
- `register` (public): create user, hash password (bcryptjs), return sanitized user (no password)
- `getProfile` (protected): current user
- `updateProfile` (protected): name, phone, avatar
- `addAddress` / `updateAddress` / `deleteAddress` (protected)
- `toggleWishlist` (protected): add/remove product from wishlist
- `getAll` (admin): paginated + searchable customer list
- `toggleActive` (admin): ban/unban

### QUALITY REQUIREMENTS
- Mongoose 9: use async/await everywhere, no callbacks
- Never return `password` field — use `.select('-password')` or manual omission
- All Zod schemas in `src/server/trpc/schemas/user.schema.ts`
```

---

## PROMPT 2.2 — Auth UI Pages

```
Context: NextAuth v5 configured. User tRPC router done. shadcn + Tailwind v4 in place. Phase 2 Step 2.

## TASK: Build login, register, and profile pages

### 1. Login Page (`src/app/(store)/login/page.tsx`)
- Two-panel: left = decorative editorial image panel, right = form
- react-hook-form + Zod v4 resolver for validation
- Fields: email, password (show/hide toggle)
- Google OAuth button: calls `signIn('google')` — Server Action pattern with next-auth v5
- Error display: use `useSearchParams()` to read `?error=` param from NextAuth
- On success: redirect to `callbackUrl` param or homepage

### 2. Register Page (`src/app/(store)/register/page.tsx`)
- Form: name, email, password, confirm password
- Client validation with react-hook-form + Zod v4
- On submit: `trpc.user.register.mutate()` → then `signIn('credentials')`
- Password strength meter (visual bar, 4 levels)

### 3. Server Actions for Sign In/Out (next-auth v5 pattern)
```typescript
// src/app/actions/auth.ts
'use server'
import { signIn, signOut } from '@/auth'

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/' })
}

export async function signInWithCredentials(email: string, password: string) {
  await signIn('credentials', { email, password, redirectTo: '/' })
}

export async function handleSignOut() {
  await signOut({ redirectTo: '/login' })
}
```

### 4. Profile Page (`src/app/(store)/profile/page.tsx`)
This is a Server Component that calls `auth()` to get the session:
```typescript
import { auth } from '@/auth'
export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')
  // render client component with session data
}
```

Tabs (client component):
- "Thông tin": edit name, phone, avatar upload
- "Địa chỉ": address list, add/edit/delete via modal, set default
- "Đổi mật khẩu": current password, new password, confirm
- "Danh sách yêu thích": grid of wishlisted products

### 5. Address Form (`src/components/store/AddressForm.tsx`)
- Province dropdown: static JSON of 63 provinces
- District: filtered by selected province
- Ward: filtered by selected district
- (Use https://provinces.open-api.vn/api/ or embed static data)

### QUALITY REQUIREMENTS
- All form errors shown inline below field (not toast)
- Loading states on all submit buttons
- Toast (sonner) on success/error of profile updates
```

---

---

# ═══════════════════════════════════════════
# PHASE 3 — PRODUCT CATALOG
# Mục tiêu: Quản lý sản phẩm end-to-end
# ═══════════════════════════════════════════

## PROMPT 3.1 — Product & Category Models + tRPC Router

```
Context: Phase 1-2 complete. Mongoose 9, tRPC v11.13.4, Zod v4 in use.
Phase 3: Product catalog backend.

## TASK: Build product data layer

### 1. Category Model (`src/server/db/models/Category.ts`)
Fields: name, slug (unique), description?, image?, parent (self-ref ObjectId?),
isActive (default true), order (Number, for display ordering), timestamps
Mongoose 9: no callbacks in schema methods.

### 2. Product Model (`src/server/db/models/Product.ts`)
Fields:
- name: String, required
- slug: String, unique, auto-generated from name with slugify
- description: String (HTML from rich text editor)
- price: Number (VND integer), required
- salePrice: Number? (must be less than price — add validator)
- category: ObjectId ref Category
- tags: [String]
- images: [String] — Cloudinary URLs
- variants: [{ color: String, colorHex: String, sizes: [{ size: String, stock: Number (>=0) }] }]
- totalStock: Number (virtual computed field, NOT stored — use schema virtual)
- sold: Number, default 0
- rating: Number, default 0, min 0, max 5
- reviewCount: Number, default 0
- isPublished: Boolean, default false
- isFeatured: Boolean, default false
- seoTitle: String?
- seoDescription: String?
- timestamps

Schema virtuals (Mongoose 9 syntax):
```typescript
ProductSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((total, variant) => 
    total + variant.sizes.reduce((s, size) => s + size.stock, 0), 0)
})
```

Pre-save hook: auto-generate slug if name changes.

Indexes: slug (unique), category, isPublished + isFeatured, price, sold, rating.

### 3. Review Model (`src/server/db/models/Review.ts`)
Fields: product (ref Product), customer (ref User), order (ref Order), rating (1-5 integer),
comment (String, min 10 chars), images [String]?, isVerified (Boolean, default false), timestamps

Post-save hook: recalculate product.rating (average) and product.reviewCount atomically using
`Product.findByIdAndUpdate` with `$set`.

### 4. Product tRPC Router (`src/server/trpc/routers/product.ts`) — tRPC v11 + Zod v4

Public procedures:
- `getAll`: input schema with page, limit, categorySlug?, priceMin?, priceMax?,
  sizes?, colors?, sort ('newest'|'price_asc'|'price_desc'|'best_seller'|'top_rated'),
  isPublished: true filter always applied.
  Return: { products, totalCount, totalPages, currentPage }

- `getBySlug`: populate category name+slug, reviews (first 5, sorted by newest)
- `getFeatured`: { limit?: number } → isFeatured+isPublished, limit 8
- `getNewArrivals`: sort createdAt desc, limit 8
- `getBestSellers`: sort sold desc, limit 8  
- `search`: text search, return max 10 results with name+slug+price+images[0]

Admin procedures (all use `adminProcedure`):
- `create`: full Zod schema validation, return created product
- `update`: partial update, find by id
- `softDelete`: set isPublished: false, deletedAt: new Date()
- `hardDelete`: delete from DB + call Cloudinary delete for each image
- `updateVariantStock`: { productId, color, size, newStock }
- `bulkAction`: { ids: string[], action: 'publish'|'unpublish'|'delete' }
- `getAdminList`: all products (including unpublished), richer filter options

### QUALITY REQUIREMENTS
- Zod v4 import: `import { z } from 'zod/v4'`
- Mongoose 9: use `Model.findOne()` (returns null not undefined)
- Use `.lean<T>()` with generic type for type-safe read queries
- MongoDB: always add `.collation({ locale: 'vi' })` for Vietnamese text sorting
```

---

## PROMPT 3.2 — Admin Product CRUD UI

```
Context: Product tRPC router complete. Admin layout with shadcn + Tailwind v4 in place.
Phase 3 Step 2: Admin product management pages.

## TASK: Build admin product management UI

### 1. Products List Page (`src/app/(admin)/admin/products/page.tsx`)
Server Component: fetches initial data via tRPC server-side caller.

Data table (using shadcn Table):
- Columns: checkbox, thumbnail (40x40 next/image), name+slug (stacked), category, 
  price/salePrice, totalStock (color: red<5, amber<20, green>=20), 
  status (Published/Draft badge), actions (⋯ dropdown: Edit, View, Delete)
- Toolbar: search input (debounced 400ms), category filter, status filter, "Add Product" button
- Bulk action bar (appears on row selection): Publish, Unpublish, Delete
- Pagination: prev/next + page numbers, page size selector

### 2. Product Form (`src/app/(admin)/admin/products/new/page.tsx` and `[id]/edit/page.tsx`)
Client Component layout: main content (2/3) + sticky sidebar (1/3)

**Basic Info section:**
- Name → auto-slugify preview (editable)
- Category select (from trpc.product.getCategories)
- Tags: chip input (type + Enter to add)
- Price (VND — format with `toLocaleString('vi-VN')`) and Sale Price

**Images section:**
- Drag-and-drop uploader using `next-cloudinary` CldUploadWidget
- Preview grid with reorder (drag-to-sort)
- First image = thumbnail, indicated with star badge
- Delete button per image (calls Cloudinary delete via `/api/cloudinary/delete` route)

**Description section:**
- Rich text using `@uiw/react-md-editor` (SSR: dynamic import with { ssr: false })
- Tab: Edit / Preview

**Variants section:**
Dynamic builder:
```
[+ Add Color]
  ↳ Color name: "Đen" | Color picker (hex) | [Remove color]
    [+ Add Size]
    ↳ Size: [XS|S|M|L|XL|XXL dropdown] | Stock: [number] | [Remove]
```
Show running total stock per color and overall.

**SEO section:**
- SEO Title (max 60 chars with counter)
- SEO Description (max 160 chars with counter)

**Sidebar:**
- Product status toggle (Published / Draft)
- Featured toggle
- Save Draft / Publish buttons
- Delete button (confirmation dialog)
- Link "View on storefront" (only on edit + published)

### 3. Next.js 16 note on Server Actions for form submission
Use react-hook-form for UI + call tRPC mutation on submit (NOT Server Actions for this form
due to complexity). Show loading state on buttons.

### QUALITY REQUIREMENTS
- Unsaved changes → beforeunload warning (useBeforeUnload hook)
- Auto-save draft to localStorage every 60s
- Upload progress bar for images
```

---

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

# ═══════════════════════════════════════════
# PHASE 4 — CART, CHECKOUT & ORDER FLOW
# ═══════════════════════════════════════════

## PROMPT 4.1 — Cart, Order & Coupon Models + tRPC Routers

```
Context: Phase 1-3 complete. Products in DB. Auth working. Mongoose 9.
Phase 4: Shopping flow backend.

## TASK: Implement cart, order, and coupon backend

### 1. Cart Model (`src/server/db/models/Cart.ts`)
One cart per user (user field with unique index).
Items: product (ref), productName (snapshot), productImage (snapshot), color, size,
quantity (min:1), priceAtAdd (snapshot of price at time of adding).
Timestamps.

### 2. Coupon Model (`src/server/db/models/Coupon.ts`)
Fields: code (unique, uppercase, index), type ('percentage'|'fixed'),
value (Number), minOrderValue (Number, default 0), maxDiscount (Number?),
usageLimit (Number), usedCount (Number, default 0),
usedBy [ref User], expiresAt (Date), isActive (Boolean, default true), timestamps.

### 3. Order Model (`src/server/db/models/Order.ts`)
Auto-generate orderCode: `'FS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase()`

Full status enum: 'pending'|'confirmed'|'processing'|'shipping'|'delivered'|'cancelled'|'refunded'
Payment status: 'unpaid'|'paid'|'refunded'
Payment method: 'vnpay'|'cod'

Timeline array: [{ status, message, timestamp, updatedBy }]

Pre-save hook: when `status` changes, auto-push to timeline array.

Indexes: customer+status, paymentStatus, createdAt, orderCode (unique).

### 4. Cart tRPC Router (`src/server/trpc/routers/cart.ts`)
All procedures: `protectedProcedure`

- `get`: findOneAndUpdate (upsert) cart by userId, populate product details for each item.
  Cross-check each item against current product stock — mark items as `outOfStock: true` if stock=0.

- `addItem`: find product+variant+size, validate stock >= requested qty.
  If item already exists in cart: increment quantity. Return updated cart.

- `updateQuantity`: validate new qty against stock, update.

- `removeItem`: pull from items array.

- `clear`: set items: [].

- `syncGuestCart`: input { guestItems: { productId, color, size, quantity }[] }
  Merge guest cart into DB cart on user login. Validate each item's stock.

### 5. Order tRPC Router (`src/server/trpc/routers/order.ts`)

`create` (protected):
```
Input: { shippingAddressId, paymentMethod, couponCode? }
1. Get user's cart from DB, validate not empty
2. Re-validate ALL item stocks (race condition protection)
3. Apply coupon if provided (validate + calculate discount)
4. Calculate: subtotal, shippingFee (from Settings), discount, total
5. MongoDB TRANSACTION:
   a. Create Order document
   b. For each item: Product.findOneAndUpdate with $inc to decrement stock (atomic)
      - If stock goes negative: abort transaction, throw TRPCError
   c. Coupon.findOneAndUpdate: $inc usedCount, $push usedBy (if coupon)
   d. Cart.findOneAndUpdate: set items: []
6. Return { orderId, orderCode, paymentMethod }
   (caller redirects based on paymentMethod)
```

- `getMyOrders` (protected): paginated, filter by status, populate item snapshots
- `getById` (protected): verify session.user.id === order.customer OR role === 'admin'
- `cancel` (protected): only if status === 'pending'.
  Transaction: set status='cancelled', restore stock for each item, update coupon usedCount.
- `getAll` (admin): filter by status/paymentStatus/dateRange/search orderCode or email
- `updateStatus` (admin): validate allowed transitions:
  pending→confirmed→processing→shipping→delivered
  Any status→cancelled (admin can cancel any)
  delivered→refunded
  Emit Socket.io event (Phase 6 wires this up — stub the call for now)
- `getStats` (admin): aggregate pipeline for revenue/orders by time period

### Coupon procedures:
- `validate` (protected): check code, expiry, usageLimit, minOrderValue, not used by this user.
  Return { isValid, discount, message }
- `create` (admin), `getAll` (admin), `toggle` (admin): activate/deactivate

### QUALITY REQUIREMENTS
- MongoDB transactions: use `mongoose.startSession()` + `session.withTransaction()`
- Mongoose 9: all async, no callbacks
- Stock decrement MUST be atomic: use `findOneAndUpdate` with `$inc` + `{ new: true }` to check final value
- All money: integers in VND (no floats, no decimals)
```

---

## PROMPT 4.2 — Cart & Checkout UI

```
Context: Cart/Order/Coupon tRPC routers done. Phase 4 Step 2.

## TASK: Build cart page, checkout flow, order history

### 1. Cart Page (`src/app/(store)/cart/page.tsx`)
Two-column desktop layout (60/40):

Left — Cart Items:
- Each item: next/image thumbnail, name, color+size badge, unit price
- Quantity stepper with optimistic update (useOptimistic from React 19) — debounced mutation
- Remove button with optimistic removal
- "Out of stock" warning overlay if item.outOfStock === true
- Empty state: illustration + "Khám phá sản phẩm" button

Right — Order Summary (sticky top-8):
- Subtotal
- Coupon input: text + "Áp dụng" button → `trpc.coupon.validate` → show green discount line or red error
- Shipping: "Tính khi thanh toán" until address known
- Total (bold, large)
- "Tiến hành thanh toán" button (disabled if cart empty or has out-of-stock items)
- Trust badges: lock icon "Thanh toán bảo mật", return icon "Đổi trả dễ dàng"

### 2. Mini Cart Drawer (`src/components/store/MiniCart.tsx`)
- shadcn Sheet, slides from right
- Condensed item list (image + name + price + remove)
- Subtotal + "Xem giỏ hàng" + "Thanh toán" CTA buttons
- Opened via `useUIStore.setMiniCartOpen(true)` from navbar cart icon

### 3. Checkout Page (`src/app/(store)/checkout/page.tsx`)
Protected route (server-side auth check via `await auth()`).
Multi-step form with progress indicator (shadcn Progress):

**Step 1 — Địa chỉ giao hàng:**
- Radio list of user's saved addresses (populated from trpc.user.getProfile)
- "Dùng địa chỉ mới" → inline AddressForm
- Delivery estimate based on province (same province: 1-2 ngày, other: 3-5 ngày)

**Step 2 — Thanh toán:**
- Order summary: items list (read-only), price breakdown
- Payment method: VNPay card (with bank card graphic) | COD (cash icon)
- Coupon (if not already applied from cart page)
- Terms checkbox
- "Đặt hàng" button:
  - COD: call `trpc.order.create` → redirect `/orders/{id}/success`
  - VNPay: call `trpc.order.create` → then `POST /api/vnpay/create-payment` with orderId → redirect to vnpayUrl

### 4. Order Success/Failure Pages
`/orders/[id]/success`: animated checkmark (CSS), order code, summary, two CTAs
`/orders/[id]/failed`: X animation, reason from `?reason=` param, "Thử lại" + "Thanh toán COD" buttons

### 5. Order History (`src/app/(store)/orders/page.tsx`)
- Order cards: code, date, status badge, item count, total
- Expandable accordion: items, address, payment info, status timeline (vertical stepper)
- "Hủy đơn" button (if pending) with confirmation dialog
- "Đặt lại" button → add items back to cart (validates stock)
- "Đánh giá" button per item if delivered + not reviewed

### REACT 19 NOTE: Use `useOptimistic` for cart operations:
```typescript
const [optimisticItems, updateOptimistic] = useOptimistic(
  cart.items,
  (state, { productId, newQty }) =>
    state.map(item => item.productId === productId ? { ...item, quantity: newQty } : item)
)
```

### QUALITY REQUIREMENTS
- Double-submit prevention: disable "Đặt hàng" button after first click, show spinner
- Form state persists across step navigation (use Zustand store for checkout flow)
- VNPay redirect handled client-side with router.push(vnpayUrl) for external redirect
```

---

---

# ═══════════════════════════════════════════
# PHASE 5 — ADMIN DASHBOARD
# ═══════════════════════════════════════════

## PROMPT 5.1 — Dashboard Overview & Order Management

```
Context: Full backend (Phase 1-4) complete. Admin layout ready. Next.js 16.
Phase 5 Step 1: Admin overview and order management.

## TASK: Build admin overview dashboard and order management

### 1. Dashboard Overview (`src/app/(admin)/admin/page.tsx`)
Server Component fetching from multiple tRPC procedures:
```typescript
export default async function AdminDashboard() {
  // Server-side data fetching using tRPC server caller
  const [stats, recentOrders, topProducts] = await Promise.all([
    caller.order.getStats({ period: 'month' }),
    caller.order.getAll({ limit: 10, page: 1 }),
    caller.product.getBestSellers({ limit: 5 })
  ])
  // Pass to Client Components for charts
}
```

**4 Stats Cards:**
- Revenue this month (với % thay đổi so với tháng trước + mũi tên lên/xuống)
- Total orders this month (+ pending orders count badge)
- New customers this week
- Low stock products count (products with totalStock < 10)

**Charts (Client Components, Recharts + React 19):**
- Line chart: revenue last 30 days (with ResponsiveContainer)
- Donut chart: orders by status

**Tables:**
- Recent orders (last 10): orderCode, customer, items count, total, status badge, date
- Top products (last 30 days): rank, image, name, sold, revenue

**Real-time placeholder:** Notification bell with badge (count from Socket.io — Phase 6 activates)

### 2. Order Management (`src/app/(admin)/admin/orders/page.tsx`)
Client Component with tRPC pagination:

**Filter toolbar:**
- Debounced search (400ms) by orderCode or customer email
- Multi-select status filter (shadcn Command + Popover)
- Date range picker (shadcn Calendar)
- Export CSV button (client-side using Papa Parse from trpc.order.getAll)

**Orders data table:**
- Columns: select, orderCode (monospace), customer name, items #, total (formatted VND),
  payment method badge, payment status badge, order status badge, date, actions (⋯)
- Sortable columns
- Row click → open order detail Sheet

**Order Detail Sheet (right side, 480px wide):**
- Header: orderCode + status badge
- Customer: name + email + phone (click-to-copy)
- Shipping address block
- Items list: image + name + variant + qty × price = line total
- Price breakdown: subtotal, shipping, discount, total
- Payment: method + VNPay transaction ID (if applicable) + payment status
- Timeline: vertical stepper with timestamps
- Status Update dropdown + optional note + "Cập nhật" button
  → calls trpc.order.updateStatus → refetch order + show toast

### 3. Customer Management (`src/app/(admin)/admin/customers/page.tsx`)
Table: avatar, name, email, phone, orders count, total spent, join date, status, actions.
Click row → Customer Detail page:
- Profile summary card
- Stats: total orders, total spent, avg order value, last order date
- Full order history table
- Ban/Unban button with confirmation dialog

### QUALITY REQUIREMENTS
- Server-side pagination — data table never fetches all records
- Use tRPC `useInfiniteQuery` for the orders table (load more on scroll)
- All VND amounts formatted as: `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)`
```

---

## PROMPT 5.2 — Admin Analytics & Settings

```
Context: Admin dashboard core complete. Phase 5 Step 2.

## TASK: Analytics page and store settings

### 1. Analytics Page (`src/app/(admin)/admin/analytics/page.tsx`)

Date range control (top): This Week / Month / 3 Months / Custom.
All charts use Recharts with `ResponsiveContainer`.

Revenue:
- Area chart: daily revenue + dashed comparison line for previous period
- Stacked bar: revenue by category
- KPI: average order value over time

Product performance:
- Table: product name | sold | revenue | stock remaining (color-coded)
- Donut: inventory health (well-stocked / low / out of stock)

Customer:
- Bar chart: new vs returning per week
- Table: top 10 customers by lifetime value

Order fulfillment:
- KPI card: average days from confirmed → shipped
- Cancellation rate over time (line chart)

### 2. Settings Page (`src/app/(admin)/admin/settings/page.tsx`)
Client Component with tabs:

**Store Info tab:**
- Store name, description, contact email, phone
- Logo upload (CldUploadWidget from next-cloudinary)
- Social links (Facebook, Instagram, TikTok, Shopee, Lazada)
- Save → `trpc.settings.update`

**Shipping tab:**
- Radio: Flat rate vs Province-based
- Flat rate: number input in VND
- Free shipping threshold input
- Province table (63 rows): inline editable fee per province

**Coupons tab:**
- Create coupon form: code (auto-uppercase), type, value, min order, usage limit, expiry date
- Coupons table: code | type | value | used/limit | expires | active toggle | delete

**Email Templates tab:**
- List: Order Confirmed, Order Shipped, Order Delivered, Password Reset
- Each: preview modal, edit with template variables hint ({{customerName}}, {{orderCode}})

**Payment tab:**
- VNPay TmnCode display (masked ****), sandbox/production toggle

### 3. Settings Model + tRPC
- `src/server/db/models/Settings.ts`: singleton document pattern (findOneAndUpdate with upsert:true)
- `src/server/trpc/routers/settings.ts`: `getSettings` (public), `updateSettings` (admin)

### QUALITY REQUIREMENTS
- Settings saved to MongoDB and cached in tRPC
- Input changes marked as "unsaved" visually (asterisk in tab name) until saved
- Coupon code auto-uppercased on input with `onChange` handler
```

---

---

# ═══════════════════════════════════════════
# PHASE 6 — REAL-TIME (SOCKET.IO 4.8.3)
# ═══════════════════════════════════════════

## PROMPT 6.1 — Socket.io Server Setup & Order Notifications

```
Context: Full project (Phase 1-5) complete. Now adding real-time.
Socket.io 4.8.3 — latest stable.

## ARCHITECTURE: Custom Next.js server for Socket.io
Next.js 16 serverless mode doesn't support Socket.io natively. Use a custom server.

### 1. Custom HTTP Server (`server.ts` at project root)
```typescript
import { createServer } from 'http'
import next from 'next'
import { Server as SocketServer } from 'socket.io'
import { initSocketServer } from './src/server/socket'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res))
  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL, methods: ['GET', 'POST'] },
    // Socket.io 4.8.3 options:
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 }, // recover missed events
  })
  initSocketServer(io)
  // Attach io to global for tRPC access
  ;(global as any).__io = io
  httpServer.listen(3000, () => console.log('Server ready on http://localhost:3000'))
})
```

Update `package.json` scripts:
```json
"dev": "ts-node --esm server.ts",
"build": "next build",
"start": "NODE_ENV=production ts-node --esm server.ts"
```

### 2. Socket.io Server Module (`src/server/socket/index.ts`)

**TypeScript event map:**
```typescript
interface ServerToClientEvents {
  'order:new': (data: { orderId: string; orderCode: string; customerName: string; total: number; createdAt: string }) => void
  'order:status_updated': (data: { orderId: string; orderCode: string; newStatus: string; message: string }) => void
  'order:cancelled': (data: { orderId: string; orderCode: string; customerName: string }) => void
  'chat:receive': (msg: IChatMessage) => void
  'chat:typing': (data: { sessionId: string; isTyping: boolean; senderRole: string }) => void
  'chat:new_message': (data: { sessionId: string; preview: string; customerName: string }) => void
  'inventory:low': (data: { productId: string; productName: string; color: string; size: string; stock: number }) => void
}
interface ClientToServerEvents {
  'chat:join_session': (sessionId: string) => void
  'chat:send': (data: { sessionId: string; content: string; type: 'text'|'image' }) => void
  'chat:typing': (data: { sessionId: string; isTyping: boolean }) => void
}
interface SocketData { userId: string; role: 'customer'|'admin' }
```

**Auth middleware (JWT verification):**
```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('Unauthorized'))
  // Verify NextAuth JWT using same secret
  // Attach decoded { userId, role } to socket.data
  next()
})
```

**Connection handler:** admin → join 'admin_room', customer → join `user_${userId}`

### 3. tRPC Context: attach io
```typescript
// src/server/trpc/context.ts
import { type Server } from 'socket.io'
export const createContext = async () => {
  const session = await auth()
  const io: Server | undefined = (global as any).__io
  return { session, io }
}
```

In Order router's `create` procedure (after transaction commits):
```typescript
ctx.io?.to('admin_room').emit('order:new', { orderId, orderCode, customerName, total, createdAt })
```

In Order router's `updateStatus`:
```typescript
ctx.io?.to(`user_${order.customer}`).emit('order:status_updated', { orderId, orderCode, newStatus, message })
```

### 4. Socket.io Client Provider (`src/components/providers/SocketProvider.tsx`)
```typescript
'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

const SocketContext = createContext<Socket | null>(null)
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    if (!session?.user?.id) return
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: session.user.id }, // Pass session token for server-side auth
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    return () => { socketRef.current?.disconnect() }
  }, [session])
  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>
}
export const useSocket = () => useContext(SocketContext)
```

Add SocketProvider to root layout (inside SessionProvider).

### 5. Customer Notifications Hook (`src/hooks/useOrderNotifications.ts`)
Listen to `order:status_updated` → show sonner toast with appropriate message/icon.
Update tRPC query cache: `utils.order.getMyOrders.invalidate()`.

### 6. Admin Notification System
In admin layout:
- Listen to `order:new` → sonner toast + play chime (Web Audio API short beep) + increment bell badge
- Notification dropdown: list last 10 events from state, "Đánh dấu đã đọc" button
- Zustand store: `useNotificationStore` { notifications[], unreadCount, addNotification, markAllRead }

### QUALITY REQUIREMENTS
- Socket.io 4.8.3: leverage `connectionStateRecovery` for missed events during brief disconnects
- TypeScript: full typed event maps for both ServerToClientEvents and ClientToServerEvents
- Graceful: if `ctx.io` is undefined, log warning but don't crash tRPC procedure
```

---

## PROMPT 6.2 — Live Chat Feature

```
Context: Socket.io server running. Order notifications working. Phase 6 Step 2.

## TASK: Build live chat between customers and admin

### 1. ChatMessage Model (`src/server/db/models/ChatMessage.ts`)
```typescript
{
  sessionId: String (index),         // unique per conversation
  sender: ObjectId ref User,
  senderRole: 'customer' | 'admin',
  content: String,
  type: 'text' | 'image' | 'order_link',
  metadata: {                        // for type: 'order_link'
    orderId: String,
    orderCode: String,
    orderStatus: String,
    orderTotal: Number
  }?,
  isRead: Boolean (default false),
  createdAt: Date (index)
}
```

### 2. Chat tRPC Router (`src/server/trpc/routers/chat.ts`)
- `getOrCreateSession` (protected): find ChatMessage where sessionId based on userId, or create new sessionId (`chat_${userId}_${Date.now()}`)
- `getMessages` (protected): paginated, 50 per page, sorted newest first (reverse display)
- `getSessions` (admin): all unique sessionIds, last message, unread count, customer info (populated)
- `markRead` (admin): update all messages in session with isRead: false → true
- `sendMessage` (protected): save to DB. Socket.io delivery happens separately. Return saved message.

### 3. Chat Socket Events — add to `src/server/socket/index.ts`
```typescript
socket.on('chat:join_session', (sessionId: string) => {
  socket.join(`chat_${sessionId}`)
})

socket.on('chat:send', async (data: { sessionId: string; content: string; type: string }) => {
  const msg = await ChatMessage.create({
    sessionId: data.sessionId,
    sender: socket.data.userId,
    senderRole: socket.data.role,
    content: data.content,
    type: data.type,
    isRead: false
  })
  io.to(`chat_${data.sessionId}`).emit('chat:receive', msg)
  if (socket.data.role === 'customer') {
    const user = await User.findById(socket.data.userId).select('name').lean()
    io.to('admin_room').emit('chat:new_message', {
      sessionId: data.sessionId,
      preview: data.content.slice(0, 50),
      customerName: user?.name ?? 'Khách'
    })
  }
})

socket.on('chat:typing', ({ sessionId, isTyping }: { sessionId: string; isTyping: boolean }) => {
  socket.to(`chat_${sessionId}`).emit('chat:typing', {
    sessionId, isTyping, senderRole: socket.data.role
  })
})
```

### 4. Customer Chat Widget (`src/components/store/ChatWidget.tsx`)
Client Component, fixed bottom-right:
- Collapsed: circular button (chat icon + unread badge)
- Expanded: card 320×460px
- Unauthenticated: "Đăng nhập để chat" prompt
- Authenticated:
  - Header: "Hỗ trợ khách hàng" + green online dot + minimize button
  - Message thread: scrollable, own messages right (gold bg), admin messages left (gray bg)
  - Typing indicator (3 animated dots) when admin typing
  - Image in bottom: text input + send button + optional image upload (Cloudinary)
  - Auto-scroll to bottom on new message using `useRef` + `scrollIntoView`

onMount: `socket.emit('chat:join_session', sessionId)` + load message history.

### 5. Admin Chat Page (`src/app/(admin)/admin/chat/page.tsx`)
Two-panel Client Component:

Left panel (320px):
- Search input (customer name)
- Session list: avatar, name, last message preview (truncated), timestamp, unread count badge (red)
- Active session: highlighted background
- New message via Socket.io: move session to top + increment unread badge
- "Chỉ hiện chưa đọc" toggle

Right panel:
- Header: customer name + email + "Xem hồ sơ" link
- Customer context (collapsible sidebar, 200px): last 3 orders with status
- Message history (infinite scroll upward: load 50 older messages on scroll to top)
- Admin reply input + "Gửi" button
- "Quick Reply" buttons: predefined phrases
- "Gửi thông tin đơn hàng" button → Dialog: select from customer's orders → sends as type 'order_link'

Order link card appearance in chat:
```
┌─────────────────────────────┐
│ 📦 Đơn hàng #FS1A2B3C       │
│ Trạng thái: Đang giao hàng  │
│ Tổng: 450,000đ              │
│ [Xem chi tiết →]            │
└─────────────────────────────┘
```

### 6. Unread badge in Admin Sidebar
Listen to `chat:new_message` in admin layout → increment `useNotificationStore.chatUnread`.
Display badge on "Chat" sidebar item.

### QUALITY REQUIREMENTS
- Messages stored in MongoDB (Socket.io is transport only)
- Load first 50 messages on open, load older on scroll (useInfiniteQuery pattern)
- Mark messages as read when admin opens the session
- Timestamps: use `date-fns` formatDistanceToNow (e.g. "5 phút trước"), update every 60s
```

---

---

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

---

---

## 📋 CONTEXT BLOCK — Paste vào đầu mỗi session mới

```
PROJECT CONTEXT (Fashion E-Commerce — March 2026):
Stack: Next.js 16.2 | React 19.2 | TypeScript 5.8 | tRPC 11.13.4 | MongoDB + Mongoose 9.3.1
       Socket.io 4.8.3 | NextAuth v5 beta | Zod v4 | Zustand v5.0.12 | shadcn 4.1.0 | Tailwind v4

KEY BREAKING CHANGES IN THIS STACK:
- Next.js 16: params/searchParams MUST be awaited (`await props.params`)
- Zustand 5: named import `import { create } from 'zustand'` (no default export)
- Mongoose 9: async/await only (no callbacks), strictQuery=true
- Zod 4: `import { z } from 'zod/v4'`
- Tailwind 4: `@import "tailwindcss"` in CSS, use @theme{} block, no tailwind.config.js
- NextAuth v5: config in auth.ts root, exports { handlers, auth, signIn, signOut }
- React 19: `useOptimistic` hook, `use()` for promise unwrapping

Completed phases: [ĐIỀN VÀO ĐÂY — e.g., Phase 1-3]
Current task: [ĐIỀN VÀO ĐÂY — e.g., Building cart tRPC router - Phase 4.1]
```

---

## ⚡ MẸO XỬ LÝ LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `params is not awaited` | Next.js 16 breaking change | Thêm `await` trước `props.params` |
| `create is not a function` | Zustand 5 import sai | `import { create } from 'zustand'` |
| `Cannot read property of undefined` trên Mongoose | Callback API bị xóa | Dùng async/await |
| tRPC type error | TypeScript < 5.7.2 | Upgrade TypeScript |
| `z.string() is not a function` | Zod v4 import sai | `import { z } from 'zod/v4'` |
| Socket.io không kết nối | Serverless mode | Cần custom server.ts |
| VNPay signature mismatch | Encode/decode sai | Hash TRƯỚC khi encode URL |
