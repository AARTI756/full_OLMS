'use client';

import { apiFetch } from '@/lib/api';
import type { SearchResponse } from '@/types/search';

export async function searchEntities(query: string) {
  return apiFetch<SearchResponse>(`/api/search?query=${encodeURIComponent(query)}`);
}
