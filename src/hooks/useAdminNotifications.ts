'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { toast } from 'sonner';

export function useAdminNotifications() {
  const socket = useSocket();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  // Use a ref to ensure audio object is only created on client
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We can use a simple beep using Web Audio API instead of an audio file
    const playChime = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (err) {
        console.error('Audio play failed', err);
      }
    };

    if (!socket) return;

    const handleNewOrder = (data: { orderId: string; orderCode: string; customerName: string; total: number; createdAt: string }) => {
      playChime();
      
      toast.success(`Đơn hàng mới: ${data.orderCode}`, {
        description: `Khách hàng ${data.customerName} vừa đặt hàng trị giá ${data.total.toLocaleString('vi-VN')}đ`,
      });

      addNotification({
        type: 'order',
        title: `Đơn hàng mới #${data.orderCode}`,
        message: `Khách hàng ${data.customerName} vừa đặt hàng trị giá ${data.total.toLocaleString('vi-VN')}đ`,
        createdAt: new Date().toISOString(),
        link: `/admin/orders/${data.orderId}`,
      });
    };

    const handleNewChat = (data: { sessionId: string; preview: string; customerName: string }) => {
      playChime();
      toast('Tin nhắn mới', {
        description: `${data.customerName}: ${data.preview}`,
      });
      useNotificationStore.getState().incrementChatUnread();
    };

    socket.on('order:new', handleNewOrder);
    socket.on('chat:new_message', handleNewChat);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('chat:new_message', handleNewChat);
    };
  }, [socket, addNotification]);
}
