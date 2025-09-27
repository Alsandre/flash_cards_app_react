import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import type {Card} from "../../types/card-schema";
import {DEFAULT_CARD_VALUES} from "../../types/card-schema";
import {getCardRepo} from "../../services/repositoryService";

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
export const loadCards = createAsyncThunk("cards/loadCards", async (_, {rejectWithValue, getState}) => {
  try {
    // Check if user is authenticated before proceeding
    const state = getState() as {auth: {user: {id: string; email: string} | null}};
    if (!state.auth.user) {
      return [];
    }

    // Check if repositories are initialized before proceeding
    try {
      getCardRepo(); // This will throw if not initialized
    } catch {
      return [];
    }

    const cards = await getCardRepo().findAll();
    return cards;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to load cards");
  }
});

export const createCard = createAsyncThunk("cards/createCard", async (cardData: Pick<Card, "groupId" | "content" | "answer"> & Partial<Pick<Card, "hint">>, {rejectWithValue, dispatch}) => {
  try {
    
    const newCard = await getCardRepo().create({
      ...DEFAULT_CARD_VALUES,
      ...cardData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    

    // Update group card count by querying database directly
    try {
      // Import here to avoid circular dependency
      const {getCardRepo, getGroupRepo} = await import("../../services/repositoryService");
      
      // Get actual current card count from database
      const currentCards = await getCardRepo().findByGroupId(cardData.groupId);
      const actualCardCount = currentCards.length;
      

      await getGroupRepo().update(cardData.groupId, {
        cardCount: actualCardCount,
      });

      // Also update the group in Redux state
      const {loadGroups} = await import("./groupSlice");
      dispatch(loadGroups());

    } catch (groupUpdateError) {
      console.error("Failed to update group card count:", groupUpdateError);
      // Don't fail the whole operation if group update fails
    }
    
    return newCard;
  } catch (error) {
    console.error("Card creation failed:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create card");
  }
});

export const updateCard = createAsyncThunk("cards/updateCard", async ({id, updates}: {id: string; updates: Partial<Card>}, {rejectWithValue}) => {
  try {
    
    const updatedCard = await getCardRepo().update(id, updates);
    
    
    return updatedCard;
  } catch (error) {
    console.error("Card update failed:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update card");
  }
});

export const deleteCard = createAsyncThunk("cards/deleteCard", async (cardId: string, {rejectWithValue, getState, dispatch}) => {
  try {

    // Get the card's groupId before deleting
    const state = getState() as {cards: {cards: Card[]}};
    const cardToDelete = state.cards.cards.find((card: Card) => card.id === cardId);
    if (!cardToDelete) {
      throw new Error("Card not found in state");
    }
    
    await getCardRepo().delete(cardId);
    

    // Update group card count by querying database directly
    try {
      // Import here to avoid circular dependency
      const {getCardRepo, getGroupRepo} = await import("../../services/repositoryService");
      
      // Get actual current card count from database (after deletion)
      const remainingCards = await getCardRepo().findByGroupId(cardToDelete.groupId);
      const actualCardCount = remainingCards.length;
      

      await getGroupRepo().update(cardToDelete.groupId, {
        cardCount: actualCardCount,
      });

      // Also update the group in Redux state
      const {loadGroups} = await import("./groupSlice");
      dispatch(loadGroups());

    } catch (groupUpdateError) {
      console.error("Failed to update group card count after deletion:", groupUpdateError);
      // Don't fail the whole operation if group update fails
    }
    
    return cardId;
  } catch (error) {
    console.error("Card deletion failed:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete card");
  }
});

export const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    // Synchronous actions (deprecated - use async thunks instead)
    // TODO: Remove these after migration is complete
    addCard: (state, action: PayloadAction<Pick<Card, "groupId" | "content" | "answer"> & Partial<Pick<Card, "hint">>>) => {
      console.warn("🚨 [CardSlice] DEPRECATED: addCard synchronous action used. Use createCard async thunk instead.");
      const newCard: Card = {
        ...DEFAULT_CARD_VALUES,
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.cards.push(newCard);
    },

    updateCardSync: (state, action: PayloadAction<{id: string; updates: Partial<Card>}>) => {
      console.warn("🚨 [CardSlice] DEPRECATED: updateCardSync synchronous action used. Use updateCard async thunk instead.");
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

    deleteCardSync: (state, action: PayloadAction<string>) => {
      console.warn("🚨 [CardSlice] DEPRECATED: deleteCardSync synchronous action used. Use deleteCard async thunk instead.");
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
    // Load Cards
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

    // Create Card
    builder
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cards.push(action.payload);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Card
    builder
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const cardIndex = state.cards.findIndex((card) => card.id === action.payload.id);
        if (cardIndex !== -1) {
          state.cards[cardIndex] = action.payload;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Card
    builder
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cards = state.cards.filter((card) => card.id !== action.payload);
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const cardActions = cardSlice.actions;
