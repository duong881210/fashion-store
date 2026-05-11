'use client';

import { useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function useOrderNotifications() {
  const socket = useSocket();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (data: { orderId: string; orderCode: string; newStatus: string; message: string }) => {
      toast.info('Cập nhật đơn hàng', {
        description: data.message,
      });
      // Invalidate queries to refresh order list and details
      utils.order.getMyOrders.invalidate();
      utils.order.getById.invalidate({ id: data.orderId });
    };

    socket.on('order:status_updated', handleStatusUpdated);

    return () => {
      socket.off('order:status_updated', handleStatusUpdated);
    };
  }, [socket, utils]);
}
