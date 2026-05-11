import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderTimeline {
  status: string;
  message?: string;
  timestamp: Date;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderCode: string;
  customer: mongoose.Types.ObjectId;
  items: any[]; 
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon?: mongoose.Types.ObjectId;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'vnpay' | 'cod';
  timeline: IOrderTimeline[];
}

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const OrderTimelineSchema = new Schema<IOrderTimeline>({
  status: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String }
});

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: { type: String, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true }
    },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paymentMethod: {
      type: String,
      enum: ['vnpay', 'cod'],
      required: true
    },
    timeline: [OrderTimelineSchema]
  },
  {
    timestamps: true
  }
);

OrderSchema.pre('save', async function() {
  if (this.isNew) {
    this.orderCode = 'FS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
  }
  
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      message: `Đơn hàng chuyển sang trạng thái ${this.status}`
    } as any);
  }
});

OrderSchema.index({ customer: 1, status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
