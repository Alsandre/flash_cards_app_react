import {supabase} from "./supabase";
import type {User, AuthError, PostgrestError} from "@supabase/supabase-js";

// User profile interface extending Supabase User
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  workspace_id?: string;
  role?: "user" | "moderator" | "manager";
  created_at: string;
  updated_at: string;
  // Analytics fields for future use
  total_study_time?: number;
  cards_studied?: number;
  groups_created?: number;
  last_active?: string;
}

// User service for Supabase operations
export class UserService {
  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<{data: User | null; error: AuthError | null}> {
    const {data, error} = await supabase.auth.getUser();
    return {data: data.user, error};
  }

  /**
   * Create or update user profile in our custom profiles table
   * This will be called after successful authentication
   */
  static async upsertUserProfile(user: User): Promise<{data: UserProfile | null; error: PostgrestError | null}> {
    const profileData = {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username || user.email?.split("@")[0],
      display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0],
      workspace_id: user.id, // For now, workspace_id equals user_id
      role: "user" as const,
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await supabase.from("user_profiles").upsert(profileData, {onConflict: "id"}).select().single();

    return {data, error};
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<{data: UserProfile | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("user_profiles").select("*").eq("id", userId).single();

    return {data, error};
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, "username" | "display_name">>): Promise<{data: UserProfile | null; error: PostgrestError | null}> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await supabase.from("user_profiles").update(updateData).eq("id", userId).select().single();

    return {data, error};
  }

  /**
   * Update user analytics (study time, cards studied, etc.)
   */
  static async updateUserAnalytics(userId: string, analytics: Partial<Pick<UserProfile, "total_study_time" | "cards_studied" | "groups_created">>): Promise<{data: UserProfile | null; error: PostgrestError | null}> {
    const updateData = {
      ...analytics,
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await supabase.from("user_profiles").update(updateData).eq("id", userId).select().single();

    return {data, error};
  }

  /**
   * Get user's workspace info (for future workspace features)
   */
  static async getUserWorkspace(userId: string): Promise<{data: unknown; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("user_profiles").select("workspace_id, role").eq("id", userId).single();

    return {data, error};
  }

  /**
   * Network error helper
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isNetworkError(error: any): boolean {
    return (
      error?.message?.includes("fetch") || error?.message?.includes("network") || error?.message?.includes("connection") || error?.code === "PGRST301" // Supabase connection error
    );
  }

  /**
   * Retry network operations with exponential backoff
   */
  static async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!this.isNetworkError(error) || attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(`Retrying operation (attempt ${attempt + 2}/${maxRetries}) after ${delay}ms delay`);
      }
    }

    throw lastError;
  }
}

// Export user profile type for use in other modules
