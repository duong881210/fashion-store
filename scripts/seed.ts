import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// --- SAMPLE CATEGORY DATA ---
const categories = [
  { name: 'Áo Thun', slug: 'ao-thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Áo Khoác', slug: 'ao-khoac', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea' },
  { name: 'Quần Jeans', slug: 'quan-jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
  { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: 'https://images.unsplash.com/photo-1620012253295-c05518e993be' },
  { name: 'Phụ Kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f' }
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
    ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"],
    ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea", "https://images.unsplash.com/photo-1551028719-00167b16eac5"],
    ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246", "https://images.unsplash.com/photo-1475178626620-a4d074967452"],
    ["https://images.unsplash.com/photo-1620012253295-c05518e993be", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3"],
    ["https://images.unsplash.com/photo-1511499767150-a48a237f0083", "https://images.unsplash.com/photo-1572635196237-14b3f281503f"],
    ["https://images.unsplash.com/photo-1516257984-b1b4d707412e", "https://images.unsplash.com/photo-1556821840-3a63f95609a7"],
    ["https://images.unsplash.com/photo-1617137984095-74e4e5e3613f", "https://images.unsplash.com/photo-1559551409-dadc959f76b8"]
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
      customersData.map(userData => User.create(userData))
    );

    // 6. Seed Customer Order Histories and Reviews
    console.log("🟢 Seeding Customer Order Histories and Reviews...");
    const reviewsTemplates = [
      { rating: 5, comment: "Chất lượng sản phẩm tuyệt vời, phom dáng mặc rất tôn dáng, mặc rất thoải mái. Giao hàng cực kỳ nhanh chóng." },
      { rating: 5, comment: "Đóng gói sản phẩm rất đẹp và cẩn thận. Vải cotton 100% mềm mịn và mát mẻ. Xứng đáng 5 sao!" },
      { rating: 4, comment: "Áo đẹp, giống hệt như trong hình mô tả. Màu sắc chuẩn chỉnh, đường may chắc chắn. Sẽ mua thêm các màu khác." },
      { rating: 4, comment: "Giao hàng nhanh chóng. Chất vải sờ rất mịn, mặc mát và nhẹ, tuy nhiên phom áo hơi ôm một chút so với hình dung." },
      { rating: 5, comment: "Rất ưng ý luôn! Form dáng đẹp xuất sắc, chất vải dày dặn xịn sò. Shop phục vụ rất nhiệt tình, tư vấn kỹ." },
      { rating: 3, comment: "Sản phẩm ở mức tạm ổn, chất vải hơi mỏng một chút so với hình ảnh trên mạng. Giao hàng ở mức trung bình." }
    ];

    const reviewImages = [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3"
    ];

    // Create a deterministic completed order for customer1@gmail.com (index 0)
    // so they have items ready to review for testing.
    const testCustomer = createdCustomers[0];
    const testAddress = testCustomer.addresses[0];
    
    // Test completed (delivered) order for Customer 1
    const testProduct1 = createdProducts[0];
    const testProduct2 = createdProducts[1];
    
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
        { status: 'pending', message: 'Đơn hàng được khởi tạo thành công', timestamp: new Date(Date.now() - 3600000 * 48) },
        { status: 'delivered', message: 'Đơn hàng đã được giao thành công', timestamp: new Date(Date.now() - 3600000 * 2) }
      ]
    });
    await testOrder.save();

    // Create a pending order for Customer 1 as well
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
        { status: 'pending', message: 'Đơn hàng được khởi tạo thành công', timestamp: new Date() }
      ]
    });
    await testOrder2.save();

    // Now seed orders and reviews for all OTHER customers (index >= 1)
    const orderStatuses: Array<'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled'> = [
      'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'
    ];

    for (let c = 1; c < createdCustomers.length; c++) {
      const customer = createdCustomers[c];
      const orderCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 orders
      
      for (let o = 0; o < orderCount; o++) {
        const randomItemsCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 items
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
        // High probability of delivered orders so we get plenty of reviews
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
              timestamp: new Date(Date.now() - 3600000 * 24 * 3)
            }
          ]
        });

        if (randomStatus !== 'pending') {
          order.timeline.push({
            status: randomStatus,
            message: `Đơn hàng chuyển sang trạng thái ${randomStatus}`,
            timestamp: new Date(Date.now() - 3600000 * 24 * 1)
          });
        }

        const savedOrder = await order.save();

        // If the order was delivered, seed reviews for its items
        if (randomStatus === 'delivered') {
          for (const item of orderItems) {
            // 70% probability of leaving a review
            if (Math.random() > 0.3) {
              const template = reviewsTemplates[Math.floor(Math.random() * reviewsTemplates.length)];
              const hasImages = Math.random() > 0.5;
              const selectedImages = hasImages 
                ? [reviewImages[Math.floor(Math.random() * reviewImages.length)]]
                : [];

              await Review.create({
                product: item.product,
                customer: customer._id,
                order: savedOrder._id,
                rating: template.rating,
                comment: template.comment,
                images: selectedImages,
                isVerified: true
              });
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