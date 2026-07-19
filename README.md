# FASHION STORE - HỆ THỐNG CỬA HÀNG THỜI TRANG TRỰC TUYẾN
## Đồ án Tốt nghiệp (DATN)

Đây là mã nguồn của hệ thống **Fashion Store** - một nền tảng thương mại điện tử chuyên về thời trang cao cấp, được tích hợp các công nghệ hiện đại bao gồm thanh toán trực tuyến (VNPAY), hệ thống chat và thông báo thời gian thực (Socket.io), cùng với trợ lý tư vấn thời trang thông minh tích hợp trí tuệ nhân tạo (Gemini AI).

Dự án sử dụng mô hình **Next.js 16 (App Router)** và **React 19** cho cả Client và Server (thông qua Custom Server sử dụng Express/Socket.io), kết hợp với hệ thống API type-safe **tRPC**.

---

## 🚀 Tính năng nổi bật

### 1. Phía Khách hàng (Storefront)
*   **Trang chủ & Danh mục**: Hiển thị banner khuyến mãi, danh mục sản phẩm nổi bật, sản phẩm mới và sản phẩm đang giảm giá.
*   **Tìm kiếm & Bộ lọc**: Tìm kiếm sản phẩm thông minh bằng tiếng Việt, bộ lọc nâng cao theo danh mục, khoảng giá, màu sắc và kích thước (size).
*   **Giỏ hàng & Thanh toán**:
    *   Giỏ hàng động (sử dụng trạng thái phía Client với Zustand).
    *   Tích hợp cổng thanh toán trực tuyến **VNPAY** và **PayOS**.
    *   Hỗ trợ mã giảm giá (Coupon).
*   **Quản lý tài khoản cá nhân**:
    *   Đăng ký, Đăng nhập (hỗ trợ tài khoản thường và **Google OAuth 2.0** qua NextAuth v5).
    *   Sổ địa chỉ giao hàng tiện lợi (hỗ trợ thiết lập địa chỉ mặc định).
    *   Danh sách sản phẩm yêu thích (Wishlist).
    *   Theo dõi trạng thái đơn hàng thời gian thực.
    *   Viết đánh giá, chấm điểm sao kèm bình luận cho sản phẩm đã mua.
*   **Trợ lý ảo AI (Chatbot Gemini)**:
    *   Tích hợp mô hình `gemini-2.5-flash`.
    *   Tự động truy xuất lịch sử mua hàng, thông tin khách hàng và danh sách sản phẩm để tư vấn cá nhân hóa (size, màu, gợi ý thời trang phù hợp).
    *   Khả năng tự động bàn giao cho nhân viên tư vấn thật (Human Agent) khi gặp các yêu cầu phức tạp ngoài phạm vi hỗ trợ.
*   **Chat Hỗ trợ & Thông báo**:
    *   Hệ thống thông báo thời gian thực (real-time notification) khi đơn hàng cập nhật trạng thái.
    *   Kênh chat trực tiếp với nhân viên hỗ trợ thông qua Socket.io.

### 2. Phía Quản trị (Admin Dashboard)
*   **Thống kê & Báo cáo (Analytics)**: Biểu đồ trực quan (Recharts) hiển thị doanh thu, số đơn hàng, tỷ lệ chuyển đổi, và danh sách sản phẩm bán chạy theo mốc thời gian (hôm nay, tuần này, tháng này, năm nay).
*   **Quản lý Sản phẩm (Products)**:
    *   Thêm mới, sửa, xóa sản phẩm, tải ảnh lên Cloudinary.
    *   Cấu hình chi tiết các biến thể sản phẩm (Màu sắc, mã màu HEX, kích thước, số lượng tồn kho của từng size).
*   **Quản lý Đơn hàng (Orders)**: Xem danh sách, chi tiết đơn hàng và cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao hàng, Đã giao hàng, Đã hủy).
*   **Quản lý Khách hàng (Customers)**: Quản lý thông tin người dùng, phân quyền (Customer / Admin) và trạng thái hoạt động.
*   **Quản lý Mã giảm giá (Coupons)**: Tạo mã giảm giá theo số tiền cố định hoặc tỷ lệ phần trăm, giới hạn số lần sử dụng và ngày hết hạn.
*   **Quản lý Chat hỗ trợ (Admin Chat)**: Giao diện chat hỗ trợ khách hàng theo thời gian thực (hỗ trợ nhiều phòng chat đồng thời).
*   **Cài đặt hệ thống (Settings)**:
    *   Cài đặt thông tin cửa hàng (Tên, địa chỉ, hotline, logo, mạng xã hội).
    *   Cài đặt chính sách giao hàng (phí ship cố định, ngưỡng freeship).
    *   Cấu hình khóa API và System Prompt cho Trợ lý ảo AI.

