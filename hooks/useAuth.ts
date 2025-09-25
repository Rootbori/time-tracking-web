"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, ApiError, AuthTokens, setOnUnauthorized } from "@/services/api";

export type UserRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  schedule?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  loadProfile: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: AuthUser;
}

const calculateExpiry = (expiresIn?: number) => Date.now() + (expiresIn ?? 15 * 60) * 1000;

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      async login(input) {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<LoginResponse>("/auth/login", input, { auth: false });
          const tokens: AuthTokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: calculateExpiry(data.expiresIn)
          };
          apiClient.setTokens(tokens);
          set({ user: data.user, isLoading: false });
        } catch (error) {
          const message = error instanceof ApiError ? error.message : "Unable to login";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      logout() {
        apiClient.setTokens(null);
        set({ user: null, error: null, isLoading: false });
      },
      setUser(user) {
        set({ user });
      },
      async loadProfile() {
        const profile = await apiClient.get<AuthUser>("/auth/me");
        set({ user: profile });
      },
      hasRole(roleOrRoles) {
        const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
        const user = get().user;
        if (!user) return false;
        return roles.some((role) => user.roles.includes(role));
      }
    }),
    {
      name: "tt-auth-store",
      partialize: (state) => ({ user: state.user })
    }
  )
);

setOnUnauthorized(() => {
  useAuthStore.getState().logout();
});

export function useAuth() {
  return useAuthStore();
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}
