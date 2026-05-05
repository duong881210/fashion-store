import mongoose, { Schema, Document, Model } from 'mongoose';

function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD') // normalize accents
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/đ/g, 'd') // replace đ
    .replace(/[^a-z0-9]+/g, '-') // hyphenate spaces and special chars
    .replace(/(^-|-$)/g, ''); // remove trailing hyphens
}

export interface IProductVariantSize {
  size: string;
  stock: number;
}

export interface IProductVariant {
  color: string;
  colorHex: string;
  sizes: IProductVariantSize[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  category: mongoose.Types.ObjectId;
  tags: string[];
  images: string[];
  variants: IProductVariant[];
  totalStock: number; // Virtual
  sold: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

const ProductVariantSizeSchema = new Schema<IProductVariantSize>({
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 }
});

const ProductVariantSchema = new Schema<IProductVariant>({
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  sizes: [ProductVariantSizeSchema]
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { 
      type: Number,
      validate: {
        validator: function(this: IProduct, value: number) {
          if (value == null) return true;
          return value < this.price;
        },
        message: 'salePrice must be less than price'
      }
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    images: [{ type: String }],
    variants: [ProductVariantSchema],
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    seoTitle: { type: String },
    seoDescription: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ProductSchema.virtual('totalStock').get(function(this: IProduct) {
  if (!this.variants) return 0;
  return this.variants.reduce((total, variant) => 
    total + variant.sizes.reduce((s, size) => s + size.stock, 0), 0);
});

ProductSchema.pre('save', async function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name);
  }
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ isPublished: 1, isFeatured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Allows full text search

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
