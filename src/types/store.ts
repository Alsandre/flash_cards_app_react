// Store type definitions based on foundation document

import type {Group, Card, StudySession} from "./entities";

// Main app state interface as defined in foundation document
export interface AppState {
  // UI State
  theme: "light" | "dark";
  currentRoute: string;
  isLoading: boolean;
  error: string | null;

  // Data State
  groups: Group[];
  cards: Record<string, Card[]>; // grouped by groupId
  currentSession: StudySession | null;

  setTheme: (theme: "light" | "dark") => void;
  setCurrentRoute: (route: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  loadGroups: () => Promise<void>;
  createGroup: (group: Omit<Group, "id">) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;

  loadCards: (groupId: string) => Promise<void>;
  createCard: (card: Omit<Card, "id">) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  startStudySession: (groupId: string) => Promise<void>;
  updateSessionProgress: (cardIndex: number) => Promise<void>;
  rateCard: (cardId: string, rating: "dont_know" | "doubt" | "know") => Promise<void>;
  completeSession: () => Promise<void>;
  resumeSession: (groupId: string) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

// Store slice interfaces for better organization
export interface UISlice {
  theme: "light" | "dark";
  currentRoute: string;
  isLoading: boolean;
  error: string | null;
  setTheme: (theme: "light" | "dark") => void;
  setCurrentRoute: (route: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface GroupSlice {
  groups: Group[];
  loadGroups: () => Promise<void>;
  createGroup: (group: Omit<Group, "id">) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
}

export interface CardSlice {
  cards: Record<string, Card[]>;
  loadCards: (groupId: string) => Promise<void>;
  createCard: (card: Omit<Card, "id">) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export interface StudySlice {
  currentSession: StudySession | null;
  startStudySession: (groupId: string) => Promise<void>;
  updateSessionProgress: (cardIndex: number) => Promise<void>;
  rateCard: (cardId: string, rating: "dont_know" | "doubt" | "know") => Promise<void>;
  completeSession: () => Promise<void>;
  resumeSession: (groupId: string) => Promise<void>;
}
