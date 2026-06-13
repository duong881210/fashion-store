"use cache";

import { cacheTag } from 'next/cache';
import connectDB from '@/server/db';
import { Product } from '@/server/db/models/Product';
import { Category } from '@/server/db/models/Category';

export async function getCachedFeatured(limit: number = 8) {
  cacheTag('featured-products');
  await connectDB();
  const products = await Product.find({ isPublished: true, isFeatured: true })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function getCachedNewArrivals(limit: number = 8) {
  cacheTag('new-arrivals');
  await connectDB();
  const products = await Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function getCachedBestSellers(limit: number = 8) {
  cacheTag('best-sellers');
  await connectDB();
  const products = await Product.find({ isPublished: true })
    .sort({ sold: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  return JSON.parse(JSON.stringify(products));
}

import mongoose from 'mongoose';

export async function getCachedProductBySlug(slug: string) {
  cacheTag('product-details');
  await connectDB();
  const isObjectId = mongoose.Types.ObjectId.isValid(slug);
  const query = isObjectId ? { _id: slug, isPublished: true } : { slug, isPublished: true };
  
  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .lean();
  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

export async function getCachedRelatedProducts(categorySlug?: string, currentProductId?: string, limit: number = 8) {
  cacheTag('product-details');
  await connectDB();
  const query: any = { isPublished: true };
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (category) query.category = category._id;
  }
  if (currentProductId) {
    query._id = { $ne: currentProductId };
  }
  const products = await Product.find(query)
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  return JSON.parse(JSON.stringify(products));
}
