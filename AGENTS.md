# ═══════════════════════════════════════════
# PHASE 6 — REAL-TIME (SOCKET.IO 4.8.3)
# ═══════════════════════════════════════════

## PROMPT 6.1 — Socket.io Server Setup & Order Notifications

```
Context: Full project (Phase 1-5) complete. Now adding real-time.
Socket.io 4.8.3 — latest stable.

## ARCHITECTURE: Custom Next.js server for Socket.io
Next.js 16 serverless mode doesn't support Socket.io natively. Use a custom server.

### 1. Custom HTTP Server (`server.ts` at project root)
```typescript
import { createServer } from 'http'
import next from 'next'
import { Server as SocketServer } from 'socket.io'
import { initSocketServer } from './src/server/socket'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res))
  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL, methods: ['GET', 'POST'] },
    // Socket.io 4.8.3 options:
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 }, // recover missed events
  })
  initSocketServer(io)
  // Attach io to global for tRPC access
  ;(global as any).__io = io
  httpServer.listen(3000, () => console.log('Server ready on http://localhost:3000'))
})
```

Update `package.json` scripts:
```json
"dev": "ts-node --esm server.ts",
"build": "next build",
"start": "NODE_ENV=production ts-node --esm server.ts"
```

### 2. Socket.io Server Module (`src/server/socket/index.ts`)

**TypeScript event map:**
```typescript
interface ServerToClientEvents {
  'order:new': (data: { orderId: string; orderCode: string; customerName: string; total: number; createdAt: string }) => void
  'order:status_updated': (data: { orderId: string; orderCode: string; newStatus: string; message: string }) => void
  'order:cancelled': (data: { orderId: string; orderCode: string; customerName: string }) => void
  'chat:receive': (msg: IChatMessage) => void
  'chat:typing': (data: { sessionId: string; isTyping: boolean; senderRole: string }) => void
  'chat:new_message': (data: { sessionId: string; preview: string; customerName: string }) => void
  'inventory:low': (data: { productId: string; productName: string; color: string; size: string; stock: number }) => void
}
interface ClientToServerEvents {
  'chat:join_session': (sessionId: string) => void
  'chat:send': (data: { sessionId: string; content: string; type: 'text'|'image' }) => void
  'chat:typing': (data: { sessionId: string; isTyping: boolean }) => void
}
interface SocketData { userId: string; role: 'customer'|'admin' }
```

**Auth middleware (JWT verification):**
```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('Unauthorized'))
  // Verify NextAuth JWT using same secret
  // Attach decoded { userId, role } to socket.data
  next()
})
```

**Connection handler:** admin → join 'admin_room', customer → join `user_${userId}`

### 3. tRPC Context: attach io
```typescript
// src/server/trpc/context.ts
import { type Server } from 'socket.io'
export const createContext = async () => {
  const session = await auth()
  const io: Server | undefined = (global as any).__io
  return { session, io }
}
```

In Order router's `create` procedure (after transaction commits):
```typescript
ctx.io?.to('admin_room').emit('order:new', { orderId, orderCode, customerName, total, createdAt })
```

In Order router's `updateStatus`:
```typescript
ctx.io?.to(`user_${order.customer}`).emit('order:status_updated', { orderId, orderCode, newStatus, message })
```

### 4. Socket.io Client Provider (`src/components/providers/SocketProvider.tsx`)
```typescript
'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

const SocketContext = createContext<Socket | null>(null)
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    if (!session?.user?.id) return
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: session.user.id }, // Pass session token for server-side auth
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    return () => { socketRef.current?.disconnect() }
  }, [session])
  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>
}
export const useSocket = () => useContext(SocketContext)
```

Add SocketProvider to root layout (inside SessionProvider).

### 5. Customer Notifications Hook (`src/hooks/useOrderNotifications.ts`)
Listen to `order:status_updated` → show sonner toast with appropriate message/icon.
Update tRPC query cache: `utils.order.getMyOrders.invalidate()`.

### 6. Admin Notification System
In admin layout:
- Listen to `order:new` → sonner toast + play chime (Web Audio API short beep) + increment bell badge
- Notification dropdown: list last 10 events from state, "Đánh dấu đã đọc" button
- Zustand store: `useNotificationStore` { notifications[], unreadCount, addNotification, markAllRead }

### QUALITY REQUIREMENTS
- Socket.io 4.8.3: leverage `connectionStateRecovery` for missed events during brief disconnects
- TypeScript: full typed event maps for both ServerToClientEvents and ClientToServerEvents
- Graceful: if `ctx.io` is undefined, log warning but don't crash tRPC procedure
```

---

## PROMPT 6.2 — Live Chat Feature

