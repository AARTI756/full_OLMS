'use client';

import { useQuery } from '@tanstack/react-query';
import { getCandidateActivities } from '@/services/candidate-activity-service';
import type { CandidateActivityItem } from '@/types/candidate';

export function useCandidateActivities(candidateId: string) {
  return useQuery<{ data: CandidateActivityItem[] }, Error, { data: CandidateActivityItem[] }>({
    queryKey: ['candidates', candidateId, 'activities'],
    queryFn: () => getCandidateActivities(candidateId),
    staleTime: 1000 * 60,
  });
}
