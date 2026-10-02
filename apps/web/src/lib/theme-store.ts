/**
 * VERITAS — Theme store for dark/light mode.
 */
"use client";

import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggle: () => {
    const newVal = !get().isDark;
    set({ isDark: newVal });
    if (typeof window !== "undefined") {
      localStorage.setItem("veritas_theme", newVal ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newVal);
    }
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("veritas_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = stored ? stored === "dark" : prefersDark;
      set({ isDark });
      document.documentElement.classList.toggle("dark", isDark);
    }
  },
}));
