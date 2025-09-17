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

// Network status selectors
export const selectNetworkStatus = createSelector([selectSyncState], (sync) => sync.networkStatus);

export const selectIsOnline = createSelector([selectNetworkStatus], (networkStatus) => networkStatus === "online");

// Background sync selectors
export const selectBackgroundSyncEnabled = createSelector([selectSyncState], (sync) => sync.backgroundSyncEnabled);

export const selectLastBackgroundSync = createSelector([selectSyncState], (sync) => sync.lastBackgroundSync);

// Queue selectors
export const selectPendingOperations = createSelector([selectSyncState], (sync) => sync.pendingOperations);

export const selectHasPendingOperations = createSelector([selectPendingOperations], (pendingOps) => pendingOps > 0);

// Composite selectors
export const selectSyncStatus = createSelector([selectIsSyncing, selectIsInitialSyncComplete, selectSyncError, selectIsOnline], (isSyncing, isInitialComplete, error, isOnline) => ({
  isSyncing,
  isInitialComplete,
  hasError: !!error,
  error,
  isOnline,
}));

export const selectShouldShowSyncIndicator = createSelector([selectIsSyncing, selectHasPendingOperations, selectSyncError], (isSyncing, hasPending, error) => isSyncing || hasPending || !!error);

// Human-readable sync status
export const selectSyncStatusText = createSelector([selectSyncStatus, selectSyncStage, selectPendingOperations], (status, stage, pendingOps) => {
  if (!status.isOnline) {
    return "Offline";
  }

  if (status.hasError) {
    return "Sync failed";
  }

  if (status.isSyncing) {
    if (stage === "groups") {
      return "Syncing groups...";
    } else if (stage === "cards") {
      return "Syncing cards...";
    } else {
      return "Syncing...";
    }
  }

  if (pendingOps > 0) {
    return `${pendingOps} pending`;
  }

  if (!status.isInitialComplete) {
    return "Not synced";
  }

  return "Synced";
});

// Sync stats selector
export const selectSyncStats = createSelector([selectLastSyncTime, selectLastBackgroundSync, selectPendingOperations], (lastSync, lastBackground, pending) => ({
  lastSyncTime: lastSync ? new Date(lastSync) : null,
  lastBackgroundSync: lastBackground ? new Date(lastBackground) : null,
  pendingOperations: pending,
}));
