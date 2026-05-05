import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProvinceFee {
  code: string;
  name: string;
  fee: number;
}

export interface ISettings extends Document {
  storeInfo: {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    logo?: string;
    socials: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      shopee?: string;
      lazada?: string;
    }
  };
  shipping: {
    type: 'flat' | 'province';
    flatRate: number;
    freeShippingThreshold: number;
    provinces: IProvinceFee[];
  };
  emailTemplates: {
    orderConfirmed: string;
    orderShipped: string;
    orderDelivered: string;
    passwordReset: string;
  };
  payment: {
    vnpayTmnCode?: string;
    isSandbox: boolean;
  };
}

const ProvinceFeeSchema = new Schema<IProvinceFee>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  fee: { type: Number, required: true, default: 30000 }
}, { _id: false });

const SettingsSchema = new Schema<ISettings>(
  {
    storeInfo: {
      name: { type: String, required: true, default: 'Fashion Store' },
      description: { type: String },
      phone: { type: String },
      email: { type: String },
      logo: { type: String },
      socials: {
        facebook: { type: String },
        instagram: { type: String },
        tiktok: { type: String },
        shopee: { type: String },
        lazada: { type: String }
      }
    },
    shipping: {
      type: { type: String, enum: ['flat', 'province'], default: 'flat' },
      flatRate: { type: Number, default: 30000 },
      freeShippingThreshold: { type: Number, default: 500000 },
      provinces: [ProvinceFeeSchema]
    },
    emailTemplates: {
      orderConfirmed: { type: String, default: '<p>Cảm ơn {{customerName}} đã đặt hàng. Mã đơn hàng của bạn là {{orderCode}}.</p>' },
      orderShipped: { type: String, default: '<p>Đơn hàng {{orderCode}} của bạn đang được giao.</p>' },
      orderDelivered: { type: String, default: '<p>Đơn hàng {{orderCode}} đã giao thành công.</p>' },
      passwordReset: { type: String, default: '<p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn.</p>' }
    },
    payment: {
      vnpayTmnCode: { type: String },
      isSandbox: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// We will only ever have one settings document
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
