"use client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const STORAGE_KEY = "tt_tokens";

let tokens: AuthTokens | null = null;
let refreshPromise: Promise<AuthTokens | null> | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const tokenStorage = {
  load(): AuthTokens | null {
    if (tokens) {
      return tokens;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      tokens = JSON.parse(raw) as AuthTokens;
      return tokens;
    } catch (error) {
      console.error("Failed to parse stored tokens", error);
      return null;
    }
  },
  save(next: AuthTokens | null) {
    tokens = next;
    if (typeof window === "undefined") {
      return;
    }

    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};

export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorizedCallback = callback;
}

async function refreshTokens(): Promise<AuthTokens | null> {
  const currentTokens = tokenStorage.load();
  if (!currentTokens?.refreshToken) {
    tokenStorage.save(null);
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentTokens.refreshToken })
      });

      if (!response.ok) {
        tokenStorage.save(null);
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return null;
      }

      const data = (await response.json()) as { accessToken: string; refreshToken?: string; expiresIn?: number };
      const nextTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? currentTokens.refreshToken,
        expiresAt: Date.now() + (data.expiresIn ?? 15 * 60) * 1000
      };
      tokenStorage.save(nextTokens);
      return nextTokens;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export interface RequestOptions extends RequestInit {
  auth?: boolean;
  skipRefresh?: boolean;
}

async function makeRequest<T>(path: string, { auth = true, skipRefresh = false, headers, ...init }: RequestOptions = {}): Promise<T> {
  let activeTokens = tokenStorage.load();

  if (auth && activeTokens?.accessToken) {
    headers = {
      ...headers,
      Authorization: `Bearer ${activeTokens.accessToken}`
    };
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  if (response.status === 401 && auth && !skipRefresh) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw new ApiError("Unauthorized", 401, null);
    }
    const nextHeaders = { ...(headers ?? {}) } as Record<string, string>;
    delete nextHeaders.Authorization;
    return makeRequest<T>(path, { auth, headers: nextHeaders, ...init, skipRefresh: true });
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(typeof data === "string" ? data : response.statusText, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => makeRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    makeRequest<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    makeRequest<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    makeRequest<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) => makeRequest<T>(path, { ...options, method: "DELETE" }),
  setTokens(next: AuthTokens | null) {
    tokenStorage.save(next);
  },
  getTokens() {
    return tokenStorage.load();
  }
};
