import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import type {User} from "@supabase/supabase-js";
import {UserService} from "../../services/userService";
import type {UserProfile} from "../../services/userService";

// Auth state interface
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Profile loading state
  profileLoading: boolean;
  profileError: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  profileLoading: false,
  profileError: null,
};

// Async thunks for user profile operations
export const loadUserProfile = createAsyncThunk("auth/loadUserProfile", async (userId: string, {rejectWithValue}) => {
  try {
    const result = await UserService.retryOperation(() => UserService.getUserProfile(userId));

    if (result.error) {
      throw new Error(result.error.message || "Failed to load user profile");
    }

    return result.data;
  } catch (error) {
    console.error("Error loading user profile:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to load user profile");
  }
});

export const createUserProfile = createAsyncThunk("auth/createUserProfile", async (user: User, {rejectWithValue}) => {
  try {
    const result = await UserService.retryOperation(() => UserService.upsertUserProfile(user));

    if (result.error) {
      throw new Error(result.error.message || "Failed to create user profile");
    }

    return result.data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create user profile");
  }
});

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (
    {
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<UserProfile, "username" | "display_name">>;
    },
    {rejectWithValue}
  ) => {
    try {
      const result = await UserService.retryOperation(() => UserService.updateUserProfile(userId, updates));

      if (result.error) {
        throw new Error(result.error.message || "Failed to update user profile");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update user profile");
    }
  }
);

export const updateUserAnalytics = createAsyncThunk(
  "auth/updateUserAnalytics",
  async (
    {
      userId,
      analytics,
    }: {
      userId: string;
      analytics: Partial<Pick<UserProfile, "total_study_time" | "cards_studied" | "groups_created">>;
    },
    {rejectWithValue}
  ) => {
    try {
      const result = await UserService.retryOperation(() => UserService.updateUserAnalytics(userId, analytics));

      if (result.error) {
        throw new Error(result.error.message || "Failed to update user analytics");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating user analytics:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update user analytics");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Sync actions for React Context integration
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;

      // Clear profile when user changes
      if (!action.payload) {
        state.userProfile = null;
        state.profileError = null;
      }
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearAuth: (state) => {
      state.user = null;
      state.userProfile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.profileLoading = false;
      state.profileError = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    clearProfileError: (state) => {
      state.profileError = null;
    },
  },

  extraReducers: (builder) => {
    // Load user profile
    builder.addCase(loadUserProfile.pending, (state) => {
      state.profileLoading = true;
      state.profileError = null;
    });

    builder.addCase(loadUserProfile.fulfilled, (state, action) => {
      state.profileLoading = false;
      state.userProfile = action.payload;
      state.profileError = null;
    });

    builder.addCase(loadUserProfile.rejected, (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload as string;
    });

    // Create user profile
    builder.addCase(createUserProfile.pending, (state) => {
      state.profileLoading = true;
      state.profileError = null;
    });

    builder.addCase(createUserProfile.fulfilled, (state, action) => {
      state.profileLoading = false;
      state.userProfile = action.payload;
      state.profileError = null;
    });

    builder.addCase(createUserProfile.rejected, (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload as string;
    });

    // Update user profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.profileLoading = true;
      state.profileError = null;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.profileLoading = false;
      state.userProfile = action.payload;
      state.profileError = null;
    });

    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload as string;
    });

    // Update user analytics
    builder.addCase(updateUserAnalytics.pending, () => {
      // Don't show loading for analytics updates (background operation)
    });

    builder.addCase(updateUserAnalytics.fulfilled, (state, action) => {
      state.userProfile = action.payload;
    });

    builder.addCase(updateUserAnalytics.rejected, (_state, action) => {
      // Log error but don't show to user (background operation)
      console.error("Failed to update user analytics:", action.payload);
    });
  },
});

// Export actions
export const authActions = authSlice.actions;

// Export reducer
export default authSlice.reducer;
