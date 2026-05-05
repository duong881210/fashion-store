import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 1. Nạp biến môi trường
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// --- DATA MẪU CATEGORY ---
const categories = [
  { name: 'Áo Thun', slug: 'ao-thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Áo Khoác', slug: 'ao-khoac', image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea' },
  { name: 'Quần Jeans', slug: 'quan-jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
  { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717' },
  { name: 'Phụ Kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f' },
  { name: 'Đồ Thể Thao', slug: 'do-the-thao', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' },
];

// --- HÀM TẠO SẢN PHẨM ---
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
  ];

  for (let i = 0; i < 28; i++) {
    const basePrice = Math.floor(Math.random() * 400 + 100) * 1000;
    const isSale = Math.random() > 0.7;
    const isFeatured = Math.random() > 0.8;
    const hasZeroStock = Math.random() > 0.8;

    products.push({
      name: `${names[i % names.length]} - Mã SP${i + 1}`,
      slug: `product-${i + 1}-${Math.random().toString(36).substring(2, 8)}`,
      description: "Sản phẩm cao cấp.\n\n* **Chất liệu**: Cotton 100%\n* **Bảo quản**: Giặt máy nhẹ nhàng",
      price: basePrice,
      salePrice: isSale ? Math.floor(basePrice * 0.7) : undefined,
      category: categoryIds[i % categoryIds.length],
      tags: ["mới", isSale ? "sale" : ""].filter(Boolean),
      images: imagesList[i % imagesList.length],
      variants: [
        {
          color: "Đen",
          colorHex: "#000000",
          sizes: [{ size: "S", stock: hasZeroStock ? 0 : 15 }, { size: "M", stock: 20 }]
        }
      ],
      sold: Math.floor(Math.random() * 500),
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100),
      isPublished: true,
      isFeatured: isFeatured
    });
  }
  return products;
};

// --- HÀM TẠO NGƯỜI DÙNG ---
const generateUsers = (productIds: any[]) => {
  const users = [];

  // 1. Tạo 1 tài khoản Admin để test Dashboard
  users.push({
    name: "Quản Trị Viên",
    email: "admin@fashion.com",
    password: "password123", // Sẽ được tự động băm bởi hook pre('save')
    phone: "0901234567",
    role: "admin",
    isActive: true,
    addresses: [],
    wishlist: []
  });

  // 2. Tạo 5 tài khoản Khách hàng kèm địa chỉ và Wishlist
  const customerNames = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E"];
  const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"];

  for (let i = 0; i < 5; i++) {
    // Random 1-3 sản phẩm vào wishlist
    const randomWishlist = [
      productIds[Math.floor(Math.random() * productIds.length)],
      productIds[Math.floor(Math.random() * productIds.length)]
    ];

    users.push({
      name: customerNames[i],
      email: `customer${i + 1}@gmail.com`,
      password: "password123",
      phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`, // Random SĐT
      role: "customer",
      isActive: true,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      wishlist: [...new Set(randomWishlist)], // Lọc trùng lặp ID
      addresses: [
        {
          fullName: customerNames[i],
          phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
          province: provinces[i % provinces.length],
          district: "Quận Trung Tâm",
          ward: "Phường 1",
          street: `${Math.floor(Math.random() * 100) + 1} Đường Hùng Vương`,
          isDefault: true
        }
      ]
    });
  }

  return users;
};

// --- HÀM CHẠY SEED ---
async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI environment variable is missing.");
    }

    // Dynamic Imports để đảm bảo dotenv chạy trước
    const { default: connectDB } = await import('../src/server/db/index');
    const { Category } = await import('../src/server/db/models/Category');
    const { Product } = await import('../src/server/db/models/Product');
    const { User } = await import('../src/server/db/models/User'); // Import thêm User Model

    await connectDB();
    console.log("🔌 Connected to MongoDB instance...");

    console.log("🧹 Wiping existing Collections...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({}); // Xóa dữ liệu User cũ

    // 1. Insert Categories
    console.log("🟢 Inserting Categories...");
    const createdCategories = await Category.insertMany(categories);
    const categoryIds = createdCategories.map((c: any) => c._id);

    // 2. Insert Products
    console.log("🟢 Inserting Products...");
    const productsData = generateProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsData);
    const productIds = createdProducts.map((p: any) => p._id);

    // 3. Insert Users
    console.log("🟢 Inserting Users...");
    const usersData = generateUsers(productIds);

    // DÙNG Promise.all VÀ .create() THAY VÌ insertMany() ĐỂ TRIGGER HASH PASSWORD
    await Promise.all(usersData.map(userData => User.create(userData)));

    console.log(`✅ Successfully seeded:`);
    console.log(`   - ${createdCategories.length} Categories`);
    console.log(`   - ${createdProducts.length} Products`);
    console.log(`   - ${usersData.length} Users (Admin email: admin@fashion.com, Pass: password123)`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();