import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../middleware';
import { Settings } from '../../db/models/Settings';
import connectDB from '../../db';

const PROVINCES = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", 
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", 
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", 
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", 
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", 
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", 
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", 
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", 
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const defaultProvincesData = PROVINCES.map((p, index) => ({
  code: index.toString().padStart(2, '0'),
  name: p,
  fee: 30000
}));

const settingsSchema = z.object({
  storeInfo: z.object({
    name: z.string(),
    description: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    logo: z.string().optional(),
    socials: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      shopee: z.string().optional(),
      lazada: z.string().optional(),
    })
  }),
  shipping: z.object({
    type: z.enum(['flat', 'province']),
    flatRate: z.number(),
    freeShippingThreshold: z.number(),
    provinces: z.array(z.object({
      code: z.string(),
      name: z.string(),
      fee: z.number()
    }))
  }),
  emailTemplates: z.object({
    orderConfirmed: z.string(),
    orderShipped: z.string(),
    orderDelivered: z.string(),
    passwordReset: z.string(),
  }),
  payment: z.object({
    vnpayTmnCode: z.string().optional(),
    isSandbox: z.boolean(),
  })
});

export const settingsRouter = router({
  getSettings: publicProcedure.query(async () => {
    await connectDB();
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        storeInfo: {
          name: 'Fashion Store',
          socials: {}
        },
        shipping: {
          type: 'flat',
          flatRate: 30000,
          freeShippingThreshold: 500000,
          provinces: defaultProvincesData
        },
        emailTemplates: {
          orderConfirmed: '<p>Cảm ơn {{customerName}} đã đặt hàng. Mã đơn hàng của bạn là {{orderCode}}.</p>',
          orderShipped: '<p>Đơn hàng {{orderCode}} của bạn đang được giao.</p>',
          orderDelivered: '<p>Đơn hàng {{orderCode}} đã giao thành công.</p>',
          passwordReset: '<p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn.</p>'
        },
        payment: {
          isSandbox: true
        }
      });
    }

    // Ensure provinces are populated if missing for some reason
    if (!settings.shipping.provinces || settings.shipping.provinces.length === 0) {
      settings.shipping.provinces = defaultProvincesData;
      await settings.save();
    }

    return settings;
  }),

  updateSettings: adminProcedure
    .input(settingsSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const settings = await Settings.findOneAndUpdate(
        {},
        { $set: input },
        { new: true, upsert: true }
      );
      
      return settings;
    })
});
