import {supabase} from "./supabase";
import type {Group} from "../types/group-schema";

// Supabase-compatible Group interface
export interface SupabaseGroup extends Omit<Group, "id" | "createdAt" | "updatedAt"> {
  id?: string;
  user_id: string;
  study_card_count?: number;
  card_count?: number;
  is_shared?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Group service for Supabase operations
export class GroupService {
  /**
   * Get all groups for the authenticated user
   */
  static async getUserGroups(userId: string): Promise<{data: SupabaseGroup[] | null; error: any}> {
    try {
      const {data, error} = await supabase.from("groups").select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", {ascending: false});

      return {data, error};
    } catch (error) {
      console.error("Error fetching user groups:", error);
      return {data: null, error};
    }
  }

  /**
   * Get shared groups (visible to all users)
   */
  static async getSharedGroups(): Promise<{data: SupabaseGroup[] | null; error: any}> {
    try {
      const {data, error} = await supabase.from("groups").select("*").eq("is_shared", true).eq("is_active", true).order("updated_at", {ascending: false});

      return {data, error};
    } catch (error) {
      console.error("Error fetching shared groups:", error);
      return {data: null, error};
    }
  }

  /**
   * Create a new group
   */
  static async createGroup(userId: string, groupData: Omit<Group, "id" | "createdAt" | "updatedAt" | "studyCardCount" | "cardCount">): Promise<{data: SupabaseGroup | null; error: any}> {
    try {
      const supabaseGroup: Omit<SupabaseGroup, "id" | "created_at" | "updated_at"> = {
        user_id: userId,
        name: groupData.name,
        description: groupData.description || "",
        tags: groupData.tags || [],
        isActive: groupData.isActive ?? true,
        is_shared: false, // Default to private
        source: groupData.source || "user_created",
        study_card_count: 0,
        card_count: 0,
        studyCardCount: 0,
        cardCount: 0,
      };

      const {data, error} = await supabase.from("groups").insert(supabaseGroup).select().single();

      return {data, error};
    } catch (error) {
      console.error("Error creating group:", error);
      return {data: null, error};
    }
  }

  /**
   * Update a group
   */
  static async updateGroup(userId: string, groupId: string, updates: Partial<Pick<Group, "name" | "description" | "tags" | "isActive">>): Promise<{data: SupabaseGroup | null; error: any}> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const {data, error} = await supabase
        .from("groups")
        .update(updateData)
        .eq("id", groupId)
        .eq("user_id", userId) // Ensure user owns the group
        .select()
        .single();

      return {data, error};
    } catch (error) {
      console.error("Error updating group:", error);
      return {data: null, error};
    }
  }

  /**
   * Delete a group
   */
  static async deleteGroup(userId: string, groupId: string): Promise<{error: any}> {
    try {
      const {error} = await supabase.from("groups").delete().eq("id", groupId).eq("user_id", userId); // Ensure user owns the group

      return {error};
    } catch (error) {
      console.error("Error deleting group:", error);
      return {error};
    }
  }

  /**
   * Update group card counts (called when cards are added/removed)
   */
  static async updateGroupCardCounts(groupId: string, cardCount: number, studyCardCount?: number): Promise<{data: SupabaseGroup | null; error: any}> {
    try {
      const updateData: any = {
        card_count: cardCount,
        updated_at: new Date().toISOString(),
      };

      if (studyCardCount !== undefined) {
        updateData.study_card_count = studyCardCount;
      }

      const {data, error} = await supabase.from("groups").update(updateData).eq("id", groupId).select().single();

      return {data, error};
    } catch (error) {
      console.error("Error updating group card counts:", error);
      return {data: null, error};
    }
  }

  /**
   * Share/unshare a group
   */
  static async toggleGroupSharing(userId: string, groupId: string, isShared: boolean): Promise<{data: SupabaseGroup | null; error: any}> {
    try {
      const {data, error} = await supabase
        .from("groups")
        .update({
          is_shared: isShared,
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)
        .eq("user_id", userId) // Ensure user owns the group
        .select()
        .single();

      return {data, error};
    } catch (error) {
      console.error("Error toggling group sharing:", error);
      return {data: null, error};
    }
  }

  /**
   * Get a specific group by ID (with ownership check)
   */
  static async getGroupById(userId: string, groupId: string): Promise<{data: SupabaseGroup | null; error: any}> {
    try {
      const {data, error} = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .or(`user_id.eq.${userId},is_shared.eq.true`) // User owns it OR it's shared
        .single();

      return {data, error};
    } catch (error) {
      console.error("Error fetching group by ID:", error);
      return {data: null, error};
    }
  }

  /**
   * Network error helper
   */
  static isNetworkError(error: any): boolean {
    return error?.message?.includes("fetch") || error?.message?.includes("network") || error?.message?.includes("connection") || error?.code === "PGRST301";
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!this.isNetworkError(error) || attempt === maxRetries - 1) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(`Retrying group operation (attempt ${attempt + 2}/${maxRetries}) after ${delay}ms delay`);
      }
    }

    throw lastError;
  }
}

// Export types
