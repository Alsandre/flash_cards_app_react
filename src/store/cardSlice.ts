// Card management slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, CardSlice} from "../types/store";

import {CardRepository} from "../repositories/cardRepository";
import {GroupRepository} from "../repositories/groupRepository";

// Initialize repositories
const cardRepo = new CardRepository();
const groupRepo = new GroupRepository();

export const createCardSlice: StateCreator<AppState, [], [], CardSlice> = (set, get) => ({
  // Initial state
  cards: {},

  // Card actions
  loadCards: async (groupId) => {
    try {
      set({isLoading: true, error: null});

      const cards = await cardRepo.findByGroupId(groupId);
      const currentCards = get().cards;

      set({
        cards: {
          ...currentCards,
          [groupId]: cards,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load cards";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  createCard: async (cardData) => {
    try {
      set({isLoading: true, error: null});

      const newCard = await cardRepo.create(cardData);
      const currentCards = get().cards;
      const groupCards = currentCards[cardData.groupId] || [];

      // Update cards state
      const updatedCards = {
        ...currentCards,
        [cardData.groupId]: [newCard, ...groupCards],
      };

      // Update group card count in database and reload groups
      const updatedGroups = await groupRepo.getGroupsWithCardCounts();

      set({
        cards: updatedCards,
        groups: updatedGroups,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create card";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      set({isLoading: true, error: null});

      const updatedCard = await cardRepo.update(cardId, updates);
      const currentCards = get().cards;

      // Find and update the card in the appropriate group
      const updatedCards = {...currentCards};
      for (const groupId in updatedCards) {
        const groupCards = updatedCards[groupId];
        const cardIndex = groupCards.findIndex((card) => card.id === cardId);

        if (cardIndex !== -1) {
          updatedCards[groupId] = [...groupCards.slice(0, cardIndex), updatedCard, ...groupCards.slice(cardIndex + 1)];
          break;
        }
      }

      set({
        cards: updatedCards,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update card";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  deleteCard: async (cardId) => {
    try {
      set({isLoading: true, error: null});

      // Find the card to get its groupId before deletion
      const currentCards = get().cards;
      let cardGroupId: string | null = null;

      for (const groupId in currentCards) {
        const groupCards = currentCards[groupId];
        if (groupCards.some((card) => card.id === cardId)) {
          cardGroupId = groupId;
          break;
        }
      }

      if (!cardGroupId) {
        throw new Error("Card not found in state");
      }

      await cardRepo.delete(cardId);

      // Update cards state
      const updatedCards = {...currentCards};
      updatedCards[cardGroupId] = updatedCards[cardGroupId].filter((card) => card.id !== cardId);

      // Update group card count in database and reload groups
      const updatedGroups = await groupRepo.getGroupsWithCardCounts();

      set({
        cards: updatedCards,
        groups: updatedGroups,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete card";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },
});
