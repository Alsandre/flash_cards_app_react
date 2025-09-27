import {createSelector} from "@reduxjs/toolkit";
import type {RootState} from "../store";

// Base sync state selector
const selectSyncState = (state: RootState) => state.sync;

// Sync status selectors
export const selectIsSyncing = createSelector([selectSyncState], (sync) => sync.isSyncing);

export const selectIsInitialSyncComplete = createSelector([selectSyncState], (sync) => sync.isInitialSyncComplete);

export const selectSyncError = createSelector([selectSyncState], (sync) => sync.syncError);

export const selectLastSyncTime = createSelector([selectSyncState], (sync) => sync.lastSyncTime);

// Sync progress selectors
export const selectSyncProgress = createSelector([selectSyncState], (sync) => sync.syncProgress);

export const selectSyncStage = createSelector([selectSyncState], (sync) => sync.syncProgress.stage);

// Removed network status and background sync selectors - no longer needed

// Removed queue selectors - no longer needed

// Composite selectors
export const selectSyncStatus = createSelector([selectIsSyncing, selectIsInitialSyncComplete, selectSyncError], (isSyncing, isInitialComplete, error) => ({
  isSyncing,
  isInitialComplete,
  hasError: !!error,
  error,
  isOnline: true, // Always online for Supabase-only architecture
}));

export const selectShouldShowSyncIndicator = createSelector([selectIsSyncing, selectSyncError], (isSyncing, error) => isSyncing || !!error);

// Human-readable sync status
export const selectSyncStatusText = createSelector([selectSyncStatus, selectSyncStage], (status, stage) => {
  if (status.hasError) {
    return "Error";
  }

  if (status.isSyncing) {
    if (stage === "groups") {
      return "Loading groups...";
    } else if (stage === "cards") {
      return "Loading cards...";
    } else {
      return "Loading...";
    }
  }

  if (!status.isInitialComplete) {
    return "Not ready";
  }

  return "Ready";
});

// Sync stats selector
export const selectSyncStats = createSelector([selectLastSyncTime], (lastSync) => ({
  lastSyncTime: lastSync ? new Date(lastSync) : null,
}));
