import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";
import {selectUserId, selectIsAuthenticated} from "./authSelectors";

// Base selectors
export const selectCardsState = (state: RootState) => state.cards;
export const selectAllCards = (state: RootState) => state.cards.cards;
export const selectCardsLoading = (state: RootState) => state.cards.loading;
export const selectCardsError = (state: RootState) => state.cards.error;

// Parameterized selectors
export const selectCardById = createSelector([selectAllCards, (_state: RootState, cardId: string) => cardId], (cards, cardId) => cards.find((card: any) => card.id === cardId));

export const selectCardsByGroup = createSelector([selectAllCards, (_state: RootState, groupId: string) => groupId], (cards, groupId) => cards.filter((card) => card.groupId === groupId));

// User-aware selectors - filter by authenticated user
export const selectUserCards = createSelector([selectAllCards, selectUserId, selectIsAuthenticated], (cards, userId, isAuthenticated) => {
  // Return all cards during development or when not authenticated
  if (!isAuthenticated || !userId) {
    return cards;
  }

  // Filter cards by user ownership
  return cards.filter(() => {
    // For now, assume all IndexedDB cards belong to current user
    // When we implement hybrid storage, we'll add proper user_id filtering
    return true;
  });
});

export const selectUserCardById = createSelector([selectUserCards, (_state: RootState, cardId: string) => cardId], (userCards, cardId) => userCards.find((card: any) => card.id === cardId));

export const selectUserCardsByGroup = createSelector([selectUserCards, (_state: RootState, groupId: string) => groupId], (userCards, groupId) => userCards.filter((card: any) => card.groupId === groupId));

// Active cards only (user's active cards)
export const selectActiveUserCards = createSelector([selectUserCards], (userCards) => userCards.filter((card: any) => card.isActive));

// Cards by difficulty
export const selectUserCardsByDifficulty = createSelector([selectUserCards, (_state: RootState, difficulty: "easy" | "medium" | "hard") => difficulty], (userCards, difficulty) => userCards.filter((card: any) => card.difficultyRating === difficulty));

// Cards by source
export const selectUserCardsBySource = createSelector([selectUserCards, (_state: RootState, source: string) => source], (userCards, source) => userCards.filter((card: any) => card.source === source));

// Computed selectors - user-aware
export const selectUserStudyableCards = createSelector([selectUserCards], (userCards) => userCards.filter((card: any) => card.isActive && card.content && card.answer));

export const selectUserCardStats = createSelector([selectUserCards], (userCards) => {
  const totalCards = userCards.length;
  const studiedCards = userCards.filter((card: any) => card.totalAttempts > 0).length;
  const averageAccuracy = userCards.length > 0 ? userCards.reduce((sum: any, card: any) => sum + (card.totalAttempts > 0 ? card.correctAttempts / card.totalAttempts : 0), 0) / userCards.length : 0;

  // Difficulty breakdown
  const easyCards = userCards.filter((card: any) => card.difficultyRating === "easy").length;
  const mediumCards = userCards.filter((card: any) => card.difficultyRating === "medium").length;
  const hardCards = userCards.filter((card: any) => card.difficultyRating === "hard").length;
  const unratedCards = userCards.filter((card: any) => !card.difficultyRating).length;

  // Source breakdown
  const userCreatedCards = userCards.filter((card: any) => card.source === "user_created").length;
  const starterPackCards = userCards.filter((card: any) => card.source === "starter_pack").length;

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
export const selectUserCardsDueForReview = createSelector([selectUserCards], (userCards) => {
  const now = new Date();
  return userCards.filter((card: any) => {
    if (!card.nextReviewDate) return true; // Never studied
    return new Date(card.nextReviewDate) <= now;
  });
});

// Legacy selectors for backward compatibility
export const selectStudyableCards = selectUserStudyableCards;
export const selectCardStats = selectUserCardStats;
