import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";
import {selectUserId, selectIsAuthenticated} from "./authSelectors";
import type {Card} from "../../types/card-schema";

// Base selectors
export const selectCardsState = (state: RootState) => state.cards;
export const selectAllCards = (state: RootState) => state.cards.cards;
export const selectCardsLoading = (state: RootState) => state.cards.loading;
export const selectCardsError = (state: RootState) => state.cards.error;

// Parameterized selectors
export const selectCardById = createSelector([selectAllCards, (_state: RootState, cardId: string) => cardId], (cards: Card[], cardId: string) => cards.find((card: Card) => card.id === cardId));

export const selectCardsByGroup = createSelector([selectAllCards, (_state: RootState, groupId: string) => groupId], (cards, groupId) => cards.filter((card) => card.groupId === groupId));

// User-aware selectors - filter by authenticated user
export const selectUserCards = createSelector([selectAllCards, selectUserId, selectIsAuthenticated], (cards, userId, isAuthenticated) => {
  // Return all cards during development or when not authenticated
  if (!isAuthenticated || !userId) {
    return cards;
  }

  // All cards from Supabase are already user-scoped
  return cards;
});

export const selectUserCardById = createSelector([selectUserCards, (_state: RootState, cardId: string) => cardId], (userCards: Card[], cardId: string) => userCards.find((card: Card) => card.id === cardId));

export const selectUserCardsByGroup = createSelector([selectUserCards, (_state: RootState, groupId: string) => groupId], (userCards: Card[], groupId: string) => userCards.filter((card: Card) => card.groupId === groupId));

// Active cards only (user's active cards)
export const selectActiveUserCards = createSelector([selectUserCards], (userCards: Card[]) => userCards.filter((card: Card) => card.isActive));

// Cards by difficulty
export const selectUserCardsByDifficulty = createSelector([selectUserCards, (_state: RootState, difficulty: "easy" | "medium" | "hard") => difficulty], (userCards: Card[], difficulty: "easy" | "medium" | "hard") => userCards.filter((card: Card) => card.difficultyRating === difficulty));

// Cards by source
export const selectUserCardsBySource = createSelector([selectUserCards, (_state: RootState, source: string) => source], (userCards: Card[], source: string) => userCards.filter((card: Card) => card.source === source));

// Computed selectors - user-aware
export const selectUserStudyableCards = createSelector([selectUserCards], (userCards: Card[]) => userCards.filter((card: Card) => card.isActive && card.content && card.answer));

export const selectUserCardStats = createSelector([selectUserCards], (userCards) => {
  const totalCards = userCards.length;
  const studiedCards = userCards.filter((card: Card) => card.totalAttempts > 0).length;
  const averageAccuracy = userCards.length > 0 ? userCards.reduce((sum: number, card: Card) => sum + (card.totalAttempts > 0 ? card.correctAttempts / card.totalAttempts : 0), 0) / userCards.length : 0;

  // Difficulty breakdown
  const easyCards = userCards.filter((card: Card) => card.difficultyRating === "easy").length;
  const mediumCards = userCards.filter((card: Card) => card.difficultyRating === "medium").length;
  const hardCards = userCards.filter((card: Card) => card.difficultyRating === "hard").length;
  const unratedCards = userCards.filter((card: Card) => !card.difficultyRating).length;

  // Source breakdown
  const userCreatedCards = userCards.filter((card: Card) => card.source === "user_created").length;
  const starterPackCards = userCards.filter((card: Card) => card.source === "starter_pack").length;

  return {
    totalCards,
    studiedCards,
    averageAccuracy,
    pendingCards: totalCards - studiedCards,
    // Difficulty breakdown
    easyCards,
    mediumCards,
    hardCards,
    unratedCards,
    // Source breakdown
    userCreatedCards,
    starterPackCards,
    // Progress metrics
    studyProgress: totalCards > 0 ? Math.round((studiedCards / totalCards) * 100) : 0,
  };
});

// Cards due for review (spaced repetition)
export const selectUserCardsDueForReview = createSelector([selectUserCards], (userCards: Card[]) => {
  const now = new Date();
  return userCards.filter((card: Card) => {
    if (!card.nextReviewDate) return true; // Never studied
    return new Date(card.nextReviewDate) <= now;
  });
});

// Legacy selectors for backward compatibility
export const selectStudyableCards = selectUserStudyableCards;
export const selectCardStats = selectUserCardStats;
