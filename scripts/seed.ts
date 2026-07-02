import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// --- SAMPLE CATEGORY DATA ---
const categories = [
  { name: 'Áo Thun', slug: 'ao-thun', image: '/images/categories/ao-thun.jpg' },
  { name: 'Áo Khoác', slug: 'ao-khoac', image: '/images/categories/ao-khoac.jpg' },
  { name: 'Quần Jeans', slug: 'quan-jeans', image: '/images/categories/quan-jeans.jpg' },
  { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: '/images/categories/ao-so-mi.jpg' },
  { name: 'Phụ Kiện', slug: 'phu-kien', image: '/images/categories/phu-kien.jpg' }
];

// --- SAMPLE PRODUCT DATA GENERATOR ---
const generateProducts = (categoryIds: any[]) => {
  const products: any[] = [];
  const names = [
    "Áo Thun Basic Classic", "Áo Khoác Bomber Minimalist", "Quần Jeans Slim Fit",
    "Áo Sơ Mi Oxford Dài Tay", "Kính Mát Chống Tia UV", "Set Thể Thao Năng Động",
    "Áo Thun Graphic Oversize", "Áo Khoác Da Biker", "Quần Kaki Ống Đứng",
    "Thắt Lưng Da Thật", "Sneaker Trắng Cổ Thấp", "Áo Hoodie Nỉ Bông"
  ];
  const imagesList = [
    ["/images/products/product-1a.jpg", "/images/products/product-1b.jpg"],
    ["/images/products/product-2a.jpg", "/images/products/product-2b.jpg"],
    ["/images/products/product-3a.jpg", "/images/products/product-3b.jpg"],
    ["/images/products/product-4a.jpg", "/images/products/product-4b.jpg"],
    ["/images/products/product-5a.jpg", "/images/products/product-5b.jpg"],
    ["/images/products/product-6a.jpg", "/images/products/product-6b.jpg"],
    ["/images/products/product-7a.jpg", "/images/products/product-7b.jpg"]
  ];

  for (let i = 0; i < 20; i++) {
    const basePrice = Math.floor(Math.random() * 400 + 100) * 1000;
    const isSale = Math.random() > 0.7;
    const isFeatured = Math.random() > 0.8;
    const hasZeroStock = Math.random() > 0.8;

    products.push({
      name: `${names[i % names.length]} - Mã SP${i + 1}`,
      slug: `product-${i + 1}-${Math.random().toString(36).substring(2, 8)}`,
      description: "Sản phẩm được làm từ chất liệu vải dệt cao cấp, thiết kế hiện đại phom dáng cực chuẩn cho mọi hoạt động.\n\n* **Chất liệu**: Cotton 100% / Jeans / Kaki\n* **Bảo quản**: Giặt máy nhẹ nhàng",
      price: basePrice,
      salePrice: isSale ? Math.floor(basePrice * 0.7) : undefined,
      category: categoryIds[i % categoryIds.length],
      tags: ["mới", "hottrend", isSale ? "sale" : ""].filter(Boolean),
      images: imagesList[i % imagesList.length],
      variants: [
        {
          color: "Đen",
          colorHex: "#000000",
          sizes: [
            { size: "M", stock: 20 },
            { size: "L", stock: 15 }
          ]
        },
        {
          color: "Trắng",
          colorHex: "#ffffff",
          sizes: [
            { size: "M", stock: hasZeroStock ? 0 : 25 },
            { size: "L", stock: 10 }
          ]
        }
      ],
      sold: Math.floor(Math.random() * 500),
      rating: 0,
      reviewCount: 0,
      isPublished: true,
      isFeatured: isFeatured,
      seoTitle: `Mua ${names[i % names.length]} Chính Hãng Rẻ Đẹp`,
      seoDescription: `Sở hữu ngay ${names[i % names.length]} phong cách chuẩn mực uy tín nhất 2026!`
    });
  }
  return products;
};

