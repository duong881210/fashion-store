import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from './Product';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10 },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

ReviewSchema.post('save', async function(doc: IReview) {
  const model = this.constructor as Model<IReview>;
  
  const stats = await model.aggregate([
    { $match: { product: doc.product } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(doc.product, {
      $set: {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      }
    });
  } else {
    await Product.findByIdAndUpdate(doc.product, {
      $set: { rating: 0, reviewCount: 0 }
    });
  }
});

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