```
Context: Socket.io server running. Order notifications working. Phase 6 Step 2.

## TASK: Build live chat between customers and admin

### 1. ChatMessage Model (`src/server/db/models/ChatMessage.ts`)
```typescript
{
  sessionId: String (index),         // unique per conversation
  sender: ObjectId ref User,
  senderRole: 'customer' | 'admin',
  content: String,
  type: 'text' | 'image' | 'order_link',
  metadata: {                        // for type: 'order_link'
    orderId: String,
    orderCode: String,
    orderStatus: String,
    orderTotal: Number
  }?,
  isRead: Boolean (default false),
  createdAt: Date (index)
}
```

### 2. Chat tRPC Router (`src/server/trpc/routers/chat.ts`)
- `getOrCreateSession` (protected): find ChatMessage where sessionId based on userId, or create new sessionId (`chat_${userId}_${Date.now()}`)
- `getMessages` (protected): paginated, 50 per page, sorted newest first (reverse display)
- `getSessions` (admin): all unique sessionIds, last message, unread count, customer info (populated)
- `markRead` (admin): update all messages in session with isRead: false → true
- `sendMessage` (protected): save to DB. Socket.io delivery happens separately. Return saved message.

### 3. Chat Socket Events — add to `src/server/socket/index.ts`
```typescript
socket.on('chat:join_session', (sessionId: string) => {
  socket.join(`chat_${sessionId}`)
})

socket.on('chat:send', async (data: { sessionId: string; content: string; type: string }) => {
  const msg = await ChatMessage.create({
    sessionId: data.sessionId,
    sender: socket.data.userId,
    senderRole: socket.data.role,
    content: data.content,
    type: data.type,
    isRead: false
  })
  io.to(`chat_${data.sessionId}`).emit('chat:receive', msg)
  if (socket.data.role === 'customer') {
    const user = await User.findById(socket.data.userId).select('name').lean()
    io.to('admin_room').emit('chat:new_message', {
      sessionId: data.sessionId,
      preview: data.content.slice(0, 50),
      customerName: user?.name ?? 'Khách'
    })
  }
})

socket.on('chat:typing', ({ sessionId, isTyping }: { sessionId: string; isTyping: boolean }) => {
  socket.to(`chat_${sessionId}`).emit('chat:typing', {
    sessionId, isTyping, senderRole: socket.data.role
  })
})
```

### 4. Customer Chat Widget (`src/components/store/ChatWidget.tsx`)
Client Component, fixed bottom-right:
- Collapsed: circular button (chat icon + unread badge)
- Expanded: card 320×460px
- Unauthenticated: "Đăng nhập để chat" prompt
- Authenticated:
  - Header: "Hỗ trợ khách hàng" + green online dot + minimize button
  - Message thread: scrollable, own messages right (gold bg), admin messages left (gray bg)
  - Typing indicator (3 animated dots) when admin typing
  - Image in bottom: text input + send button + optional image upload (Cloudinary)
  - Auto-scroll to bottom on new message using `useRef` + `scrollIntoView`

onMount: `socket.emit('chat:join_session', sessionId)` + load message history.

### 5. Admin Chat Page (`src/app/(admin)/admin/chat/page.tsx`)
Two-panel Client Component:

Left panel (320px):
- Search input (customer name)
- Session list: avatar, name, last message preview (truncated), timestamp, unread count badge (red)
- Active session: highlighted background
- New message via Socket.io: move session to top + increment unread badge
- "Chỉ hiện chưa đọc" toggle

Right panel:
- Header: customer name + email + "Xem hồ sơ" link
- Customer context (collapsible sidebar, 200px): last 3 orders with status
- Message history (infinite scroll upward: load 50 older messages on scroll to top)
- Admin reply input + "Gửi" button
- "Quick Reply" buttons: predefined phrases
- "Gửi thông tin đơn hàng" button → Dialog: select from customer's orders → sends as type 'order_link'

Order link card appearance in chat:
```
┌─────────────────────────────┐
│ 📦 Đơn hàng #FS1A2B3C       │
│ Trạng thái: Đang giao hàng  │
│ Tổng: 450,000đ              │
│ [Xem chi tiết →]            │
└─────────────────────────────┘
```

### 6. Unread badge in Admin Sidebar
Listen to `chat:new_message` in admin layout → increment `useNotificationStore.chatUnread`.
Display badge on "Chat" sidebar item.

### QUALITY REQUIREMENTS
- Messages stored in MongoDB (Socket.io is transport only)
- Load first 50 messages on open, load older on scroll (useInfiniteQuery pattern)
- Mark messages as read when admin opens the session
- Timestamps: use `date-fns` formatDistanceToNow (e.g. "5 phút trước"), update every 60s
```

---

---
