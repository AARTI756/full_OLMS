'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { OfferListFilters, OfferListResponse } from '@/types/offer';

export function useOffers(filters: OfferListFilters) {
  return useQuery<OfferListResponse, Error, OfferListResponse>({
    queryKey: ['offers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.department) params.set('department', filters.department);
      if (filters.recruiter) params.set('recruiter', filters.recruiter);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      params.set('page', String(filters.page));
      params.set('limit', '12');

      return apiFetch<OfferListResponse>(`/api/offers?${params.toString()}`);
    },
  });
}
