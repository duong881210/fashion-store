import { MetadataRoute } from 'next';
import connectDB from '@/server/db';
import { Product } from '@/server/db/models/Product';
import { Category } from '@/server/db/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    await connectDB();

    // Fetch published products and categories in parallel
    const [products, categories] = await Promise.all([
      Product.find({ isPublished: true }).select('slug updatedAt').lean(),
      Category.find().select('slug updatedAt').lean(),
    ]);

    const staticPaths = [
      { url: `${baseUrl}`, lastModified: new Date() },
      { url: `${baseUrl}/products`, lastModified: new Date() },
      { url: `${baseUrl}/login`, lastModified: new Date() },
      { url: `${baseUrl}/register`, lastModified: new Date() },
    ];

    const productPaths = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
    }));

    const categoryPaths = categories.map((category: any) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: category.updatedAt || new Date(),
    }));

    return [...staticPaths, ...productPaths, ...categoryPaths];
  } catch (error) {
    console.error('[Sitemap Generation Error]', error);
    // Return static paths fallback if DB connection fails
    return [
      { url: `${baseUrl}`, lastModified: new Date() },
      { url: `${baseUrl}/products`, lastModified: new Date() },
    ];
  }
}
