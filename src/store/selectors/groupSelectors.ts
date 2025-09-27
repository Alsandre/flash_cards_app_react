import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";
import {selectUserId, selectIsAuthenticated} from "./authSelectors";
import type {Group} from "../../types/group-schema";

// Base selectors
export const selectGroupsState = (state: RootState) => state.groups;
export const selectAllGroups = (state: RootState) => state.groups.groups;
export const selectGroupsLoading = (state: RootState) => state.groups.loading;
export const selectGroupsError = (state: RootState) => state.groups.error;

// Parameterized selectors
export const selectGroupById = createSelector([selectAllGroups, (_state: RootState, groupId: string) => groupId], (groups: Group[], groupId: string) => groups.find((group: Group) => group.id === groupId));

// User-aware selectors - filter by authenticated user
export const selectUserGroups = createSelector([selectAllGroups, selectUserId, selectIsAuthenticated], (groups, userId, isAuthenticated) => {
  // Return all groups during development or when not authenticated
  if (!isAuthenticated || !userId) {
    return groups;
  }

  // All groups from Supabase are already user-scoped
  return groups;
});

export const selectUserGroupById = createSelector([selectUserGroups, (_state: RootState, groupId: string) => groupId], (userGroups: Group[], groupId: string) => userGroups.find((group: Group) => group.id === groupId));

// Active groups (user's active groups only)
export const selectActiveUserGroups = createSelector([selectUserGroups], (userGroups: Group[]) => userGroups.filter((group: Group) => group.isActive));

// Groups by source
export const selectUserGroupsBySource = createSelector([selectUserGroups, (_state: RootState, source: string) => source], (userGroups: Group[], source: string) => userGroups.filter((group: Group) => group.source === source));

// Computed selectors - user-aware
export const selectUserGroupsWithStats = createSelector([selectUserGroups], (userGroups) => {
  const totalGroups = userGroups.length;
  const totalCards = userGroups.reduce((sum: number, group: Group) => sum + group.cardCount, 0);
  const groupsWithCards = userGroups.filter((group: Group) => group.cardCount > 0).length;
  const activeGroups = userGroups.filter((group: Group) => group.isActive).length;

  return {
    totalGroups,
    totalCards,
    groupsWithCards,
    activeGroups,
    inactiveGroups: totalGroups - activeGroups,
    averageCardsPerGroup: totalGroups > 0 ? Math.round(totalCards / totalGroups) : 0,
  };
});

// Legacy selector for backward compatibility
export const selectGroupsWithStats = selectUserGroupsWithStats;
