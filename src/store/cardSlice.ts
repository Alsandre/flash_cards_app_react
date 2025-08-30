// Card management slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, CardSlice} from "../types/store";
import type {Card} from "../types/entities";
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
      set({isLoading: true, error: null}, false, "loadCards/start");

      const cards = await cardRepo.findByGroupId(groupId);
      const currentCards = get().cards;

      set(
        {
          cards: {
            ...currentCards,
            [groupId]: cards,
          },
          isLoading: false,
        },
        false,
        "loadCards/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load cards";
      set({error: errorMessage, isLoading: false}, false, "loadCards/error");
      throw error;
    }
  },

  createCard: async (cardData) => {
    try {
      set({isLoading: true, error: null}, false, "createCard/start");

      const newCard = await cardRepo.create(cardData);
      const currentCards = get().cards;
      const groupCards = currentCards[cardData.groupId] || [];

      // Update cards state
      const updatedCards = {
        ...currentCards,
        [cardData.groupId]: [newCard, ...groupCards],
      };

      // Update group card count in state
      const currentGroups = get().groups;
      const updatedGroups = currentGroups.map((group) => (group.id === cardData.groupId ? {...group, cardCount: group.cardCount + 1} : group));

      set(
        {
          cards: updatedCards,
          groups: updatedGroups,
          isLoading: false,
        },
        false,
        "createCard/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create card";
      set({error: errorMessage, isLoading: false}, false, "createCard/error");
      throw error;
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      set({isLoading: true, error: null}, false, "updateCard/start");

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

      set(
        {
          cards: updatedCards,
          isLoading: false,
        },
        false,
        "updateCard/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update card";
      set({error: errorMessage, isLoading: false}, false, "updateCard/error");
      throw error;
    }
  },

  deleteCard: async (cardId) => {
    try {
      set({isLoading: true, error: null}, false, "deleteCard/start");

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

      // Update group card count in state
      const currentGroups = get().groups;
      const updatedGroups = currentGroups.map((group) => (group.id === cardGroupId ? {...group, cardCount: Math.max(0, group.cardCount - 1)} : group));

      set(
        {
          cards: updatedCards,
          groups: updatedGroups,
          isLoading: false,
        },
        false,
        "deleteCard/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete card";
      set({error: errorMessage, isLoading: false}, false, "deleteCard/error");
      throw error;
    }
  },
});
