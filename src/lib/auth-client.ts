import type { UserSession } from "@/types/auth";

const ACCESS_TOKEN_KEY = "olms_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function fetchCurrentUser(): Promise<UserSession | null> {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  const payload = await response.json();
  return payload.user as UserSession;
}

export async function refreshCurrentUser(): Promise<{ user: UserSession; accessToken: string } | null> {
  const response = await fetch("/api/auth/refresh", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return {
    user: payload.user as UserSession,
    accessToken: payload.accessToken as string,
  };
}

export async function bootstrapCurrentUser(): Promise<UserSession | null> {
  const currentUser = await fetchCurrentUser();
  if (currentUser) {
    return currentUser;
  }

  const refreshed = await refreshCurrentUser();
  if (!refreshed) {
    return null;
  }

  setAccessToken(refreshed.accessToken);
  return refreshed.user;
}
