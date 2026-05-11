'use client';

import { useAdminNotifications } from '@/hooks/useAdminNotifications';

export function AdminNotificationListener() {
  useAdminNotifications();
  return null;
}
