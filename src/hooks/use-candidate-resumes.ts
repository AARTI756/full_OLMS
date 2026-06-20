'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCandidateResumes, deleteCandidateResume } from '@/services/candidate-resume-service';
import type { CandidateResumeItem } from '@/types/candidate';

export function useCandidateResumes(candidateId: string) {
  const queryClient = useQueryClient();

  const resumesQuery = useQuery<{ data: CandidateResumeItem[] }, Error, { data: CandidateResumeItem[] }>({
    queryKey: ['candidates', candidateId, 'resumes'],
    queryFn: () => getCandidateResumes(candidateId),
    staleTime: 1000 * 60,
  });

  const deleteResume = useMutation<{ success: boolean }, Error, string, { previous?: { data: CandidateResumeItem[] } }>({
    mutationFn: (resumeId) => deleteCandidateResume(candidateId, resumeId),
    onMutate: async (resumeId) => {
      await queryClient.cancelQueries({ queryKey: ['candidates', candidateId, 'resumes'] });
      const previous = queryClient.getQueryData<{ data: CandidateResumeItem[] }>(['candidates', candidateId, 'resumes']);
      if (previous) {
        queryClient.setQueryData(['candidates', candidateId, 'resumes'], {
          data: previous.data.filter((resume) => resume.id !== resumeId),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, onMutateResult) => {
      if (onMutateResult?.previous) {
        queryClient.setQueryData(['candidates', candidateId, 'resumes'], onMutateResult.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', candidateId, 'resumes'] });
    },
  });

  return { resumesQuery, deleteResume };
}