---

## 🛠️ Công nghệ sử dụng

*   **Framework**: Next.js 16.2.1 (App Router), React 19.2.4
*   **Styling**: Tailwind CSS v4, Radix UI & Shadcn UI components
*   **Database**: MongoDB với Mongoose ODM
*   **Xác thực (Authentication)**: NextAuth.js v5 (Auth.js) hỗ trợ Email/Password và Google Provider
*   **API Layer**: tRPC v11 (API type-safe từ đầu-đến-cuối giữa client và server)
*   **Real-time**: Socket.io v4 & Socket.io-client
*   **State Management**: Zustand
*   **Upload Ảnh**: Cloudinary API & Next-Cloudinary
*   **Gửi Email**: Resend API
*   **Thanh toán**: VNPAY SDK 
*   **AI Chatbot**: Gemini API (`gemini-2.5-flash`)
*   **Công cụ vẽ sơ đồ & Thiết kế**: Python matplotlib/graphviz (cho các scripts thiết kế báo cáo)

---

## 📁 Cấu trúc thư mục dự án

```text
fashion-store/
├── public/                 # Các tài nguyên tĩnh (hình ảnh mặc định, logo, v.v.)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts và API routes)
│   │   ├── (admin)/        # Route group dành cho trang quản trị (Admin panel)
│   │   ├── (store)/        # Route group dành cho giao diện cửa hàng (Customer storefront)
│   │   ├── actions/        # Server Actions dùng cho Next.js
│   │   └── api/            # API endpoints (VNPAY return, NextAuth handler)
│   ├── components/         # Các Component giao diện dùng chung (UI components)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Cấu hình thư viện dùng chung (cloudinary, utils)
│   ├── server/             # Code xử lý phía Server
│   │   ├── db/             # Kết nối MongoDB, định nghĩa Mongoose Models
│   │   ├── socket/         # Khởi tạo và xử lý sự kiện Socket.io
│   │   └── trpc/           # Định nghĩa tRPC router và context
│   ├── stores/             # Zustand state stores (giỏ hàng, thông báo...)
│   └── types/              # Định nghĩa kiểu dữ liệu TypeScript dùng chung
├── scripts/                # Các file scripts hỗ trợ dự án
│   ├── seed.ts             # Script nạp dữ liệu mẫu (sản phẩm, tài khoản, cài đặt)
│   ├── downloadImages.ts   # Script tự động tải ảnh demo từ Unsplash về máy
│   ├── makeAdmin.ts        # Script phân quyền Admin nhanh cho tài khoản qua CLI
│   └── draw_*.py           # Các kịch bản Python sinh sơ đồ (ERD, Socket) phục vụ viết báo cáo
├── server.ts               # File khởi chạy Custom HTTP & Socket.io Server bằng Next.js
└── next.config.ts          # Cấu hình dự án Next.js
```

---

## ⚙️ Hướng dẫn cài đặt và Chạy thử nghiệm

### 1. Yêu cầu hệ thống
*   **Node.js**: Phiên bản 20 hoặc 22.
*   **MongoDB**: Cơ sở dữ liệu MongoDB Local hoặc MongoDB Atlas (Cloud).
*   **Tài khoản dịch vụ (tùy chọn)**:
    *   Tài khoản Cloudinary (để upload ảnh sản phẩm).
    *   Khóa Resend API (để gửi email thông báo đơn hàng).
    *   Google Cloud Console Client ID/Secret (đăng nhập Google OAuth).
    *   Tài khoản VNPAY Test/Sandbox (để test thanh toán).
    *   Khóa Gemini API (để sử dụng Trợ lý ảo AI).

### 2. Thiết lập biến môi trường
Tạo tệp `.env.local` ở thư mục gốc `/fashion-store` và điền đầy đủ các thông tin cấu hình tương tự như sau:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/datn

