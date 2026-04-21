import { NextResponse } from "next/server";
import connectDB from "@/server/db";
import { Category } from "@/server/db/models/Category";
import { Product } from "@/server/db/models/Product";

export async function GET() {
  try {
    await connectDB();
    
    await Category.deleteMany({});
    await Product.deleteMany({});

    const categories = [
      { name: 'Áo Thun', slug: 'ao-thun', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
      { name: 'Áo Khoác', slug: 'ao-khoac', image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea' },
      { name: 'Quần Jeans', slug: 'quan-jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
      { name: 'Áo Sơ Mi', slug: 'ao-so-mi', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717' },
      { name: 'Phụ Kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f' },
      { name: 'Đồ Thể Thao', slug: 'do-the-thao', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' },
    ];

    const createdCategories = await Category.insertMany(categories);
    const categoryIds = createdCategories.map(c => c._id);

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

    const products = [];
    for (let i = 0; i < 28; i++) {
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
              { size: "L", stock: 10 }
            ]
          },
          {
            color: "Trắng",
            colorHex: "#ffffff",
            sizes: [
               { size: "M", stock: hasZeroStock ? 0 : 25 },
               { size: "L", stock: 5 },
               { size: "XL", stock: 0 }
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

    await Product.insertMany(products);

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${categories.length} Categories and ${products.length} Products.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
