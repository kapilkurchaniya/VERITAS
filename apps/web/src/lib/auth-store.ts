/**
 * NEXUS — Auth store using Zustand.
 * Manages JWT token, user state, and auth actions.
 */
"use client";

import { create } from "zustand";
import { api, ApiClientError } from "@/lib/api";

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api<{ access_token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("nexus_token", res.access_token);
      set({ token: res.access_token });
      await get().fetchUser();
      return true;
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.detail : "Login failed";
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("nexus_token");
    set({ token: null, user: null, error: null });
  },

  fetchUser: async () => {
    try {
      const user = await api<UserInfo>("/api/v1/auth/me");
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem("nexus_token");
      set({ token: null, user: null, isLoading: false });
    }
  },

  initialize: async () => {
    const storedToken = localStorage.getItem("nexus_token");
    if (!storedToken) {
      set({ isLoading: false });
      return;
    }
    set({ token: storedToken });
    await get().fetchUser();
  },

  hasRole: (...roles: string[]) => {
    const user = get().user;
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  },
}));
