import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/auth-client";

export async function apiFetch<T>(url: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.ok) {
    return (await response.json()) as T;
  }

  if (response.status === 401 && retry) {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "GET",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const payload = await refreshResponse.json().catch(() => null);
      if (payload?.accessToken) {
        setAccessToken(payload.accessToken);
        return apiFetch(url, options, false);
      }
    }

    clearAccessToken();
  }

  const payload = await response.json().catch(() => null);
  const message = payload?.error || response.statusText || "Request failed";
  throw new Error(message);
}
