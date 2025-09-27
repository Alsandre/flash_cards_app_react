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

  if (authActions.setUser.match(action)) {
    if (user) {
      dispatch(loadUserProfile(user.id));
    } else {
      clearRepositories();
      dispatch(authActions.clearAuth());
    }
  } else if (loadUserProfile.fulfilled.match(action)) {
    if (user) {
      if (!action.payload) {
        dispatch(createUserProfile(user));
      }

      initializeRepositories(user.id);
      const syncState = store.getState().sync;
      
      if (!syncState.isInitialSyncComplete && !syncState.isSyncing) {
        dispatch(performInitialSync(user.id));
      }
    }
  }

  return result;
};
