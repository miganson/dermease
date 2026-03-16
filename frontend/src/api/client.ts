import { API_BASE_URL } from "../lib/constants";
import { loadStoredSession, persistSession } from "../lib/storage";
import type { ApiEnvelope, AuthSession } from "../types/domain";

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const session = loadStoredSession();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = (await response.json()) as ApiEnvelope<T> & {
    errors?: unknown;
    details?: unknown;
    message?: string;
  };

  if (!response.ok) {
    if (response.status === 401 && session?.refreshToken && options.auth !== false) {
      const refreshed = await refreshSession(session);
      if (refreshed) {
        return apiRequest<T>(path, options);
      }
    }

    throw new Error(payload.message ?? "Request failed");
  }

  return payload.data;
}

async function refreshSession(session: AuthSession) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken
      })
    });

    if (!response.ok) {
      persistSession(null);
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>;

    const nextSession = {
      ...session,
      accessToken: payload.data.accessToken,
      refreshToken: payload.data.refreshToken
    };

    persistSession(nextSession);
    return nextSession;
  } catch {
    persistSession(null);
    return null;
  }
}
