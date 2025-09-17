import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import type {Card} from "../../types/card-schema";
import {DEFAULT_CARD_VALUES} from "../../types/card-schema";
import {cardRepo} from "../../services/repositoryService";

export interface CardsState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cards: [],
  loading: false,
  error: null,
};

// Async Thunks
export const loadCards = createAsyncThunk("cards/loadCards", async (_, {rejectWithValue}) => {
  try {
    const cards = await cardRepo.findAll();
    return cards;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to load cards");
  }
});

export const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    // Card CRUD
    addCard: (state, action: PayloadAction<Pick<Card, "groupId" | "content" | "answer"> & Partial<Pick<Card, "hint">>>) => {
      const newCard: Card = {
        ...DEFAULT_CARD_VALUES,
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.cards.push(newCard);
    },

    updateCard: (state, action: PayloadAction<{id: string; updates: Partial<Card>}>) => {
      const {id, updates} = action.payload;
      const cardIndex = state.cards.findIndex((card) => card.id === id);

      if (cardIndex !== -1) {
        const currentCard = state.cards[cardIndex];

        // Validation: Ensure business rules
        if (updates.correctAttempts !== undefined && updates.correctAttempts > (updates.totalAttempts || currentCard.totalAttempts)) {
          console.error("Invalid update: correctAttempts cannot exceed totalAttempts");
          return;
        }

        state.cards[cardIndex] = {
          ...currentCard,
          ...updates,
          updatedAt: new Date(),
        };
      }
    },

    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },

    // Content updates
    updateContent: (state, action: PayloadAction<{id: string; content: string}>) => {
      const {id, content} = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card && content.trim() && content.length <= 2000) {
        card.content = content;
        card.updatedAt = new Date();
      } else if (card && !content.trim()) {
        console.error("Content cannot be empty");
      } else if (card && content.length > 2000) {
        console.error("Content exceeds 2000 character limit");
      }
    },

    updateAnswer: (state, action: PayloadAction<{id: string; answer: string}>) => {
      const {id, answer} = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card && answer.trim() && answer.length <= 2000) {
        card.answer = answer;
        card.updatedAt = new Date();
      } else if (card && !answer.trim()) {
        console.error("Answer cannot be empty");
      } else if (card && answer.length > 2000) {
        console.error("Answer exceeds 2000 character limit");
      }
    },

    updateUserNote: (state, action: PayloadAction<{id: string; note: string}>) => {
      const {id, note} = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card && note.length <= 80) {
        card.userNote = note;
        card.updatedAt = new Date();
      }
    },

    // Progress tracking
    recordStudy: (
      state,
      action: PayloadAction<{
        cardId: string;
        rating: "easy" | "medium" | "hard";
        responseTime: number;
      }>
    ) => {
      const {cardId, rating, responseTime} = action.payload;
      const card = state.cards.find((c) => c.id === cardId);

      if (card) {
        card.totalAttempts += 1;
        if (rating === "easy") {
          card.correctAttempts += 1;
        }
        card.lastStudiedAt = new Date();
        card.averageResponseTime = (card.averageResponseTime * (card.totalAttempts - 1) + responseTime) / card.totalAttempts;
        card.updatedAt = new Date();
      }
    },

    // Bulk operations
    loadCards: (state, action: PayloadAction<Card[]>) => {
      state.cards = action.payload;
      state.loading = false;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
        state.error = null;
      })
      .addCase(loadCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const cardActions = cardSlice.actions;
