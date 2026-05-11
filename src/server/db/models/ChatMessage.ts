import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  sessionId: string;
  sender: mongoose.Types.ObjectId;
  senderRole: 'customer' | 'admin';
  content: string;
  type: 'text' | 'image' | 'order_link';
  metadata?: {
    orderId?: string;
    orderCode?: string;
    orderStatus?: string;
    orderTotal?: number;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'admin'], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'order_link'], default: 'text' },
    metadata: {
      orderId: String,
      orderCode: String,
      orderStatus: String,
      orderTotal: Number,
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
