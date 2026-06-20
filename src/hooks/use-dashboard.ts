'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { DashboardStats } from '@/types/dashboard';

export function useDashboard() {
  return useQuery<DashboardStats, Error, DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => apiFetch<DashboardStats>('/api/dashboard'),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 15,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
