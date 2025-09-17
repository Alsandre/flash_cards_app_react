import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {syncManager} from "../../services/syncManager";

// Sync state interface
export interface SyncState {
  // Overall sync status
  isInitialSyncComplete: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;

  // Sync progress
  syncProgress: {
    current: number;
    total: number;
    stage: "groups" | "cards" | "complete" | null;
  };

  // Error handling
  syncError: string | null;
  networkStatus: "online" | "offline" | "unknown";

  // Background sync
  backgroundSyncEnabled: boolean;
  lastBackgroundSync: string | null;

  // Queue status
  pendingOperations: number;
}

const initialState: SyncState = {
  isInitialSyncComplete: false,
  isSyncing: false,
  lastSyncTime: null,

  syncProgress: {
    current: 0,
    total: 0,
    stage: null,
  },

  syncError: null,
  networkStatus: navigator.onLine ? "online" : "offline",

  backgroundSyncEnabled: true,
  lastBackgroundSync: null,

  pendingOperations: 0,
};

// Async thunks for sync operations
export const performInitialSync = createAsyncThunk("sync/performInitialSync", async (_userId: string, {rejectWithValue, dispatch}) => {
  try {
    dispatch(syncActions.setSyncStage("groups"));

    const result = await syncManager.performInitialSync();

    if (!result.success) {
      throw new Error(result.error || "Initial sync failed");
    }

    dispatch(syncActions.setSyncStage("complete"));
    return {
      stats: result.stats || {groups: 0, cards: 0},
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Initial sync failed");
  }
});

export const performBackgroundSync = createAsyncThunk("sync/performBackgroundSync", async (_, {rejectWithValue}) => {
  try {
    const result = await syncManager.performBackgroundSync();

    if (!result.success) {
      throw new Error(result.error || "Background sync failed");
    }

    return {
      stats: result.stats || {groups: 0, cards: 0},
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Background sync failed");
  }
});

export const forceSync = createAsyncThunk("sync/forceSync", async (_, {rejectWithValue}) => {
  try {
    const result = await syncManager.forceSync();

    if (!result.success) {
      throw new Error(result.error || "Force sync failed");
    }

    return {
      stats: result.stats || {groups: 0, cards: 0},
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Force sync failed");
  }
});

// Sync slice
const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    // Network status
    setNetworkStatus: (state, action: PayloadAction<"online" | "offline">) => {
      state.networkStatus = action.payload;

      if (action.payload === "offline") {
        state.backgroundSyncEnabled = false;
      }
    },

    // Sync progress
    setSyncProgress: (state, action: PayloadAction<{current: number; total: number}>) => {
      state.syncProgress.current = action.payload.current;
      state.syncProgress.total = action.payload.total;
    },

    setSyncStage: (state, action: PayloadAction<"groups" | "cards" | "complete" | null>) => {
      state.syncProgress.stage = action.payload;
    },

    // Error handling
    clearSyncError: (state) => {
      state.syncError = null;
    },

    setSyncError: (state, action: PayloadAction<string>) => {
      state.syncError = action.payload;
      state.isSyncing = false;
    },

    // Background sync control
    toggleBackgroundSync: (state) => {
      state.backgroundSyncEnabled = !state.backgroundSyncEnabled;
    },

    setBackgroundSync: (state, action: PayloadAction<boolean>) => {
      state.backgroundSyncEnabled = action.payload;
    },

    // Pending operations
    setPendingOperations: (state, action: PayloadAction<number>) => {
      state.pendingOperations = action.payload;
    },

    incrementPendingOps: (state) => {
      state.pendingOperations += 1;
    },

    decrementPendingOps: (state) => {
      if (state.pendingOperations > 0) {
        state.pendingOperations -= 1;
      }
    },
  },

  extraReducers: (builder) => {
    // Initial sync
    builder.addCase(performInitialSync.pending, (state) => {
      state.isSyncing = true;
      state.syncError = null;
      state.syncProgress.current = 0;
      state.syncProgress.stage = "groups";
    });

    builder.addCase(performInitialSync.fulfilled, (state, action) => {
      state.isSyncing = false;
      state.isInitialSyncComplete = true;
      state.lastSyncTime = action.payload.timestamp;
      state.syncProgress.stage = "complete";
      state.syncError = null;
    });

    builder.addCase(performInitialSync.rejected, (state, action) => {
      state.isSyncing = false;
      state.syncError = action.payload as string;
      state.syncProgress.stage = null;
    });

    // Background sync
    builder.addCase(performBackgroundSync.pending, (state) => {
      // Don't show loading for background sync unless it's the first sync
      if (!state.isInitialSyncComplete) {
        state.isSyncing = true;
      }
    });

    builder.addCase(performBackgroundSync.fulfilled, (state, action) => {
      state.isSyncing = false;
      state.lastBackgroundSync = action.payload.timestamp;
      state.syncError = null;

      if (!state.isInitialSyncComplete) {
        state.isInitialSyncComplete = true;
        state.lastSyncTime = action.payload.timestamp;
      }
    });

    builder.addCase(performBackgroundSync.rejected, (state, action) => {
      state.isSyncing = false;
      // Don't show background sync errors prominently - log them instead
      console.warn("Background sync failed:", action.payload);
    });

    // Force sync
    builder.addCase(forceSync.pending, (state) => {
      state.isSyncing = true;
      state.syncError = null;
    });

    builder.addCase(forceSync.fulfilled, (state, action) => {
      state.isSyncing = false;
      state.lastSyncTime = action.payload.timestamp;
      state.syncError = null;
    });

    builder.addCase(forceSync.rejected, (state, action) => {
      state.isSyncing = false;
      state.syncError = action.payload as string;
    });
  },
});

// Export actions
export const syncActions = syncSlice.actions;

// Export reducer
export default syncSlice.reducer;
