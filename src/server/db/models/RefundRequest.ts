import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefundRequest extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  images: string[];
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  vnpayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRequestSchema = new Schema<IRefundRequest>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String },
    images: { type: [String], default: [] },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminComment: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    vnpayResponse: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

RefundRequestSchema.index({ order: 1 });
RefundRequestSchema.index({ customer: 1 });
RefundRequestSchema.index({ status: 1 });

export const RefundRequest: Model<IRefundRequest> =
  mongoose.models.RefundRequest || mongoose.model<IRefundRequest>('RefundRequest', RefundRequestSchema);
