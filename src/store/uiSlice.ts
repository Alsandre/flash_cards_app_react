// UI state slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, UISlice} from "../types/store";

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
  // Initial UI state
  theme: "light",
  currentRoute: "/",
  isLoading: false,
  error: null,

  // UI actions
  setTheme: (theme) => {
    set({theme}, false, "setTheme");
    // Persist theme preference to localStorage
    localStorage.setItem("flashcard-theme", theme);
  },

  setCurrentRoute: (route) => {
    set({currentRoute: route}, false, "setCurrentRoute");
  },

  setLoading: (loading) => {
    set({isLoading: loading}, false, "setLoading");
  },

  setError: (error) => {
    set({error}, false, "setError");
  },

  clearError: () => {
    set({error: null}, false, "clearError");
  },
});

// Initialize theme from localStorage on app start
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem("flashcard-theme") as "light" | "dark" | null;
  if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
    return savedTheme;
  }

  // Default to system preference
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
};
