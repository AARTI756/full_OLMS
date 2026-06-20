'use client';

import { apiFetch } from '@/lib/api';
import type { RecruiterListResponse, RecruiterDetailResponse } from '@/types/recruiter';

export async function getRecruiterList() {
  return apiFetch<RecruiterListResponse>('/api/recruiters');
}

export async function getRecruiterById(id: string) {
  return apiFetch<RecruiterDetailResponse>(`/api/recruiters/${encodeURIComponent(id)}`);
}
