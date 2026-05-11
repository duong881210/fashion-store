import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'order' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  chatUnread: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead'>) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  incrementChatUnread: () => void;
  resetChatUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  chatUnread: 0,
  addNotification: (notification) => set((state) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      isRead: false,
    };
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  incrementChatUnread: () => set((state) => ({
    chatUnread: state.chatUnread + 1,
  })),
  resetChatUnread: () => set({ chatUnread: 0 }),
}));
