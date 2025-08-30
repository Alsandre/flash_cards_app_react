import type {StateCreator} from "zustand";
import type {AppState, UISlice} from "../types/store";

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
  theme: "light",
  currentRoute: "/",
  isLoading: false,
  error: null,

  setTheme: (theme) => {
    set({theme});
    localStorage.setItem("flashcard-theme", theme);
  },

  setCurrentRoute: (route) => {
    set({currentRoute: route});
  },

  setLoading: (loading) => {
    set({isLoading: loading});
  },

  setError: (error) => {
    set({error});
  },

  clearError: () => {
    set({error: null});
  },
});

export const initializeTheme = () => {
  const savedTheme = localStorage.getItem("flashcard-theme") as "light" | "dark" | null;
  if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
    return savedTheme;
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
};
