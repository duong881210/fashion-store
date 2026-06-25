import fs from "fs";
import path from "path";
import https from "https";

const imagesToDownload = [
  // Categories
  { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/ao-thun.jpg" },
  { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/ao-khoac.jpg" },
  { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/quan-jeans.jpg" },
  { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/ao-so-mi.jpg" },
  { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/phu-kien.jpg" },
  
  // Category Grid Defaults
  { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/default-1.jpg" },
  { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/default-2.jpg" },
  { url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80", dest: "public/images/categories/default-3.jpg" },
  
  // Products
  { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-1a.jpg" },
  { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-1b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-2a.jpg" },
  { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-2b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-3a.jpg" },
  { url: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-3b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-4a.jpg" },
  { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-4b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-5a.jpg" },
  { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-5b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-6a.jpg" },
  { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-6b.jpg" },
  
  { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-7a.jpg" },
  { url: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=600&q=80", dest: "public/images/products/product-7b.jpg" },
  
  // Banners
  { url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=80", dest: "public/images/banners/hero-1.jpg" },
  { url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=80", dest: "public/images/banners/hero-2.jpg" },
  { url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1600&q=80", dest: "public/images/banners/hero-3.jpg" },
  
  // Promos
  { url: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1600&q=80", dest: "public/images/promo/flash-sale.jpg" },
  
  // Auth Backgrounds
  { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", dest: "public/images/auth/login-bg.jpg" },
  { url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80", dest: "public/images/auth/register-bg.jpg" },

  // Reviews
  { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80", dest: "public/images/reviews/review-1.jpg" },
  { url: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=400&q=80", dest: "public/images/reviews/review-2.jpg" },
  { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80", dest: "public/images/reviews/review-3.jpg" },
  { url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400&q=80", dest: "public/images/reviews/review-4.jpg" }
];

async function download(url: string, dest: string) {
  const absoluteDest = path.resolve(process.cwd(), dest);
  const dir = path.dirname(absoluteDest);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(absoluteDest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Tải lỗi từ ${url}. HTTP Status: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(absoluteDest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log("🚀 Bắt đầu tải hình ảnh về máy...");
  let count = 0;
  for (const item of imagesToDownload) {
    count++;
    console.log(`[${count}/${imagesToDownload.length}] Đang tải: ${item.dest} ...`);
    try {
      await download(item.url, item.dest);
    } catch (error) {
      console.error(`❌ Lỗi khi tải ${item.dest}:`, error);
    }
  }
  console.log("✨ Hoàn thành tải ảnh!");
}

main();