# NextAuth Config
NEXTAUTH_SECRET=your_nextauth_secret_hash_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Đăng nhập Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# VNPAY Sandbox Config (Thanh toán VNPAY)
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/vnpay/return

# Cloudinary Config (Lưu trữ ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=products
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Resend Mail Config (Gửi email)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Gemini AI (Trợ lý tư vấn AI)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Cài đặt các thư viện phụ thuộc
Di chuyển vào thư mục `/fashion-store` và chạy lệnh sau để cài đặt:
```bash
npm install
```

### 4. Tải xuống hình ảnh mẫu
Dự án có sẵn script để tải tự động các hình ảnh danh mục, sản phẩm, banner từ Unsplash về máy cục bộ. Hãy chạy lệnh sau:
```bash
npx tsx scripts/downloadImages.ts
```

### 5. Khởi tạo dữ liệu mẫu (Seeding)
Sau khi kết nối MongoDB thành công, chạy lệnh dưới đây để tự động tạo các bản ghi ban đầu bao gồm: các danh mục sản phẩm, 20 sản phẩm mẫu (kèm biến thể size, màu sắc), 10 tài khoản khách hàng mẫu, cấu hình hệ thống mặc định và mã coupon giảm giá.
```bash
npm run seed
```
> [!NOTE]
> *Tài khoản khách hàng mẫu được tạo sẽ có định dạng email từ `customer1@gmail.com` đến `customer10@gmail.com` với mật khẩu chung là `password123`.*

### 6. Khởi chạy dự án ở chế độ phát triển (Development)
Chạy lệnh sau để khởi động dự án cục bộ:
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### 7. Phân quyền tài khoản Quản trị viên (Admin)
Mặc định khi đăng ký tài khoản mới trên giao diện web, vai trò của tài khoản sẽ là `customer`. Để cấp quyền quản trị (Admin) nhanh cho tài khoản bất kỳ:
1. Vào cơ sở dữ liệu hoặc đăng ký một tài khoản trên trang web (ví dụ: `admin@fashion.com`).
2. Mở file `scripts/makeAdmin.ts` và đổi email ở dòng số 6 thành email tài khoản bạn muốn phân quyền.
3. Chạy lệnh:
   ```bash
   npx tsx scripts/makeAdmin.ts
   ```
4. Đăng nhập lại bằng tài khoản này, bạn sẽ truy cập được trang quản lý admin tại: [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🐳 Khởi chạy bằng Docker (Tùy chọn)

Nếu bạn muốn chạy ứng dụng thông qua Docker, dự án đã cung cấp sẵn cấu hình `Dockerfile` và `docker-compose.yml`.

### Chạy bằng Docker Compose
1. Đảm bảo bạn đã cài đặt Docker và Docker Compose trên máy tính.
2. Thiết lập các thông số cấu hình trong tệp `.env.local`.
3. Khởi chạy toàn bộ hệ thống (bao gồm ứng dụng và một container MongoDB cục bộ):
   ```bash
   docker-compose up --build -d
   ```
4. Hệ thống sẽ khả dụng tại [http://localhost:3000](http://localhost:3000).

---

## 📈 Các Script phục vụ viết báo cáo tốt nghiệp
Trong thư mục `scripts/` có sẵn 3 file script Python giúp tự động tạo ảnh sơ đồ chất lượng cao để chèn vào báo cáo Word hoặc Slide thuyết trình:
1.  **Vẽ sơ đồ cơ sở dữ liệu quan hệ (ERD)**:
    ```bash
    python scripts/draw_erd.py
    ```
2.  **Vẽ sơ đồ kiến trúc luồng dữ liệu thông báo thời gian thực (Socket)**:
    ```bash
    python scripts/draw_socket_architecture.py
    ```
3.  **Vẽ sơ đồ quy trình nghiệp vụ hệ thống (Thanh toán, AI)**:
    ```bash
    python scripts/draw_thesis_diagrams.py
    ```
> *Lưu ý: Để chạy các script vẽ sơ đồ này, bạn cần cài đặt thư viện python `matplotlib` và công cụ vẽ `graphviz`.*

---
Chúc bạn thực hiện thành công đồ án tốt nghiệp của mình với hệ thống **Fashion Store**!
