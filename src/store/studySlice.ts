import type {StateCreator} from "zustand";
import type {AppState, StudySlice} from "../types/store";

import {SessionRepository} from "../repositories/sessionRepository";
import {CardRepository} from "../repositories/cardRepository";

const sessionRepo = new SessionRepository();
const cardRepo = new CardRepository();

export const createStudySlice: StateCreator<AppState, [], [], StudySlice> = (set, get) => ({
  currentSession: null,
  startStudySession: async (groupId) => {
    try {
      set({isLoading: true, error: null});

      const existingSession = await sessionRepo.findActiveSession(groupId);

      if (existingSession) {
        set({
          currentSession: existingSession,
          isLoading: false,
        });
        return;
      }

      const groups = get().groups;
      const group = groups.find((g) => g.id === groupId);

      if (!group) {
        throw new Error("Group not found");
      }

      const studyCards = await cardRepo.getCardsForStudySession(groupId, group.studyCardCount);

      if (studyCards.length === 0) {
        throw new Error("No cards available for study session");
      }
      const newSession = await sessionRepo.create({
        groupId,
        totalCards: studyCards.length,
        currentCardIndex: 0,
        isCompleted: false,
        startedAt: new Date(),
      });

      set({
        currentSession: newSession,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start study session";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  updateSessionProgress: async (cardIndex) => {
    try {
      const currentSession = get().currentSession;

      if (!currentSession) {
        throw new Error("No active study session");
      }

      const updatedSession = await sessionRepo.updateProgress(currentSession.id, cardIndex);

      set({currentSession: updatedSession});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update session progress";
      set({error: errorMessage});
      throw error;
    }
  },

  rateCard: async (cardId, rating) => {
    try {
      set({error: null});

      await cardRepo.updateRating(cardId, rating);
      const currentCards = get().cards;
      const updatedCards = {...currentCards};

      for (const groupId in updatedCards) {
        const groupCards = updatedCards[groupId];
        const cardIndex = groupCards.findIndex((card) => card.id === cardId);

        if (cardIndex !== -1) {
          updatedCards[groupId] = [
            ...groupCards.slice(0, cardIndex),
            {
              ...groupCards[cardIndex],
              lastRating: rating,
              lastReviewedAt: new Date(),
            },
            ...groupCards.slice(cardIndex + 1),
          ];
          break;
        }
      }

      set({cards: updatedCards});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to rate card";
      set({error: errorMessage});
      throw error;
    }
  },

  completeSession: async () => {
    try {
      const currentSession = get().currentSession;

      if (!currentSession) {
        throw new Error("No active study session");
      }

      await sessionRepo.completeSession(currentSession.id);

      set({currentSession: null});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete session";
      set({error: errorMessage});
      throw error;
    }
  },

  resumeSession: async (groupId) => {
    try {
      set({isLoading: true, error: null});

      const activeSession = await sessionRepo.findActiveSession(groupId);

      if (!activeSession) {
        throw new Error("No active session found for this group");
      }

      set({
        currentSession: activeSession,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resume session";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },
});
