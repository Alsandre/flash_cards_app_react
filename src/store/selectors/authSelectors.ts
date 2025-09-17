import type {RootState} from "../store";

// Auth state selectors
export const selectAuthState = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectUserProfile = (state: RootState) => state.auth.userProfile;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState) => state.auth.loading;

export const selectAuthError = (state: RootState) => state.auth.error;

export const selectProfileLoading = (state: RootState) => state.auth.profileLoading;

export const selectProfileError = (state: RootState) => state.auth.profileError;

// Computed selectors
export const selectUserId = (state: RootState) => state.auth.user?.id || null;

export const selectUserEmail = (state: RootState) => state.auth.user?.email || null;

export const selectUserDisplayName = (state: RootState) => {
  const profile = state.auth.userProfile;
  const user = state.auth.user;

  return profile?.display_name || profile?.username || user?.email?.split("@")[0] || "User";
};

export const selectUserWorkspaceId = (state: RootState) => state.auth.userProfile?.workspace_id || null;

export const selectUserRole = (state: RootState) => state.auth.userProfile?.role || "user";

// Analytics selectors
export const selectUserAnalytics = (state: RootState) => {
  const profile = state.auth.userProfile;
  if (!profile) return null;

  return {
    totalStudyTime: profile.total_study_time || 0,
    cardsStudied: profile.cards_studied || 0,
    groupsCreated: profile.groups_created || 0,
    lastActive: profile.last_active,
  };
};

// Auth readiness selector - checks if auth state is ready for operations
export const selectAuthReady = (state: RootState) => {
  return !state.auth.loading && state.auth.isAuthenticated && !!state.auth.user;
};

// Profile readiness selector - checks if profile is loaded
export const selectProfileReady = (state: RootState) => {
  return !state.auth.profileLoading && !!state.auth.userProfile;
};
