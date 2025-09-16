import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";

// Base selectors
export const selectSessionState = (state: RootState) => state.sessions;
export const selectSessionType = (state: RootState) => state.sessions.sessionType;
export const selectSessionStartTime = (state: RootState) => state.sessions.sessionStartTime;

// Study session selectors
export const selectCurrentCardIndex = (state: RootState) => state.sessions.currentCardIndex;
export const selectIsCardFlipped = (state: RootState) => state.sessions.isFlipped;
export const selectSessionCards = (state: RootState) => state.sessions.sessionCards;
export const selectSessionAnswers = (state: RootState) => state.sessions.answers;
export const selectSessionRatings = (state: RootState) => state.sessions.ratings;

// Explore session selectors
export const selectExploreIndex = (state: RootState) => state.sessions.exploreIndex;
export const selectExploreCards = (state: RootState) => state.sessions.exploreCards;

// Computed selectors
export const selectIsStudySessionActive = createSelector([selectSessionType], (sessionType) => sessionType === "study");

export const selectIsExploreSessionActive = createSelector([selectSessionType], (sessionType) => sessionType === "explore");

export const selectStudyProgress = createSelector([selectCurrentCardIndex, selectSessionCards], (currentIndex, sessionCards) => {
  const totalCards = sessionCards.length;
  const completedCards = currentIndex;
  const remainingCards = totalCards - completedCards;
  const progressPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return {
    totalCards,
    currentIndex,
    completedCards,
    remainingCards,
    progressPercentage,
  };
});

export const selectExploreProgress = createSelector([selectExploreIndex, selectExploreCards], (currentIndex, exploreCards) => {
  const totalCards = exploreCards.length;
  const currentPosition = currentIndex + 1; // 1-based for display

  return {
    totalCards,
    currentIndex,
    currentPosition,
  };
});

export const selectCurrentStudyCard = createSelector([selectCurrentCardIndex, selectSessionCards], (currentIndex, sessionCards) => {
  return sessionCards[currentIndex] || null;
});

export const selectCurrentExploreCard = createSelector([selectExploreIndex, selectExploreCards], (currentIndex, exploreCards) => {
  return exploreCards[currentIndex] || null;
});

export const selectSessionIsComplete = createSelector([selectCurrentCardIndex, selectSessionCards, selectSessionType], (currentIndex, sessionCards, sessionType) => {
  if (sessionType === "study") {
    return currentIndex >= sessionCards.length - 1;
  }
  return false; // Explore sessions don't auto-complete
});
