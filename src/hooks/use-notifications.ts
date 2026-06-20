'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notifications-api';
import type { NotificationListFilters } from '@/types/notification';

export function useNotifications(filters: NotificationListFilters = {}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      return getNotifications(params);
    },
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
