import { apiFetch } from "@/lib/api";
import type { CandidateNoteItem } from "@/types/candidate";

const basePath = "/api/candidates";

export async function getCandidateNotes(candidateId: string) {
  return apiFetch<{ data: CandidateNoteItem[] }>(`${basePath}/${candidateId}/notes`);
}

export async function createCandidateNote(candidateId: string, content: string) {
  return apiFetch<CandidateNoteItem>(`${basePath}/${candidateId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function updateCandidateNote(candidateId: string, noteId: string, content: string) {
  return apiFetch<CandidateNoteItem>(`${basePath}/${candidateId}/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export async function deleteCandidateNote(candidateId: string, noteId: string) {
  return apiFetch<{ success: boolean }>(`${basePath}/${candidateId}/notes/${noteId}`, {
    method: "DELETE",
  });
}
