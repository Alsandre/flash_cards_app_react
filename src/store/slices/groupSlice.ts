import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type {Group} from "../../types/group-schema";
import {getGroupRepo} from "../../services/repositoryService";

export interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
};

// Async Thunks
export const loadGroups = createAsyncThunk("groups/loadGroups", async (_, {rejectWithValue, getState}) => {

  try {
    // Check if user is authenticated before proceeding
    const state = getState() as {auth: {user: {id: string; email: string} | null}};

    if (!state.auth.user) {
      return [];
    }

    // Check if repositories are initialized before proceeding
    try {
      getGroupRepo(); // This will throw if not initialized
    } catch {
      return [];
    }

    const groups = await getGroupRepo().getGroupsWithCardCounts();
    return groups;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to load groups");
  }
});

export const createGroup = createAsyncThunk("groups/createGroup", async (groupData: Pick<Group, "name"> & Partial<Pick<Group, "description">>, {rejectWithValue}) => {
  try {
    
    const newGroup = await getGroupRepo().create(groupData);
    
    
    return newGroup;
  } catch (error) {
    console.error("Group creation failed:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create group");
  }
});

export const updateGroup = createAsyncThunk("groups/updateGroup", async ({id, updates}: {id: string; updates: Partial<Group>}, {rejectWithValue}) => {
  try {
    const updatedGroup = await getGroupRepo().update(id, updates);
    return updatedGroup;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update group");
  }
});

export const deleteGroup = createAsyncThunk("groups/deleteGroup", async (groupId: string, {rejectWithValue}) => {
  try {
    await getGroupRepo().delete(groupId);
    return groupId;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete group");
  }
});

export const deleteGroups = createAsyncThunk("groups/deleteGroups", async (groupIds: string[], {rejectWithValue}) => {
  try {
    const result = await getGroupRepo().deleteMany(groupIds);
    return {
      deletedIds: groupIds.slice(0, result.deleted),
      errors: result.errors,
      deleted: result.deleted,
      failed: result.errors.length,
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete groups");
  }
});

export const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load Groups
    builder
      .addCase(loadGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGroups.fulfilled, (state, action) => {
        
        state.loading = false;
        state.error = null;
        state.groups = action.payload;
      })
      .addCase(loadGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Group
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.groups.unshift(action.payload); // Add to beginning
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Group
    builder
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const groupIndex = state.groups.findIndex((group) => group.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Group
    builder
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.groups = state.groups.filter((group) => group.id !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.error = action.payload.failed > 0 ? `${action.payload.deleted} groups deleted, ${action.payload.failed} failed` : null;
        state.groups = state.groups.filter((group) => !action.payload.deletedIds.includes(group.id));
      })
      .addCase(deleteGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const groupActions = groupSlice.actions;
