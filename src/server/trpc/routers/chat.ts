import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { router, protectedProcedure, adminProcedure } from '../middleware';
import { ChatMessage } from '../../db/models/ChatMessage';
import { User } from '../../db/models/User';
import connectDB from '../../db';

export const chatRouter = router({
  getOrCreateSession: protectedProcedure.query(async ({ ctx }) => {
    await connectDB();
    const userId = ctx.session.user.id;
    
    // Look for an existing session where the user is the sender (for a customer)
    // Or if admin, they just open sessions from the list.
    // Assuming this procedure is mostly called by customers when opening the widget.
    const existingMessage = await ChatMessage.findOne({ sender: userId }).sort({ createdAt: -1 }).lean();
    
    if (existingMessage && existingMessage.sessionId) {
      return { sessionId: existingMessage.sessionId };
    }
    
    // Create new session ID
    const newSessionId = `chat_${userId}_${Date.now()}`;
    return { sessionId: newSessionId };
  }),

  getMessages: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      cursor: z.string().optional(), // timestamp
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      await connectDB();
      const { sessionId, cursor, limit } = input;
      
      const query: any = { sessionId };
      if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
      }

      const messages = await ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.createdAt.toISOString();
      }

      return {
        messages: JSON.parse(JSON.stringify(messages.reverse())), // return newest at the bottom
        nextCursor,
      };
    }),

  getSessions: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      unreadOnly: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      await connectDB();
      
      const skip = (input.page - 1) * input.limit;
      
      // Aggregation to get unique sessions
      const pipeline: any[] = [
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$sessionId',
            latestMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$senderRole', 'customer'] }] }, 1, 0]
              }
            }
          }
        }
      ];

      if (input.unreadOnly) {
        pipeline.push({ $match: { unreadCount: { $gt: 0 } } });
      }

      pipeline.push(
        { $sort: { 'latestMessage.createdAt': -1 } },
        { $skip: skip },
        { $limit: input.limit }
      );

      const sessions = await ChatMessage.aggregate(pipeline);

      // Populate user info
      const populatedSessions = await Promise.all(
        sessions.map(async (s) => {
          // The customer ID is embedded in the sessionId if they haven't sent a message,
          // but we can just use the sender ID from the messages.
          // Let's find the customer associated with this session.
          const customerMsg = await ChatMessage.findOne({ sessionId: s._id, senderRole: 'customer' }).select('sender').lean();
          let user = null;
          if (customerMsg) {
             user = await User.findById(customerMsg.sender).select('name email avatar').lean();
          } else if (s._id.startsWith('chat_')) {
             const parts = s._id.split('_');
             if (parts[1]) user = await User.findById(parts[1]).select('name email avatar').lean();
          }

          return {
            sessionId: s._id,
            latestMessage: s.latestMessage,
            unreadCount: s.unreadCount,
            customer: user ? {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.avatar
            } : null
          };
        })
      );

      // We should filter out sessions based on search if search is provided
      let result = populatedSessions;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        result = result.filter(s => s.customer?.name.toLowerCase().includes(searchLower) || s.customer?.email.toLowerCase().includes(searchLower));
      }

      return JSON.parse(JSON.stringify(result));
    }),

  markRead: adminProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await connectDB();
      await ChatMessage.updateMany(
        { sessionId: input.sessionId, senderRole: 'customer', isRead: false },
        { $set: { isRead: true } }
      );
      return { success: true };
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string(),
      type: z.enum(['text', 'image', 'order_link']),
      metadata: z.object({
        orderId: z.string().optional(),
        orderCode: z.string().optional(),
        orderStatus: z.string().optional(),
        orderTotal: z.number().optional(),
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      
      const message = new ChatMessage({
        sessionId: input.sessionId,
        sender: ctx.session.user.id,
        senderRole: ctx.session.user.role,
        content: input.content,
        type: input.type,
        metadata: input.metadata,
        isRead: false
      });

      await message.save();
      
      return JSON.parse(JSON.stringify(message));
    })
});
