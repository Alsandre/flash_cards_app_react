import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";

// Base selectors
export const selectCardsState = (state: RootState) => state.cards;
export const selectAllCards = (state: RootState) => state.cards.cards;
export const selectCardsLoading = (state: RootState) => state.cards.loading;
export const selectCardsError = (state: RootState) => state.cards.error;

// Parameterized selectors
export const selectCardById = createSelector([selectAllCards, (_state: RootState, cardId: string) => cardId], (cards, cardId) => cards.find((card) => card.id === cardId));

export const selectCardsByGroup = createSelector([selectAllCards, (_state: RootState, groupId: string) => groupId], (cards, groupId) => cards.filter((card) => card.groupId === groupId));

// Computed selectors
export const selectStudyableCards = createSelector([selectAllCards], (cards) => cards.filter((card) => card.isActive && card.content && card.answer));

export const selectCardStats = createSelector([selectAllCards], (cards) => {
  const totalCards = cards.length;
  const studiedCards = cards.filter((card) => card.totalAttempts > 0).length;
  const averageAccuracy = cards.length > 0 ? cards.reduce((sum, card) => sum + (card.totalAttempts > 0 ? card.correctAttempts / card.totalAttempts : 0), 0) / cards.length : 0;

  return {
    totalCards,
    studiedCards,
    averageAccuracy,
    pendingCards: totalCards - studiedCards,
  };
});
