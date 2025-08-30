// Group management slice for Zustand store
import type {StateCreator} from "zustand";
import type {AppState, GroupSlice} from "../types/store";
import type {Group} from "../types/entities";
import {GroupRepository} from "../repositories/groupRepository";

// Initialize repository
const groupRepo = new GroupRepository();

export const createGroupSlice: StateCreator<AppState, [], [], GroupSlice> = (set, get) => ({
  // Initial state
  groups: [],

  // Group actions
  loadGroups: async () => {
    try {
      set({isLoading: true, error: null}, false, "loadGroups/start");

      const groups = await groupRepo.getGroupsWithCardCounts();

      set({groups, isLoading: false}, false, "loadGroups/success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load groups";
      set({error: errorMessage, isLoading: false}, false, "loadGroups/error");
      throw error;
    }
  },

  createGroup: async (groupData) => {
    try {
      set({isLoading: true, error: null}, false, "createGroup/start");

      const newGroup = await groupRepo.create(groupData);
      const currentGroups = get().groups;

      set(
        {
          groups: [newGroup, ...currentGroups],
          isLoading: false,
        },
        false,
        "createGroup/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create group";
      set({error: errorMessage, isLoading: false}, false, "createGroup/error");
      throw error;
    }
  },

  updateGroup: async (groupId, updates) => {
    try {
      set({isLoading: true, error: null}, false, "updateGroup/start");

      const updatedGroup = await groupRepo.update(groupId, updates);
      const currentGroups = get().groups;

      const updatedGroups = currentGroups.map((group) => (group.id === groupId ? updatedGroup : group));

      set(
        {
          groups: updatedGroups,
          isLoading: false,
        },
        false,
        "updateGroup/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update group";
      set({error: errorMessage, isLoading: false}, false, "updateGroup/error");
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      set({isLoading: true, error: null}, false, "deleteGroup/start");

      await groupRepo.delete(groupId);
      const currentGroups = get().groups;
      const currentCards = get().cards;

      // Remove group from state
      const updatedGroups = currentGroups.filter((group) => group.id !== groupId);

      // Remove associated cards from state
      const updatedCards = {...currentCards};
      delete updatedCards[groupId];

      set(
        {
          groups: updatedGroups,
          cards: updatedCards,
          isLoading: false,
        },
        false,
        "deleteGroup/success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete group";
      set({error: errorMessage, isLoading: false}, false, "deleteGroup/error");
      throw error;
    }
  },
});
