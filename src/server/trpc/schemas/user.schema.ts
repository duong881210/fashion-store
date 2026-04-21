import { z } from 'zod'; // Next 16 Zod 4 syntax

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain uppercase, lowercase and number')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(9),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  street: z.string().min(1),
  isDefault: z.boolean().optional()
});

export const updateAddressSchema = addressSchema.extend({
  addressId: z.string()
});

export const deleteAddressSchema = z.object({
  addressId: z.string()
});

export const toggleWishlistSchema = z.object({
  productId: z.string()
});

export const toggleActiveSchema = z.object({
  userId: z.string()
});

export const getAllUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional()
});
