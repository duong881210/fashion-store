import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Parse environmental credentials from nearest .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // fallback to .env if .env.local is missing

import connectDB from '../src/server/db/index';
import { Category } from '../src/server/db/models/Category';
import { Product } from '../src/server/db/models/Product';

const categories = [
  { name: 'Áo Thun', slug: 'ao-thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Áo Khoác', slug: 'ao-khoac', image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea' },
  { name: 'Quần Jeans', slug: 'quan-jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
  { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717' },
  { name: 'Phụ Kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f' },
  { name: 'Đồ Thể Thao', slug: 'do-the-thao', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' },
];

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
    ["https://images.unsplash.com/photo-1617137984095-74e4e5e3613f", "https://images.unsplash.com/photo-1559551409-dadc959f76b8"],
    ["https://plus.unsplash.com/premium_photo-1673356301535-224a0dcdcbac", "https://images.unsplash.com/photo-1517849845537-4d257902454a"]
  ];

  for (let i = 0; i < 28; i++) {
    const basePrice = Math.floor(Math.random() * 400 + 100) * 1000;
    const isSale = Math.random() > 0.7; // 30% chance of extreme sale
    const isFeatured = Math.random() > 0.8; // 20% chance to be globally featured

    // Test boundary: sometimes forces specific variant sizes to 0 to test out-of-stock disabling UI
    const hasZeroStock = Math.random() > 0.8;

    products.push({
      name: `${names[i % names.length]} - Mã SP${i + 1}`,
      slug: `product-${i + 1}-${Math.random().toString(36).substring(2, 8)}`,
      description: "Sản phẩm được làm từ chất liệu vải dệt cao cấp, thiết kế hiện đại phom dáng cực chuẩn cho mọi hoạt động.\n\n* **Chất liệu**: Cotton 100% / Denim / Da thật\n* **Kiểu dáng**: Phù hợp mọi vóc dáng thanh lịch nam giới\n* **Bảo quản**: Giặt máy nhẹ nhàng hoặc hấp khô",
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
            { size: "S", stock: hasZeroStock ? 0 : 15 },
            { size: "M", stock: 20 },
            { size: "L", stock: 10 }
          ]
        },
        {
          color: "Trắng",
          colorHex: "#ffffff",
          sizes: [
            { size: "M", stock: hasZeroStock ? 0 : 25 },
            { size: "L", stock: 5 },
            { size: "XL", stock: 0 } // Explicitly test size mapping exhaustion
          ]
        }
      ],
      sold: Math.floor(Math.random() * 500),
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // Generates 3.5 - 5.0
      reviewCount: Math.floor(Math.random() * 100),
      isPublished: true,
      isFeatured: isFeatured,
      seoTitle: `Mua ${names[i % names.length]} Chính Hãng Rẻ Đẹp`,
      seoDescription: `Sở hữu ngay sản phẩm ${names[i % names.length]} phong cách chuẩn mực uy tín nhất 2026!`
    });
  }
  return products;
};

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI environment variable is missing.");
    }

    await connectDB();
    console.log("🔌 Connected to MongoDB instance...");

    console.log("🧹 Wiping existing Collections...");
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("🟢 Inserting Categories...");
    const createdCategories = await Category.insertMany(categories);
    const categoryIds = createdCategories.map(c => c._id);

    console.log("🟢 Inserting Products...");
    const productsData = generateProducts(categoryIds);
    await Product.insertMany(productsData);

    console.log(`✅ Successfully seeded ${createdCategories.length} Categories and ${productsData.length} Products!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
