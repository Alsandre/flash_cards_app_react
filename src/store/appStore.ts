// Main Zustand store implementation
import {create} from "zustand";
import {devtools} from "zustand/middleware";
import type {AppState} from "../types/store";
import {createUISlice} from "./uiSlice";
import {createGroupSlice} from "./groupSlice";
import {createCardSlice} from "./cardSlice";
import {createStudySlice} from "./studySlice";

// Create the main app store by combining all slices
export const useAppStore = create<AppState>()(
  devtools(
    (set, get, api) => ({
      // Combine all slices
      ...createUISlice(set, get, api),
      ...createGroupSlice(set, get, api),
      ...createCardSlice(set, get, api),
      ...createStudySlice(set, get, api),

      // Global actions
      reset: () => {
        set({
          // Reset UI state
          theme: "light",
          currentRoute: "/",
          isLoading: false,
          error: null,

          // Reset data state
          groups: [],
          cards: {},
          currentSession: null,
        });
      },
    }),
    {
      name: "flashcard-store", // Store name for devtools
    }
  )
);

// Selector hooks for better performance
export const useTheme = () => useAppStore((state) => state.theme);
export const useGroups = () => useAppStore((state) => state.groups);
export const useAllCards = () => useAppStore((state) => state.cards);
export const useCurrentSession = () => useAppStore((state) => state.currentSession);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

// Individual action selectors to prevent re-render loops
export const useLoadGroups = () => useAppStore((state) => state.loadGroups);
export const useCreateGroup = () => useAppStore((state) => state.createGroup);
export const useUpdateGroup = () => useAppStore((state) => state.updateGroup);
export const useDeleteGroup = () => useAppStore((state) => state.deleteGroup);

export const useLoadCards = () => useAppStore((state) => state.loadCards);
export const useCreateCard = () => useAppStore((state) => state.createCard);
export const useUpdateCard = () => useAppStore((state) => state.updateCard);
export const useDeleteCard = () => useAppStore((state) => state.deleteCard);

export const useStartStudySession = () => useAppStore((state) => state.startStudySession);
export const useUpdateSessionProgress = () => useAppStore((state) => state.updateSessionProgress);
export const useRateCard = () => useAppStore((state) => state.rateCard);
export const useCompleteSession = () => useAppStore((state) => state.completeSession);
export const useResumeSession = () => useAppStore((state) => state.resumeSession);

export const useSetTheme = () => useAppStore((state) => state.setTheme);
export const useSetCurrentRoute = () => useAppStore((state) => state.setCurrentRoute);
export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useSetError = () => useAppStore((state) => state.setError);
export const useClearError = () => useAppStore((state) => state.clearError);
