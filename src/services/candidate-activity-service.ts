import { apiFetch } from "@/lib/api";
import type { CandidateActivityItem } from "@/types/candidate";

const basePath = "/api/candidates";

export async function getCandidateActivities(candidateId: string) {
  return apiFetch<{ data: CandidateActivityItem[] }>(`${basePath}/${candidateId}/activities`);
}