// --- SAMPLE CUSTOMERS GENERATOR ---
const generateCustomers = () => {
  const users = [];
  const customerNames = [
    "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E",
    "Vũ Văn F", "Ngô Thị G", "Đỗ Văn H", "Bùi Thị I", "Phan Văn K"
  ];
  const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];

  for (let i = 0; i < 10; i++) {
    users.push({
      name: customerNames[i],
      email: `customer${i + 1}@gmail.com`,
      password: "password123", // Will be hashed via pre-save hook
      phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
      role: "customer",
      isActive: true,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      wishlist: [],
      addresses: [
        {
          fullName: customerNames[i],
          phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
          province: provinces[i % provinces.length],
          district: "Quận Trung Tâm",
          ward: "Phường 1",
          street: `${Math.floor(Math.random() * 100) + 1} Đường Lê Lợi`,
          isDefault: true
        }
      ]
    });
  }

  return users;
};

// --- RUN SEED FUNCTION ---
async function seed() {
  try {
    const { default: connectDB } = await import('../src/server/db/index');
    const { Category } = await import('../src/server/db/models/Category');
    const { Product } = await import('../src/server/db/models/Product');
    const { User } = await import('../src/server/db/models/User');
    const { Coupon } = await import('../src/server/db/models/Coupon');
    const { Order } = await import('../src/server/db/models/Order');
    const { Settings } = await import('../src/server/db/models/Settings');
    const { Review } = await import('../src/server/db/models/Review');

    await connectDB();
    console.log("🔌 Connected to MongoDB instance...");

    console.log("🧹 Wiping existing collections...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});
    await Review.deleteMany({});

    // 1. Seed Settings
    console.log("🟢 Seeding Store Settings...");
    const defaultSettings = await Settings.create({
      storeInfo: {
        name: 'Fashion Store',
        description: 'Cửa hàng thời trang cao cấp hàng đầu Việt Nam',
        phone: '0901234567',
        email: 'contact@fashionstore.vn',
        logo: 'https://res.cloudinary.com/demo/image/upload/v1620000000/logo.png',
        socials: {
          facebook: 'https://facebook.com/fashionstore',
          instagram: 'https://instagram.com/fashionstore',
        }
      },
      shipping: {
        type: 'flat',
        flatRate: 30000,
        freeShippingThreshold: 500000,
        provinces: []
      },
      emailTemplates: {
        orderConfirmed: '<p>Cảm ơn {{customerName}} đã đặt hàng. Mã đơn hàng của bạn là {{orderCode}}.</p>',
        orderShipped: '<p>Đơn hàng {{orderCode}} của bạn đang được giao.</p>',
        orderDelivered: '<p>Đơn hàng {{orderCode}} đã giao thành công.</p>',
        passwordReset: '<p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn.</p>'
      },
      payment: {
        vnpayTmnCode: 'DEMO',
        isSandbox: true
      }
    });

    // 2. Seed Coupons
    console.log("🟢 Seeding Coupons...");
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // expires in 30 days

    const coupon1 = await Coupon.create({
      code: 'SALE10',
      type: 'percentage',
      value: 10,
      minOrderValue: 0,
      maxDiscount: 100000,
      usageLimit: 100,
      usedCount: 0,
      expiresAt: expiryDate,
      isActive: true
    });

    const coupon2 = await Coupon.create({
      code: 'NEWUSER',
      type: 'fixed',
      value: 50000,
      minOrderValue: 200000,
      usageLimit: 50,
      usedCount: 0,
      expiresAt: expiryDate,
      isActive: true
    });

    const coupon3 = await Coupon.create({
      code: 'FREESHIP',
      type: 'fixed',
      value: 30000,
      minOrderValue: 300000,
      usageLimit: 200,
      usedCount: 0,
      expiresAt: expiryDate,
      isActive: true
    });

    // 3. Seed Categories
    console.log("🟢 Seeding Categories...");
    const createdCategories = await Category.insertMany(categories);
    const categoryIds = createdCategories.map((c: any) => c._id);

    // 4. Seed Products
    console.log("🟢 Seeding Products...");
    const productsData = generateProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsData);

    // 5. Seed Users (1 Admin & 10 Customers)
    console.log("🟢 Seeding Admin...");
    const admin = await User.create({
      name: "Quản trị viên",
      email: "admin@fashionstore.vn",
      password: "Admin@123456", // Pre-save hook hashes this
      phone: "0901234567",
      role: "admin",
      isActive: true,
      addresses: [],
      wishlist: []
    });

    console.log("🟢 Seeding 10 Customers...");
    const customersData = generateCustomers();
    const createdCustomers = await Promise.all(
      customersData.map(async (userData) => {
        const user = await User.create(userData);
        const randomDaysAgo = Math.floor(Math.random() * 25) + 15; // 15 to 39 days ago
        const userDate = new Date();
        userDate.setDate(userDate.getDate() - randomDaysAgo);
        userDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        await User.collection.updateOne({ _id: user._id }, { $set: { createdAt: userDate, updatedAt: userDate } });
        return user;
      })
    );

    // 6. Seed Customer Order Histories and Reviews
    console.log("🟢 Seeding Customer Order Histories and Reviews...");
    const reviewsTemplates = [
      // 5 Stars
      { rating: 5, comment: "Chất lượng sản phẩm tuyệt vời, phom dáng mặc rất tôn dáng, mặc rất thoải mái. Giao hàng cực kỳ nhanh chóng." },
      { rating: 5, comment: "Đóng gói sản phẩm rất đẹp và cẩn thận. Vải cotton 100% mềm mịn và mát mẻ. Xứng đáng 5 sao!" },
      { rating: 5, comment: "Đồ của shop chưa bao giờ làm mình thất vọng. Chất vải cao cấp, cầm nặng tay, phom dáng mặc lên rất sang trọng." },
      { rating: 5, comment: "Sản phẩm quá đẹp luôn ạ, đóng gói sang chảnh như hàng hiệu. Giao hàng cực nhanh, shipper thân thiện. Sẽ ủng hộ lâu dài!" },
      { rating: 5, comment: "Đã nhận được hàng. Giao hàng nhanh khủng khiếp, hôm qua đặt hôm nay có luôn. Áo mặc vừa vặn, mát mẻ thích hợp cho mùa hè." },
      { rating: 5, comment: "Áo đẹp phom chuẩn, đường may rất tỉ mỉ không có chỉ thừa. Vải cotton co giãn tốt. Rất hài lòng." },
      { rating: 5, comment: "Rất ưng ý luôn! Form dáng đẹp xuất sắc, chất vải dày dặn xịn sò. Shop phục vụ rất nhiệt tình, tư vấn kỹ." },
      
      // 4 Stars
      { rating: 4, comment: "Áo đẹp, giống hệt như trong hình mô tả. Màu sắc chuẩn chỉnh, đường may chắc chắn. Sẽ mua thêm các màu khác." },
      { rating: 4, comment: "Giao hàng nhanh chóng. Chất vải sờ rất mịn, mặc mát và nhẹ, tuy nhiên phom áo hơi ôm một chút so với hình dung." },
      { rating: 4, comment: "Chất lượng ổn áp so với tầm giá. Phom dáng đẹp nhưng vải hơi dày chút xíu, mặc mùa đông hoặc thu thì hợp hơn." },
      { rating: 4, comment: "Mua lần thứ 2 của shop rồi, vải đẹp phom ổn. Lần này giao hàng hơi chậm hơn lần trước tí nhưng đóng gói vẫn rất cẩn thận." },
      { rating: 4, comment: "Sản phẩm đẹp đúng mẫu. Giao hàng nhanh. Tuy nhiên màu sắc thực tế bên ngoài có vẻ hơi đậm hơn trên hình chụp một tông." },
      { rating: 4, comment: "Vải co giãn mặc rất thoải mái, thấm hút mồ hôi tốt. Size L hơi rộng so với mình nhưng tổng thể vẫn rất đẹp." },
      
      // 3 Stars
      { rating: 3, comment: "Sản phẩm ở mức tạm ổn, chất vải hơi mỏng một chút so với hình ảnh trên mạng. Giao hàng ở mức trung bình." },
      { rating: 3, comment: "Đường may tạm được, chất vải hơi bình thường. Phù hợp mặc đi chơi thường ngày chứ không quá xuất sắc." },
      { rating: 3, comment: "Giao hàng hơi chậm, áo có vài chỗ chỉ thừa phải tự cắt. Chất lượng chấp nhận được với giá tiền này." },
      
      // 2 Stars & 1 Star
      { rating: 2, comment: "Phom áo không được đẹp như trên ảnh quảng cáo. Vải giặt xong hơi bị co lại một chút. Hơi thất vọng." },
      { rating: 1, comment: "Giao sai size cho mình, liên hệ hỗ trợ đổi trả hơi lâu. Vải mặc bị bí mồ hôi, giặt lần đầu đã bị xơ lông." }
    ];

    const reviewImages = [
      "/images/reviews/review-1.jpg",
      "/images/reviews/review-2.jpg",
      "/images/reviews/review-3.jpg",
      "/images/reviews/review-4.jpg"
    ];

    // Create a deterministic completed order for customer1@gmail.com (index 0)
    // so they have items ready to review for testing.
    const testCustomer = createdCustomers[0];
    const testAddress = testCustomer.addresses[0];
    
    // Test completed (delivered) order for Customer 1
    const testProduct1 = createdProducts[0];
    const testProduct2 = createdProducts[1];
    
    const testOrderDate = new Date();
    testOrderDate.setDate(testOrderDate.getDate() - 10);
    testOrderDate.setHours(10, 15, 30);

    const testOrder = new Order({
      customer: testCustomer._id,
      items: [
        {
          product: testProduct1._id,
          productName: testProduct1.name,
          productImage: testProduct1.images[0] || '',
          color: testProduct1.variants[0].color,
          size: testProduct1.variants[0].sizes[0].size,
          quantity: 1,
          price: testProduct1.salePrice || testProduct1.price
        },
        {
          product: testProduct2._id,
          productName: testProduct2.name,
          productImage: testProduct2.images[0] || '',
          color: testProduct2.variants[0].color,
          size: testProduct2.variants[0].sizes[0].size,
          quantity: 1,
          price: testProduct2.salePrice || testProduct2.price
        }
      ],
      subtotal: (testProduct1.salePrice || testProduct1.price) + (testProduct2.salePrice || testProduct2.price),
      shippingFee: 30000,
      discount: 0,
      total: (testProduct1.salePrice || testProduct1.price) + (testProduct2.salePrice || testProduct2.price) + 30000,
      shippingAddress: {
        fullName: testAddress.fullName,
        phone: testAddress.phone,
        street: testAddress.street,
        ward: testAddress.ward,
        district: testAddress.district,
        province: testAddress.province
      },
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      timeline: [
        { status: 'pending', message: 'Đơn hàng được khởi tạo thành công', timestamp: testOrderDate },
        { status: 'delivered', message: 'Đơn hàng đã được giao thành công', timestamp: new Date(testOrderDate.getTime() + 3600000 * 36) }
      ]
    });
    await testOrder.save();
    await Order.collection.updateOne({ _id: testOrder._id }, { $set: { createdAt: testOrderDate, updatedAt: testOrderDate } });

    // Create a pending order for Customer 1 as well
    const testOrder2Date = new Date();
    testOrder2Date.setDate(testOrder2Date.getDate() - 2);
    testOrder2Date.setHours(14, 20, 10);

    const testOrder2 = new Order({
      customer: testCustomer._id,
      items: [
        {
          product: createdProducts[2]._id,
          productName: createdProducts[2].name,
          productImage: createdProducts[2].images[0] || '',
          color: createdProducts[2].variants[0].color,
          size: createdProducts[2].variants[0].sizes[0].size,
          quantity: 1,
          price: createdProducts[2].salePrice || createdProducts[2].price
        }
      ],
      subtotal: createdProducts[2].salePrice || createdProducts[2].price,
      shippingFee: 30000,
      discount: 0,
      total: (createdProducts[2].salePrice || createdProducts[2].price) + 30000,
      shippingAddress: {
        fullName: testAddress.fullName,
        phone: testAddress.phone,
        street: testAddress.street,
        ward: testAddress.ward,
        district: testAddress.district,
        province: testAddress.province
      },
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      timeline: [
        { status: 'pending', message: 'Đơn hàng được khởi tạo thành công', timestamp: testOrder2Date }
      ]
    });
    await testOrder2.save();
    await Order.collection.updateOne({ _id: testOrder2._id }, { $set: { createdAt: testOrder2Date, updatedAt: testOrder2Date } });

    // Now seed orders and reviews for all OTHER customers (index >= 1)
    const orderStatuses: Array<'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled'> = [
      'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'
    ];

    for (let c = 1; c < createdCustomers.length; c++) {
      const customer = createdCustomers[c];
      const orderCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 orders
      
      for (let o = 0; o < orderCount; o++) {
        const randomDaysAgo = Math.floor(Math.random() * 30); // 0 to 29 days ago
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - randomDaysAgo);
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

        const randomItemsCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 items
        const orderItems = [];
        let subtotal = 0;

        for (let i = 0; i < randomItemsCount; i++) {
          const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const variant = product.variants[0];
          const sizeObj = variant.sizes[0];
          const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
          const price = product.salePrice || product.price;

          orderItems.push({
            product: product._id,
            productName: product.name,
            productImage: product.images[0] || '',
            color: variant.color,
            size: sizeObj.size,
            quantity: qty,
            price: price
          });

          subtotal += price * qty;
        }

        // Apply coupon randomly
        let discount = 0;
        let appliedCoupon = null;
        if (Math.random() > 0.4) {
          const couponList = [coupon1, coupon2, coupon3];
          const coupon = couponList[Math.floor(Math.random() * couponList.length)];
          
          if (subtotal >= coupon.minOrderValue) {
            appliedCoupon = coupon._id;
            if (coupon.type === 'fixed') {
              discount = coupon.value;
            } else {
              discount = Math.floor((subtotal * coupon.value) / 100);
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            }
          }
        }

        const shippingFee = 30000;
        const total = Math.max(0, subtotal + shippingFee - discount);
        const randomStatus = Math.random() > 0.35 ? 'delivered' : orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const paymentMethod = Math.random() > 0.5 ? 'cod' : 'vnpay';
        const paymentStatus = (randomStatus === 'delivered' || (paymentMethod === 'vnpay' && randomStatus !== 'cancelled')) ? 'paid' : 'unpaid';

        const address = customer.addresses[0];

        const order = new Order({
          customer: customer._id,
          items: orderItems,
          subtotal,
          shippingFee,
          discount,
          total,
          coupon: appliedCoupon,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            ward: address.ward,
            district: address.district,
            province: address.province
          },
          status: randomStatus,
          paymentStatus,
          paymentMethod,
          timeline: [
            {
              status: 'pending',
              message: 'Đơn hàng được khởi tạo thành công',
              timestamp: orderDate
            }
          ]
        });

        if (randomStatus !== 'pending') {
          const statusTime = new Date(orderDate);
          statusTime.setHours(statusTime.getHours() + Math.floor(Math.random() * 48) + 12); // 12-60 hours later
          if (statusTime > new Date()) {
            statusTime.setTime(Date.now());
          }
          order.timeline.push({
            status: randomStatus,
            message: `Đơn hàng chuyển sang trạng thái ${randomStatus}`,
            timestamp: statusTime
          } as any);
        }

        const savedOrder = await order.save();
        await Order.collection.updateOne({ _id: savedOrder._id }, { $set: { createdAt: orderDate, updatedAt: orderDate } });

        // If the order was delivered, seed reviews for its items
        if (randomStatus === 'delivered') {
          for (const item of orderItems) {
            if (Math.random() > 0.1) {
              const template = reviewsTemplates[Math.floor(Math.random() * reviewsTemplates.length)];
              const hasImages = Math.random() > 0.5;
              const selectedImages = hasImages 
                ? [reviewImages[Math.floor(Math.random() * reviewImages.length)]]
                : [];

              const review = await Review.create({
                product: item.product,
                customer: customer._id,
                order: savedOrder._id,
                rating: template.rating,
                comment: template.comment,
                images: selectedImages,
                isVerified: true
              });

              const reviewDate = new Date(orderDate);
              reviewDate.setDate(reviewDate.getDate() + Math.floor(Math.random() * 3) + 1);
              if (reviewDate > new Date()) {
                reviewDate.setTime(Date.now());
              }
              await Review.collection.updateOne({ _id: review._id }, { $set: { createdAt: reviewDate, updatedAt: reviewDate } });
            }
          }
        }
      }
    }

    console.log(`✅ Seeding Complete! Seeded:`);
    console.log(`   - 1 Store Settings Document`);
    console.log(`   - 3 Coupons (SALE10, NEWUSER, FREESHIP)`);
    console.log(`   - ${createdCategories.length} Categories`);
    console.log(`   - ${createdProducts.length} Products with Variants`);
    console.log(`   - 1 Admin: admin@fashionstore.vn / Admin@123456`);
    console.log(`   - 10 Customers with order histories and dynamic reviews`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();