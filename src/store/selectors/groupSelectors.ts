import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";

// Base selectors
export const selectGroupsState = (state: RootState) => state.groups;
export const selectAllGroups = (state: RootState) => state.groups.groups;
export const selectGroupsLoading = (state: RootState) => state.groups.loading;
export const selectGroupsError = (state: RootState) => state.groups.error;

// Parameterized selectors
export const selectGroupById = createSelector([selectAllGroups, (_state: RootState, groupId: string) => groupId], (groups, groupId) => groups.find((group) => group.id === groupId));

// Computed selectors
export const selectGroupsWithStats = createSelector([selectAllGroups], (groups) => {
  const totalGroups = groups.length;
  const totalCards = groups.reduce((sum, group) => sum + group.cardCount, 0);
  const groupsWithCards = groups.filter((group) => group.cardCount > 0).length;

  return {
    totalGroups,
    totalCards,
    groupsWithCards,
    averageCardsPerGroup: totalGroups > 0 ? Math.round(totalCards / totalGroups) : 0,
  };
});
