'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, CheckCircle2, ChevronRight, Package, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSocket } from '@/components/providers/SocketProvider';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotificationStore } from '@/stores/useNotificationStore';

export default function AdminChatPage() {
  const socket = useSocket();
  const utils = trpc.useUtils();
  const resetChatUnread = useNotificationStore(state => state.resetChatUnread);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [customerTyping, setCustomerTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const { data: sessionsData, isLoading: sessionsLoading } = trpc.chat.getSessions.useQuery({
    page: 1,
    limit: 20,
    search: searchQuery,
    unreadOnly,
  });

  const { data: historyData, isLoading: historyLoading } = trpc.chat.getMessages.useQuery(
    { sessionId: activeSessionId! },
    { enabled: !!activeSessionId }
  );

  const markReadMutation = trpc.chat.markRead.useMutation({
    onSuccess: () => {
      utils.chat.getSessions.invalidate();
      resetChatUnread();
    }
  });

  // Load messages
  useEffect(() => {
    if (historyData?.messages) {
      setMessages(historyData.messages);
      messagesEndRef.current?.scrollIntoView();
      
      // Mark read when opening session
      if (activeSessionId) {
        markReadMutation.mutate({ sessionId: activeSessionId });
      }
    }
  }, [historyData, activeSessionId]);

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: any) => {
      if (msg.sessionId === activeSessionId) {
        setMessages((prev) => [...prev, msg]);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Mark as read immediately if it's the active session and from customer
        if (msg.senderRole === 'customer' && activeSessionId) {
          markReadMutation.mutate({ sessionId: activeSessionId });
        }
      } else {
        // Refetch sessions to update list / badges
        utils.chat.getSessions.invalidate();
      }
    };

    const handleTyping = (data: { sessionId: string; isTyping: boolean; senderRole: string }) => {
      if (data.sessionId === activeSessionId && data.senderRole === 'customer') {
        setCustomerTyping(data.isTyping);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    socket.on('chat:receive', handleReceive);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:receive', handleReceive);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, activeSessionId, utils]);

  // Join session room when active changes
  useEffect(() => {
    if (socket && activeSessionId) {
      socket.emit('chat:join_session', activeSessionId);
    }
  }, [socket, activeSessionId]);

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !activeSessionId) return;

    socket.emit('chat:send', {
      sessionId: activeSessionId,
      content: inputValue.trim(),
      type: 'text',
    });
    setInputValue('');
    socket.emit('chat:typing', { sessionId: activeSessionId, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (!socket || !activeSessionId) return;

    socket.emit('chat:typing', { sessionId: activeSessionId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { sessionId: activeSessionId, isTyping: false });
    }, 2000);
  };

  const quickReplies = [
    "Xin chào! Mình có thể giúp gì cho bạn?",
    "Cảm ơn bạn đã liên hệ.",
    "Bạn vui lòng cung cấp mã đơn hàng nhé.",
    "Đơn hàng của bạn đang được xử lý.",
  ];

  const activeSessionDetails = sessionsData?.find((s: any) => s.sessionId === activeSessionId);

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel: Sessions List */}
      <div className="w-80 flex flex-col bg-card border border-border rounded-xl overflow-hidden shrink-0 shadow-sm">
        <div className="p-4 border-b border-border space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm khách hàng..." 
              className="pl-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="text-sm cursor-pointer">Chỉ hiện chưa đọc</Label>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Đang tải...</div>
          ) : sessionsData?.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Không tìm thấy cuộc trò chuyện nào.</div>
          ) : (
            <div className="flex flex-col">
              {sessionsData?.map((session: any) => (
                <button
                  key={session.sessionId}
                  onClick={() => setActiveSessionId(session.sessionId)}
                  className={`flex items-start gap-3 p-4 text-left border-b border-border transition-colors hover:bg-muted/50 ${
                    activeSessionId === session.sessionId ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={session.customer?.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.customer?.name?.charAt(0).toUpperCase() || 'K'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm truncate pr-2">
                        {session.customer?.name || 'Khách Vãng Lai'}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {session.latestMessage?.createdAt 
                          ? formatDistanceToNow(new Date(session.latestMessage.createdAt), { addSuffix: true, locale: vi })
                          : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${session.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {session.latestMessage?.senderRole === 'admin' ? 'Bạn: ' : ''}
                        {session.latestMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                      {session.unreadCount > 0 && (
                        <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center shrink-0 bg-destructive hover:bg-destructive text-[10px]">
                          {session.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel: Active Chat */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        {!activeSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare size={64} className="opacity-20 mb-4" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activeSessionDetails?.customer?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activeSessionDetails?.customer?.name?.charAt(0).toUpperCase() || 'K'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm">{activeSessionDetails?.customer?.name || 'Khách Vãng Lai'}</h2>
                  <p className="text-xs text-muted-foreground">{activeSessionDetails?.customer?.email || 'Chưa cập nhật email'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Xem hồ sơ <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6 bg-[url('/chat-pattern.png')] bg-repeat bg-[length:200px]">
              {historyLoading ? (
                <div className="text-center text-sm text-muted-foreground">Đang tải tin nhắn...</div>
              ) : (
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div key={msg._id || idx} className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end' : 'self-start'}`}>
                        <div
                          className={`p-3 rounded-2xl ${
                            isAdmin
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted border border-border text-foreground rounded-tl-sm'
                          }`}
                        >
                          {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                          {msg.type === 'order_link' && (
                            <div className="flex flex-col gap-2">
                              <div className="font-medium text-xs opacity-90 border-b pb-1 mb-1 border-current/20 flex items-center gap-1">
                                <Package size={14} /> Đơn hàng {msg.metadata?.orderCode}
                              </div>
                              <p className="text-xs">Trạng thái: {msg.metadata?.orderStatus}</p>
                              <p className="text-xs font-semibold">Tổng: {msg.metadata?.orderTotal?.toLocaleString('vi-VN')}đ</p>
                              <Button variant="secondary" size="sm" className="h-7 text-[10px] mt-1 w-full bg-white/20 hover:bg-white/30 text-current">
                                Xem chi tiết
                              </Button>
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] text-muted-foreground mt-1 flex items-center gap-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                          {isAdmin && (
                            <CheckCircle2 size={12} className={msg.isRead ? 'text-primary' : 'text-muted-foreground/50'} />
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {customerTyping && (
                    <div className="self-start bg-muted border border-border text-foreground p-3 rounded-2xl rounded-tl-sm max-w-[70%] flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-current/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background shrink-0 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickReplies.map((reply, idx) => (
                  <Button 
                    key={idx} 
                    variant="secondary" 
                    size="sm" 
                    className="text-xs shrink-0 rounded-full bg-muted/50"
                    onClick={() => setInputValue(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
                  <ImageIcon size={18} />
                </Button>
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
                  <Package size={18} />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="pr-12 h-10"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 disabled:opacity-50"
                  >
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Temporary import for MessageSquare icon when no session selected
import { MessageSquare } from 'lucide-react';
