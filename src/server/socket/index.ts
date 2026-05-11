import { Server, Socket } from 'socket.io';
import connectDB from '../db/index';
import { User } from '../db/models/User';

export interface IChatMessage {
  _id: string;
  sessionId: string;
  sender: string;
  senderRole: string;
  content: string;
  type: 'text' | 'image' | 'order_link';
  metadata?: {
    orderId: string;
    orderCode: string;
    orderStatus: string;
    orderTotal: number;
  };
  isRead: boolean;
  createdAt: string;
}

export interface ServerToClientEvents {
  'order:new': (data: { orderId: string; orderCode: string; customerName: string; total: number; createdAt: string }) => void;
  'order:status_updated': (data: { orderId: string; orderCode: string; newStatus: string; message: string }) => void;
  'order:cancelled': (data: { orderId: string; orderCode: string; customerName: string }) => void;
  'chat:receive': (msg: IChatMessage) => void;
  'chat:typing': (data: { sessionId: string; isTyping: boolean; senderRole: string }) => void;
  'chat:new_message': (data: { sessionId: string; preview: string; customerName: string }) => void;
  'inventory:low': (data: { productId: string; productName: string; color: string; size: string; stock: number }) => void;
}

export interface ClientToServerEvents {
  'chat:join_session': (sessionId: string) => void;
  'chat:send': (data: { sessionId: string; content: string; type: 'text'|'image' }) => void;
  'chat:typing': (data: { sessionId: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {}

export interface SocketData { 
  userId: string; 
  role: 'customer' | 'admin'; 
}

export function initSocketServer(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized: No token provided'));
      
      // The token is simply the userId in this case, securely passed from an authenticated client session.
      await connectDB();
      const user = await User.findById(token).lean();
      
      if (!user) return next(new Error('Unauthorized: Invalid user'));

      socket.data = { 
        userId: user._id.toString(), 
        role: user.role 
      };
      
      next();
    } catch (error) {
      next(new Error('Unauthorized: Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId}, Role: ${socket.data.role})`);

    // Join appropriate rooms
    if (socket.data.role === 'admin') {
      socket.join('admin_room');
    } else {
      socket.join(`user_${socket.data.userId}`);
    }

    // Chat events
    socket.on('chat:join_session', (sessionId) => {
      socket.join(`chat_${sessionId}`);
    });

    socket.on('chat:send', async (data) => {
      // The message is already saved via tRPC, or we can save it here.
      // The prompt says "sendMessage (protected): save to DB. Socket.io delivery happens separately."
      // BUT then "socket.on('chat:send', async (data) => { const msg = await ChatMessage.create(...) })"
      // Wait, let's follow the prompt exactly: save in socket.on and emit.
      try {
        const { ChatMessage } = await import('../db/models/ChatMessage');
        const msg = await ChatMessage.create({
          sessionId: data.sessionId,
          sender: socket.data.userId,
          senderRole: socket.data.role,
          content: data.content,
          type: data.type,
          isRead: false
        });
        
        const populatedMsg = JSON.parse(JSON.stringify(msg));

        io.to(`chat_${data.sessionId}`).emit('chat:receive', populatedMsg);
        
        if (socket.data.role === 'customer') {
          const user = await User.findById(socket.data.userId).select('name').lean();
          io.to('admin_room').emit('chat:new_message', {
            sessionId: data.sessionId,
            preview: data.content.slice(0, 50),
            customerName: user?.name ?? 'Khách'
          });
        }
      } catch (err) {
        console.error('Error saving chat message', err);
      }
    });

    socket.on('chat:typing', ({ sessionId, isTyping }) => {
      socket.to(`chat_${sessionId}`).emit('chat:typing', {
        sessionId,
        isTyping,
        senderRole: socket.data.role
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
