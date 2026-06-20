import { useQuery } from '@tanstack/react-query';
import { getRecruiterList, getRecruiterById } from '@/services/recruiter-api';

export function useRecruiterList() {
  return useQuery({
    queryKey: ['recruiters'],
    queryFn: getRecruiterList,
  });
}

export function useRecruiterDetail(id: string) {
  return useQuery({
    queryKey: ['recruiter', id],
    queryFn: () => getRecruiterById(id),
    enabled: Boolean(id),
  });
}
