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
