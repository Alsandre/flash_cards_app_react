// Study session management slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, StudySlice} from "../types/store";
import type {StudySession, Rating} from "../types/entities";
import {SessionRepository} from "../repositories/sessionRepository";
import {CardRepository} from "../repositories/cardRepository";

// Initialize repositories
const sessionRepo = new SessionRepository();
const cardRepo = new CardRepository();

export const createStudySlice: StateCreator<AppState, [], [], StudySlice> = (set, get) => ({
  // Initial state
  currentSession: null,

  // Study session actions
  startStudySession: async (groupId) => {
    try {
      set({isLoading: true, error: null}, false, "startStudySession/start");

      // Check if there's already an active session for this group
      const existingSession = await sessionRepo.findActiveSession(groupId);

      if (existingSession) {
        // Resume existing session
        set(
          {
            currentSession: existingSession,
            isLoading: false,
          },
          false,
          "startStudySession/resume"
        );
        return;
      }

      // Get the group to determine study card count
      const groups = get().groups;
      const group = groups.find((g) => g.id === groupId);

      if (!group) {
        throw new Error("Group not found");
      }

      // Get cards for the study session
      const studyCards = await cardRepo.getCardsForStudySession(groupId, group.studyCardCount);

      if (studyCards.length === 0) {
        throw new Error("No cards available for study session");
      }

      // Create new study session
      const newSession = await sessionRepo.create({
        groupId,
        totalCards: studyCards.length,
        currentCardIndex: 0,
        isCompleted: false,
      });

      set(
        {
          currentSession: newSession,
          isLoading: false,
        },
        false,
        "startStudySession/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start study session";
      set({error: errorMessage, isLoading: false}, false, "startStudySession/error");
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

      set({currentSession: updatedSession}, false, "updateSessionProgress/success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update session progress";
      set({error: errorMessage}, false, "updateSessionProgress/error");
      throw error;
    }
  },

  rateCard: async (cardId, rating) => {
    try {
      set({error: null}, false, "rateCard/start");

      // Update card rating
      await cardRepo.updateRating(cardId, rating);

      // Update card in state
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

      set({cards: updatedCards}, false, "rateCard/success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to rate card";
      set({error: errorMessage}, false, "rateCard/error");
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

      set({currentSession: null}, false, "completeSession/success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete session";
      set({error: errorMessage}, false, "completeSession/error");
      throw error;
    }
  },

  resumeSession: async (groupId) => {
    try {
      set({isLoading: true, error: null}, false, "resumeSession/start");

      const activeSession = await sessionRepo.findActiveSession(groupId);

      if (!activeSession) {
        throw new Error("No active session found for this group");
      }

      set(
        {
          currentSession: activeSession,
          isLoading: false,
        },
        false,
        "resumeSession/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resume session";
      set({error: errorMessage, isLoading: false}, false, "resumeSession/error");
      throw error;
    }
  },
});
