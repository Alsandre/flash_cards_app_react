import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

interface SessionState {
  // Study session
  currentCardIndex: number;
  isFlipped: boolean;
  sessionCards: string[]; // card IDs
  answers: Record<string, string>;
  ratings: Record<string, "easy" | "medium" | "hard">;

  // Explore session
  exploreIndex: number;
  exploreCards: string[];

  // Session type
  sessionType: "study" | "explore" | null;
  sessionStartTime: Date | null;
}

const initialState: SessionState = {
  currentCardIndex: 0,
  isFlipped: false,
  sessionCards: [],
  answers: {},
  ratings: {},
  exploreIndex: 0,
  exploreCards: [],
  sessionType: null,
  sessionStartTime: null,
};

export const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    // Study session
    startStudySession: (state, action: PayloadAction<{cardIds: string[]}>) => {
      // Clear any existing session data
      state.sessionType = "study";
      state.sessionCards = action.payload.cardIds;
      state.currentCardIndex = 0;
      state.isFlipped = false;
      state.answers = {}; // Temporary: cleared on session end
      state.ratings = {}; // Temporary: cleared on session end
      state.sessionStartTime = new Date();
    },

    submitAnswer: (state, action: PayloadAction<{cardId: string; answer: string}>) => {
      const {cardId, answer} = action.payload;
      state.answers[cardId] = answer;
    },

    flipCard: (state) => {
      state.isFlipped = true;
    },

    rateCard: (
      state,
      action: PayloadAction<{
        cardId: string;
        rating: "easy" | "medium" | "hard";
      }>
    ) => {
      const {cardId, rating} = action.payload;
      state.ratings[cardId] = rating;
    },

    nextCard: (state) => {
      if (state.currentCardIndex < state.sessionCards.length - 1) {
        state.currentCardIndex += 1;
        state.isFlipped = false;
      }
    },

    endStudySession: (state) => {
      // Clear all temporary session data
      state.sessionType = null;
      state.sessionCards = [];
      state.currentCardIndex = 0;
      state.isFlipped = false;

      // CRITICAL: Clear temporary data that should not persist
      state.answers = {}; // These are session-only
      state.ratings = {}; // These are session-only
      state.sessionStartTime = null;
    },

    // Explore session
    startExploreSession: (state, action: PayloadAction<{cardIds: string[]}>) => {
      state.sessionType = "explore";
      state.exploreCards = action.payload.cardIds;
      state.exploreIndex = 0;
    },

    navigateToCard: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.exploreCards.length) {
        state.exploreIndex = index;
      }
    },

    endExploreSession: (state) => {
      state.sessionType = null;
      state.exploreCards = [];
      state.exploreIndex = 0;
    },
  },
});

export const sessionActions = sessionSlice.actions;
