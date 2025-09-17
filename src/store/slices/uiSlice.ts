import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

export interface UIState {
  theme: "light" | "dark";
  currentRoute: string;
  isLoading: boolean;
  error: string | null;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem("flashcard-theme") as "light" | "dark" | null;
  if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
    return savedTheme;
  }

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const initialState: UIState = {
  theme: getInitialTheme(),
  currentRoute: "/",
  isLoading: false,
  error: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("flashcard-theme", action.payload);
      }
    },

    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.currentRoute = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const uiActions = uiSlice.actions;

// Export the theme initialization function for use in components
export {getInitialTheme as initializeTheme};
