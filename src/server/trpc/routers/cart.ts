import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { router, protectedProcedure } from '../middleware';
import { Cart } from '../../db/models/Cart';
import { Product } from '../../db/models/Product';
import connectDB from '../../db';

export const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    await connectDB();
    const userId = ctx.session.user.id;
    
    let cart = await Cart.findOne({ user: userId }).lean();
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const checkedItems = await Promise.all(cart.items.map(async (item: any) => {
      const product = await Product.findById(item.product).lean();
      if (!product) return { ...item, outOfStock: true };
      
      const variant = product.variants?.find((v: any) => v.color === item.color);
      if (!variant) return { ...item, outOfStock: true };
      
      const sizeObj = variant.sizes.find((s: any) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < 1) return { ...item, outOfStock: true };
      
      return { ...item, outOfStock: sizeObj.stock < item.quantity };
    }));

    return { ...cart, items: checkedItems };
  }),

  addItem: protectedProcedure
    .input(z.object({
      productId: z.string(),
      color: z.string(),
      size: z.string(),
      quantity: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const product = await Product.findById(input.productId);
      if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Sản phẩm không tồn tại' });
      
      const variant = product.variants?.find((v: any) => v.color === input.color);
      if (!variant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Màu sắc không tồn tại' });
      
      const sizeObj = variant.sizes.find((s: any) => s.size === input.size);
      if (!sizeObj || sizeObj.stock < input.quantity) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sản phẩm đã hết hàng hoặc không đủ số lượng' });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (i: any) => i.product.toString() === input.productId && i.color === input.color && i.size === input.size
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += input.quantity;
      } else {
        cart.items.push({
          product: product._id as any,
          productName: product.name,
          productImage: product.images[0] || '',
          color: input.color,
          size: input.size,
          quantity: input.quantity,
          priceAtAdd: product.salePrice || product.price
        });
      }

      await cart.save();
      return cart;
    }),

  updateQuantity: protectedProcedure
    .input(z.object({
      productId: z.string(),
      color: z.string(),
      size: z.string(),
      quantity: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const product = await Product.findById(input.productId);
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
      
      const variant = product.variants?.find((v: any) => v.color === input.color);
      const sizeObj = variant?.sizes.find((s: any) => s.size === input.size);
      if (!sizeObj || sizeObj.stock < input.quantity) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Không đủ số lượng' });
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart not found' });

      const item = cart.items.find(
        (i: any) => i.product.toString() === input.productId && i.color === input.color && i.size === input.size
      );

      if (item) {
        item.quantity = input.quantity;
        await cart.save();
      }
      return cart;
    }),

  removeItem: protectedProcedure
    .input(z.object({
      productId: z.string(),
      color: z.string(),
      size: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      const cart = await Cart.findOne({ user: userId });
      if (!cart) return null;

      cart.items = cart.items.filter(
        (i: any) => !(i.product.toString() === input.productId && i.color === input.color && i.size === input.size)
      );

      await cart.save();
      return cart;
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await connectDB();
    const cart = await Cart.findOne({ user: ctx.session.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }),

  syncGuestCart: protectedProcedure
    .input(z.object({
      guestItems: z.array(z.object({
        productId: z.string(),
        color: z.string(),
        size: z.string(),
        quantity: z.number().min(1)
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const userId = ctx.session.user.id;
      
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      for (const guestItem of input.guestItems) {
        const product = await Product.findById(guestItem.productId);
        if (!product) continue;
        
        const variant = product.variants?.find((v: any) => v.color === guestItem.color);
        const sizeObj = variant?.sizes.find((s: any) => s.size === guestItem.size);
        if (!sizeObj || sizeObj.stock < guestItem.quantity) continue;

        const existingItemIndex = cart.items.findIndex(
          (i: any) => i.product.toString() === guestItem.productId && i.color === guestItem.color && i.size === guestItem.size
        );

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          cart.items.push({
            product: product._id as any,
            productName: product.name,
            productImage: product.images[0] || '',
            color: guestItem.color,
            size: guestItem.size,
            quantity: guestItem.quantity,
            priceAtAdd: product.salePrice || product.price
          });
        }
      }

      await cart.save();
      return cart;
    })
});
