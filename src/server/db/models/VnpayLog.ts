import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVnpayLog extends Document {
  orderCode: string;
  type: 'return' | 'ipn';
  query: Record<string, any>;
  verified: boolean;
  createdAt: Date;
}

const VnpayLogSchema = new Schema<IVnpayLog>(
  {
    orderCode: { type: String, required: true },
    type: { type: String, enum: ['return', 'ipn'], required: true },
    query: { type: Schema.Types.Mixed, required: true },
    verified: { type: Boolean, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // We only care about creation timestamp
  }
);

VnpayLogSchema.index({ orderCode: 1, createdAt: -1 });

export const VnpayLog: Model<IVnpayLog> =
  mongoose.models.VnpayLog || mongoose.model<IVnpayLog>('VnpayLog', VnpayLogSchema);
