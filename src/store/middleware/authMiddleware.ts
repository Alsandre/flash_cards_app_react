import type {Middleware} from "@reduxjs/toolkit";
import {authActions, loadUserProfile, createUserProfile} from "../slices/authSlice";
import {performInitialSync} from "../slices/syncSlice";
// import {syncManager} from "../../services/syncManager"; // Removed - no longer using sync manager
import {initializeRepositories, clearRepositories} from "../../services/repositoryService";
import type {RootState, AppDispatch} from "../store";

// Auth middleware for syncing with React Context and handling auth events
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState() as RootState;
  const dispatch = store.dispatch as AppDispatch;
  const user = state.auth.user;

  // Log every action that hits this middleware
  if (authActions.setUser.match(action)) {
    console.log("🔍 [AuthMiddleware] setUser action:", {
      actionType: action.type,
      userFromPayload: action.payload?.email || "null",
      userFromState: user?.email || "null",
      timestamp: new Date().toISOString()
    });

    if (user) {
      console.log("🔍 [AuthMiddleware] User set, dispatching loadUserProfile for:", user.email);
      dispatch(loadUserProfile(user.id));
    } else {
      console.log("🔍 [AuthMiddleware] User cleared (logged out), clearing repositories");
      clearRepositories();
      dispatch(authActions.clearAuth());
    }
  } else if (loadUserProfile.fulfilled.match(action)) {
    console.log("🔍 [AuthMiddleware] loadUserProfile.fulfilled:", {
      hasUser: !!user,
      userEmail: user?.email || "null",
      hasProfile: !!action.payload,
      profileId: action.payload?.id || "null",
      timestamp: new Date().toISOString()
    });

    if (user) {
      if (!action.payload) {
        console.log("🔍 [AuthMiddleware] Profile not found, creating new profile for:", user.email);
        dispatch(createUserProfile(user));
      }

      console.log("🔍 [AuthMiddleware] Initializing repos for user:", user.email);
      initializeRepositories(user.id);
      const syncState = store.getState().sync;
      console.log("🔍 [AuthMiddleware] Sync state check:", {
        isInitialSyncComplete: syncState.isInitialSyncComplete,
        isSyncing: syncState.isSyncing,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      });
      
      if (!syncState.isInitialSyncComplete && !syncState.isSyncing) {
        console.log("🔍 [AuthMiddleware] Starting initial sync for user:", user.email);
        dispatch(performInitialSync(user.id));
      } else {
        console.log("🔍 [AuthMiddleware] Skipping sync - already complete or in progress");
      }
    } else {
      console.log("🔍 [AuthMiddleware] loadUserProfile.fulfilled but no user in state - race condition?");
    }
  }

  return result;
};
