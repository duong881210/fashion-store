import { NextResponse, connection } from "next/server";
import connectDB from "@/server/db";
import { Category } from "@/server/db/models/Category";
import { Product } from "@/server/db/models/Product";
import { User } from "@/server/db/models/User";
import { Coupon } from "@/server/db/models/Coupon";
import { Order } from "@/server/db/models/Order";
import { Settings } from "@/server/db/models/Settings";

// Sample Categories
const categories = [
  { name: 'Áo Thun', slug: 'ao-thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Áo Khoác', slug: 'ao-khoac', image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea' },
  { name: 'Quần Jeans', slug: 'quan-jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
  { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717' },
  { name: 'Phụ Kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f' }
];

// Product Data Generator
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
    ["https://images.unsplash.com/photo-1550614000-4b95d4ed79ea", "https://images.unsplash.com/photo-1551028719-00167b16eac5"],
    ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246", "https://images.unsplash.com/photo-1475178626620-a4d074967452"],
    ["https://images.unsplash.com/photo-1596755094514-f87e32f6b717", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3"],
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
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100),
      isPublished: true,
      isFeatured: isFeatured,
      seoTitle: `Mua ${names[i % names.length]} Chính Hãng Rẻ Đẹp`,
      seoDescription: `Sở hữu ngay ${names[i % names.length]} phong cách chuẩn mực uy tín nhất 2026!`
    });
  }
  return products;
};

// Customers Generator
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
      password: "password123",
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

export async function GET() {
  await connection();
  try {
    await connectDB();

    // Wipe existing collections
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});

    // 1. Settings
    await Settings.create({
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

    // 2. Coupons
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

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

    // 3. Categories
    const createdCategories = await Category.insertMany(categories);
    const categoryIds = createdCategories.map((c: any) => c._id);

    // 4. Products
    const productsData = generateProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsData);

    // 5. Admin & Customers
    await User.create({
      name: "Quản trị viên",
      email: "admin@fashionstore.vn",
      password: "Admin@123456",
      phone: "0901234567",
      role: "admin",
      isActive: true,
      addresses: [],
      wishlist: []
    });

    const customersData = generateCustomers();
    const createdCustomers = await Promise.all(
      customersData.map(userData => User.create(userData))
    );

    // 6. Orders
    const orderStatuses: Array<'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled'> = [
      'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'
    ];

    for (const customer of createdCustomers) {
      const orderCount = Math.floor(Math.random() * 3) + 1;
      
      for (let o = 0; o < orderCount; o++) {
        const randomItemsCount = Math.floor(Math.random() * 2) + 1;
        const orderItems = [];
        let subtotal = 0;

        for (let i = 0; i < randomItemsCount; i++) {
          const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const variant = product.variants[0];
          const sizeObj = variant.sizes[0];
          const qty = Math.floor(Math.random() * 2) + 1;
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
        const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
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
              timestamp: new Date(Date.now() - 3600000 * 24)
            }
          ]
        });

        if (randomStatus !== 'pending') {
          order.timeline.push({
            status: randomStatus,
            message: `Đơn hàng chuyển sang trạng thái ${randomStatus}`,
            timestamp: new Date()
          });
        }

        await order.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded.",
      details: {
        settings: 1,
        coupons: 3,
        categories: createdCategories.length,
        products: createdProducts.length,
        admin: "admin@fashionstore.vn",
        customers: createdCustomers.length
      }
    });
  } catch (error: any) {
    console.error("[API Seed Error]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
