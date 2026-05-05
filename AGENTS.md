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