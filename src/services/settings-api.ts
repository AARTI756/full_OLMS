import { apiFetch } from "@/lib/api";
import type { SettingsResponse, SettingsUpdateInput } from "@/types/settings";

const basePath = "/api/settings";

export async function getSettings() {
  return apiFetch<SettingsResponse>(basePath);
}

export async function patchSettings(data: SettingsUpdateInput) {
  return apiFetch<SettingsResponse>(basePath, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
