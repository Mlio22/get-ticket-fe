import { AUTH_ENDPOINTS } from "@/constants/api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";
import apiClient, { tokenStorage } from "@/utils/axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type NormalizedAuthResult = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    if (typeof window === "undefined") {
      return JSON.parse(Buffer.from(padded, "base64").toString("utf-8")) as JwtPayload;
    }
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function normalizeRole(role?: string): User["role"] {
  const normalized = role?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  if (["eventorganizer", "organizer"].includes(normalized)) return "organizer";
  if (["administrator", "admin"].includes(normalized)) return "admin";
  return "user";
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { message?: string; errorMessage?: string } } })
    ?.response?.data;
  return response?.errorMessage || response?.message || fallback;
}

function normalizeAuthResponse(payload: AuthResponse): NormalizedAuthResult {
  const token = payload.token || payload.accessToken || payload.tokens?.accessToken;

  if (!token) {
    throw new Error("Authentication response did not contain an access token.");
  }

  const decoded = decodeJwtPayload(token);
  const roleClaim =
    (decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) ||
    (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] as string | undefined) ||
    decoded?.role;
  const nameClaim =
    (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string | undefined) ||
    decoded?.name;

  const user: User = payload.user || {
    id: decoded?.sub || payload.id || payload.userId || "",
    email: decoded?.email || payload.email || "",
    name: payload.fullName || payload.name || nameClaim || "User",
    role: normalizeRole(payload.role || roleClaim),
    createdAt: new Date(0).toISOString(),
  };

  return {
    user: {
      ...user,
      role: normalizeRole(user.role),
      name: user.name || payload.fullName || nameClaim || "User",
      email: user.email || decoded?.email || payload.email || "",
      id: user.id || decoded?.sub || payload.id || payload.userId || "",
      createdAt: user.createdAt || new Date(0).toISOString(),
    },
    accessToken: token,
    refreshToken: payload.refreshToken || payload.tokens?.refreshToken,
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post<{ data: AuthResponse }>(
            AUTH_ENDPOINTS.LOGIN,
            credentials
          );
          const { user, accessToken, refreshToken } = normalizeAuthResponse(data.data);
          tokenStorage.setToken(accessToken);
          if (refreshToken) {
            tokenStorage.setRefreshToken(refreshToken);
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message = extractErrorMessage(err, "Login failed. Please check your credentials.");
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post<{ data: AuthResponse }>(
            AUTH_ENDPOINTS.REGISTER,
            credentials
          );
          const { user, accessToken, refreshToken } = normalizeAuthResponse(data.data);
          tokenStorage.setToken(accessToken);
          if (refreshToken) {
            tokenStorage.setRefreshToken(refreshToken);
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message = extractErrorMessage(err, "Registration failed. Please try again.");
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
        } catch {
          // proceed even if server call fails
        } finally {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        const token = tokenStorage.getToken();
        if (!token) return;
        set({ isLoading: true });
        try {
          const { data } = await apiClient.get<{ data: User }>(AUTH_ENDPOINTS.ME);
          set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch {
          const decoded = decodeJwtPayload(token);
          const roleClaim =
            (decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) ||
            (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] as string | undefined) ||
            decoded?.role;
          const nameClaim =
            (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string | undefined) ||
            decoded?.name;

          if (decoded?.sub || decoded?.email || nameClaim) {
            set({
              user: {
                id: decoded?.sub || "",
                email: decoded?.email || "",
                name: nameClaim || "User",
                role: normalizeRole(roleClaim),
                createdAt: new Date(0).toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }

          tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
