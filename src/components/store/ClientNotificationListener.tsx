'use client';

import { useOrderNotifications } from '@/hooks/useOrderNotifications';

export function ClientNotificationListener() {
  useOrderNotifications();
  return null;
}
