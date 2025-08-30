// Group management slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, GroupSlice} from "../types/store";

import {GroupRepository} from "../repositories/groupRepository";

// Initialize repository
const groupRepo = new GroupRepository();

export const createGroupSlice: StateCreator<AppState, [], [], GroupSlice> = (set, get) => ({
  // Initial state
  groups: [],

  // Group actions
  loadGroups: async () => {
    try {
      set({isLoading: true, error: null});

      const groups = await groupRepo.getGroupsWithCardCounts();

      set({groups, isLoading: false});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load groups";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  createGroup: async (groupData) => {
    try {
      set({isLoading: true, error: null});

      const newGroup = await groupRepo.create(groupData);
      const currentGroups = get().groups;

      set({
        groups: [newGroup, ...currentGroups],
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create group";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  updateGroup: async (groupId, updates) => {
    try {
      set({isLoading: true, error: null});

      const updatedGroup = await groupRepo.update(groupId, updates);
      const currentGroups = get().groups;

      const updatedGroups = currentGroups.map((group) => (group.id === groupId ? updatedGroup : group));

      set({
        groups: updatedGroups,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update group";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      set({isLoading: true, error: null});

      await groupRepo.delete(groupId);
      const currentGroups = get().groups;
      const currentCards = get().cards;

      // Remove group from state
      const updatedGroups = currentGroups.filter((group) => group.id !== groupId);

      // Remove associated cards from state
      const updatedCards = {...currentCards};
      delete updatedCards[groupId];

      set({
        groups: updatedGroups,
        cards: updatedCards,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete group";
      set({error: errorMessage, isLoading: false});
      throw error;
    }
  },
});
