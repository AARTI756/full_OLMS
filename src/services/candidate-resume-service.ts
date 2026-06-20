import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-client";
import type { CandidateResumeItem } from "@/types/candidate";

const basePath = "/api/candidates";

export async function getCandidateResumes(candidateId: string) {
  return apiFetch<{ data: CandidateResumeItem[] }>(`${basePath}/${candidateId}/resumes`);
}

export async function deleteCandidateResume(candidateId: string, resumeId: string) {
  return apiFetch<{ success: boolean }>(`${basePath}/${candidateId}/resumes/${resumeId}`, {
    method: "DELETE",
  });
}

export async function downloadResume(fileUrl: string) {
  const token = getAccessToken();
  const response = await fetch(fileUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Unable to download resume.");
  }

  const contentDisposition = response.headers.get("content-disposition");
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? fileUrl.split("/").pop() ?? "resume";

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
