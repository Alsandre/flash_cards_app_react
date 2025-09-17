import type {Middleware} from "@reduxjs/toolkit";
import {authActions, loadUserProfile, createUserProfile} from "../slices/authSlice";
import {performInitialSync, syncActions} from "../slices/syncSlice";
import {syncManager} from "../../services/syncManager";
import {initializeRepositories, clearRepositories} from "../../services/repositoryService";
import type {RootState, AppDispatch} from "../store";
import type {User} from "@supabase/supabase-js";

// Auth middleware for syncing with React Context and handling auth events
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState() as RootState;
  const dispatch = store.dispatch as AppDispatch;

  // Listen for auth state changes from React Context
  if (authActions.setUser.match(action)) {
    const user = action.payload as User | null;

    if (user && !state.auth.userProfile && !state.auth.profileLoading) {
      // User logged in but no profile loaded - try to load or create profile
      dispatch(loadUserProfile(user.id)).then((profileResult) => {
        if (profileResult.type === "auth/loadUserProfile/rejected") {
          // Profile doesn't exist, create it
          console.log("User profile not found, creating new profile for:", user.email);
          dispatch(createUserProfile(user));
        }

        // Initialize repositories and sync manager (only once)
        initializeRepositories(user.id);
        syncManager.initialize(user.id);
        if (!store.getState().sync.isInitialSyncComplete && !store.getState().sync.isSyncing) {
          console.log("Starting initial sync for user:", user.email);
          dispatch(performInitialSync(user.id));
        }
      });
    } else if (user && state.auth.userProfile && !state.sync.isInitialSyncComplete && !state.sync.isSyncing) {
      // User has profile but sync not complete - start sync
      initializeRepositories(user.id);
      syncManager.initialize(user.id);
      dispatch(performInitialSync(user.id));
    } else if (!user) {
      // User logged out - clear sync state and go offline
      console.log("User logged out, clearing sync state");
      clearRepositories();
      syncManager.enableOfflineMode();
      dispatch(syncActions.setNetworkStatus("offline"));
    }
  }

  return result;
};
