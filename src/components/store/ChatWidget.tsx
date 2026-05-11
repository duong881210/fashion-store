'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Message {
  _id: string;
  senderRole: string;
  content: string;
  type: string;
  createdAt: string;
  metadata?: any;
}

export function ChatWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: sessionData } = trpc.chat.getOrCreateSession.useQuery(undefined, {
    enabled: !!session?.user && isOpen,
  });

  const sessionId = sessionData?.sessionId;

  const { data: historyData } = trpc.chat.getMessages.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId && isOpen }
  );

  useEffect(() => {
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [isOpen, unreadCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, adminTyping, isOpen]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit('chat:join_session', sessionId);

    const handleReceive = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleTyping = (data: { sessionId: string; isTyping: boolean; senderRole: string }) => {
      if (data.sessionId === sessionId && data.senderRole === 'admin') {
        setAdminTyping(data.isTyping);
      }
    };

    socket.on('chat:receive', handleReceive);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:receive', handleReceive);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, sessionId, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !sessionId) return;

    const messageData = {
      sessionId,
      content: inputValue.trim(),
      type: 'text',
    };

    socket.emit('chat:send', messageData);
    setInputValue('');
    socket.emit('chat:typing', { sessionId, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (!socket || !sessionId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('chat:typing', { sessionId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('chat:typing', { sessionId, isTyping: false });
    }, 2000);
  };

  // Hide widget completely on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (!session) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle size={28} />
          </button>
        ) : (
          <div className="w-[320px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
              <span className="font-medium">Hỗ trợ khách hàng</span>
              <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center text-muted-foreground flex flex-col items-center gap-4">
              <MessageCircle size={48} className="opacity-20" />
              <p>Vui lòng đăng nhập để gửi tin nhắn cho chúng tôi.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="w-[320px] h-[460px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Hỗ trợ khách hàng</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-muted/30">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Hãy gửi tin nhắn đầu tiên của bạn...
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isCustomer = msg.senderRole === 'customer';
                return (
                  <div key={msg._id || idx} className={`flex flex-col max-w-[85%] ${isCustomer ? 'self-end' : 'self-start'}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        isCustomer
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted border border-border text-foreground rounded-tl-sm'
                      }`}
                    >
                      {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      {msg.type === 'order_link' && (
                        <div className="flex flex-col gap-2">
                          <div className="font-medium text-xs opacity-90 border-b pb-1 mb-1 border-current/20">
                            📦 Đơn hàng {msg.metadata?.orderCode}
                          </div>
                          <p className="text-xs">Trạng thái: {msg.metadata?.orderStatus}</p>
                          <p className="text-xs font-semibold">Tổng: {msg.metadata?.orderTotal?.toLocaleString('vi-VN')}đ</p>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] text-muted-foreground mt-1 ${isCustomer ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                );
              })
            )}
            
            {adminTyping && (
              <div className="self-start bg-muted border border-border text-foreground p-3 rounded-2xl rounded-tl-sm max-w-[85%] flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-background border-t border-border shrink-0">
            <div className="flex items-center gap-2 bg-muted rounded-full pr-1 pl-3 py-1 border border-transparent focus-within:border-primary/50 transition-colors">
              <button className="text-muted-foreground hover:text-foreground p-1" title="Chưa hỗ trợ gửi ảnh">
                <ImageIcon size={18} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-muted-foreground shrink-0 transition-transform active:scale-95"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
