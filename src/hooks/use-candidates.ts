'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CandidateListFilters, CandidateListResponse } from '@/types/candidate';

export function useCandidates(filters: CandidateListFilters) {
  return useQuery<CandidateListResponse, Error, CandidateListResponse>({
    queryKey: ['candidates', filters],
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

      return apiFetch<CandidateListResponse>(`/api/candidates?${params.toString()}`);
    },
  });
}
