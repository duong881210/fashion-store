# Fashion Store E-Commerce Storefront

A high-performance, premium e-commerce storefront for fashion retail built with Next.js 16, Mongoose (MongoDB), tRPC, and Socket.io. Features include an interactive customer experience, dynamic admin dashboard, VNPay payment gateway integration, transaction email notifications, secure password resets, and real-time socket communications.

---

## 🛠️ Prerequisites

Make sure you have the following installed on your system:
- **Node.js**: `v22.x` (LTS) or higher
- **MongoDB**: `v7.0` or higher (local instance or MongoDB Atlas cluster)

---

## 🚀 Installation & Getting Started

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file at the root of the project. See the **Environment Variables Guide** below for keys.

3. **Seed the database**:
   Run the database seed script to populate default settings, coupon rules, categories, products with stock variants, administrator credentials, customer users, and random historical orders:
   ```bash
   npm run seed
   ```
   * **Default Admin Account**: `admin@fashionstore.vn` / `Admin@123456`
   * **Default Customer Accounts**: `customer1@gmail.com` to `customer10@gmail.com` (password: `password123`)

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   The app will run on [http://localhost:3000](http://localhost:3000).

---

## 📝 Environment Variables Guide

Here is a template of variables to add to your `.env.local`:

```ini
# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name

# NextAuth Configurations
NEXTAUTH_SECRET=your_32_character_hex_secret
NEXTAUTH_URL=http://localhost:3000

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# VNPay Sandbox Configuration
# Register sandbox credentials at: https://sandbox.vnpayment.vn/
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/vnpay/return

# Cloudinary Storage Config
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name

# Resend API Key for Email Notifications
RESEND_API_KEY=re_your_api_key
```

---

## 💳 VNPay Sandbox Integration

### Sandbox Credentials
- **VNPay Sandbox URL**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **Test Card Details (NAPAS)**:
  - **Card Number**: `9704198526191432198`
  - **Card Holder**: `NGUYEN VAN A`
  - **Issue Date**: `07/15`
  - **OTP**: `123456`

### Core Flow & IPN
- **URL redirection**: Redirection signatures are verified server-side on the `/api/vnpay/return` route.
- **Fraud Prevention**: The backend verifies `vnp_Amount / 100` against the local database order total.
- **Server-to-Server IPN Callback**: The system implements an idempotent IPN endpoint at `/api/vnpay/ipn` to securely process payment confirmations, outputting the exact response schema expected by VNPay (`{ RspCode: '00', Message: 'Confirm Success' }`).
- **Audit Logging**: All transactions are securely audited in the `VnpayLog` database model.

---

## 🐳 Docker Deployment

To spin up the application along with a dedicated MongoDB instance using Docker:

1. **Verify your Docker environment**.
2. **Build and start the containers**:
   ```bash
   docker compose up --build -d
   ```
3. The storefront will compile and run on port `3000`. Database data will persist in a named volume (`mongodb_data`).

---

## 🖥️ VPS Production Deployment (PM2)

To deploy on a standard Linux VPS manually using PM2:

1. Install Node.js v22 and MongoDB.
2. Build the Next.js production bundles:
   ```bash
   npm run build
   ```
3. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
4. Start the custom socket server:
   ```bash
   pm2 start npm --name "fashion-store" -- run start
   ```

---

## ⚡ Architecture Highlights

- **SEO & Search Engines**: Implements Next.js dynamic metadata generation, semantic page hierarchies, dynamic sitemap compilation (`sitemap.xml`), robots config (`robots.txt`), and structured JSON-LD schemas.
- **Cache Components**: Integrates experimental Next.js 16 `'use cache'` queries for homepage products, with smart cache clearing (`revalidateTag`) during admin product updates and customer checkouts.
- **Micro-Animations & Skeletons**: Beautiful CSS micro-animations, loading skeletons, and interactive recovery states on error boundaries.
- **Security Protections**: XSS input sanitization (`isomorphic-dompurify`) on HTML product details, clickjacking headers, and sliding-window rate limiters (5 req/min on Auth, 20 req/min on payments).
