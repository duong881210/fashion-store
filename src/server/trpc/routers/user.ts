import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../middleware';
import { User, IUser } from '../../db/models/User';
import connectDB from '../../db';
import { TRPCError } from '@trpc/server';
import {
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  toggleWishlistSchema,
  toggleActiveSchema,
  getAllUsersSchema
} from '../schemas/user.schema';

export const userRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Password gets hashed in the pre-save hook
      const user = await User.create({
        name: input.name,
        email: input.email,
        password: input.password,
        role: 'customer',
      });

      const userObj = user.toObject();
      delete userObj.password;

      return userObj;
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id).select('-password');
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return user;
    }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findByIdAndUpdate(
        ctx.session.user.id,
        { $set: input },
        { new: true }
      ).select('-password');
      return user;
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!user.password) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Account uses OAuth. Cannot change password natively.' });
      const isMatch = await user.comparePassword(input.currentPassword);
      if (!isMatch) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Incorrect current password' });

      user.password = input.newPassword;
      await user.save();
      return true;
    }),

  addAddress: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      if (input.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      } else if (user.addresses.length === 0) {
        input.isDefault = true;
      }

      user.addresses.push(input as any);
      await user.save();
      
      return user.addresses;
    }),

  updateAddress: protectedProcedure
    .input(updateAddressSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const address = user.addresses.id(input.addressId);
      if (!address) throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' });

      if (input.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }

      Object.assign(address, input);
      await user.save();

      return user.addresses;
    }),

  deleteAddress: protectedProcedure
    .input(deleteAddressSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      user.addresses.pull({ _id: input.addressId });
      await user.save();

      return user.addresses;
    }),

  toggleWishlist: protectedProcedure
    .input(toggleWishlistSchema)
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const user = await User.findById(ctx.session.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const index = user.wishlist.indexOf(input.productId as any);
      if (index > -1) {
        user.wishlist.splice(index, 1);
      } else {
        user.wishlist.push(input.productId as any);
      }

      await user.save();
      return user.wishlist;
    }),

  getAll: adminProcedure
    .input(getAllUsersSchema)
    .query(async ({ input }) => {
      await connectDB();
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const query = search 
        ? { 
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ] 
          } 
        : {};

      const [users, total] = await Promise.all([
        User.find(query).skip(skip).limit(limit).select('-password'),
        User.countDocuments(query)
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }),

  toggleActive: adminProcedure
    .input(toggleActiveSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const user = await User.findById(input.userId);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      user.isActive = !user.isActive;
      await user.save();

      return user;
    })
});
