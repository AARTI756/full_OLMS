import { apiFetch } from "@/lib/api";
import type {
  OfferTemplateListResponse,
  TemplateDetail,
  TemplateVersionListResponse,
} from "@/types/template";

const basePath = "/api/templates";

export async function getTemplates(params: URLSearchParams) {
  return apiFetch<OfferTemplateListResponse>(`${basePath}?${params.toString()}`);
}

export async function getTemplate(templateId: string) {
  return apiFetch<TemplateDetail>(`${basePath}/${templateId}`);
}

export async function createTemplate(data: {
  title: string;
  description?: string | null;
  category: string;
  content: string;
  isActive?: boolean;
  isDraft?: boolean;
}) {
  return apiFetch<{ id: string }>(basePath, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTemplate(templateId: string, data: {
  title: string;
  description?: string | null;
  category: string;
  content: string;
  isActive: boolean;
  isDraft?: boolean;
}) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function autosaveTemplate(templateId: string, data: {
  title?: string;
  description?: string | null;
  category?: string;
  content?: string;
  isActive?: boolean;
  isDraft?: boolean;
}) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function archiveTemplate(templateId: string) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}`, { method: "DELETE" });
}

export async function restoreTemplate(templateId: string) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}/restore`, { method: "POST" });
}

export async function duplicateTemplate(templateId: string) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}/duplicate`, { method: "POST" });
}

export async function getTemplateVersions(templateId: string) {
  return apiFetch<TemplateVersionListResponse>(`${basePath}/${templateId}/versions`);
}

export async function restoreTemplateVersion(templateId: string, versionId: string) {
  return apiFetch<{ id: string }>(`${basePath}/${templateId}/versions/${versionId}`, { method: "POST" });
}

export async function renderTemplate(templateId: string, options?: { offerId?: string }) {
  const params = new URLSearchParams();
  if (options?.offerId) {
    params.set('offerId', options.offerId);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{ rendered: string }>(`${basePath}/${templateId}/render${query}`);
}
