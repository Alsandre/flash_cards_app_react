import {supabase} from "./supabase";
import type {PostgrestError} from "@supabase/supabase-js";
import type {Group} from "../types/group-schema";

// Supabase Group interface - matches exact database schema with snake_case
export interface SupabaseGroup {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  card_count?: number;
  study_card_count?: number;
  is_active?: boolean;
  is_shared?: boolean;
  source?: "user_created" | "starter_pack";
  created_at?: string;
  updated_at?: string;
}

// Group service for Supabase operations
export class GroupService {
  /**
   * Get all groups for the authenticated user
   */
  static async getUserGroups(userId: string): Promise<{data: SupabaseGroup[] | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("groups").select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", {ascending: false});

    return {data, error};
  }

  /**
   * Get shared groups (visible to all users)
   */
  static async getSharedGroups(): Promise<{data: SupabaseGroup[] | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("groups").select("*").eq("is_shared", true).eq("is_active", true).order("updated_at", {ascending: false});

    return {data, error};
  }

  /**
   * Create a new group
   */
  static async createGroup(userId: string, groupData: Omit<Group, "id" | "createdAt" | "updatedAt" | "studyCardCount" | "cardCount">, customId?: string): Promise<{data: SupabaseGroup | null; error: PostgrestError | null}> {
    const supabaseGroup: Omit<SupabaseGroup, "created_at" | "updated_at"> = {
      id: customId || crypto.randomUUID(), // Use provided ID or generate new one
      user_id: userId,
      name: groupData.name,
      description: groupData.description || "",
      tags: groupData.tags || [],
      is_active: groupData.isActive ?? true,
      is_shared: false, // Default to private
      source: groupData.source || "user_created",
      study_card_count: 0,
      card_count: 0,
    };

    const {data, error} = await supabase.from("groups").insert(supabaseGroup).select().single();

    return {data, error};
  }

  /**
   * Update a group
   */
  static async updateGroup(userId: string, groupId: string, updates: Partial<Pick<Group, "name" | "description" | "tags" | "isActive">>): Promise<{data: SupabaseGroup | null; error: PostgrestError | null}> {
    const updateData: Partial<SupabaseGroup> = {
      updated_at: new Date().toISOString(),
    };

    // Map camelCase to snake_case for Supabase
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const {data, error} = await supabase
      .from("groups")
      .update(updateData)
      .eq("id", groupId)
      .eq("user_id", userId) // Ensure user owns the group
      .select()
      .single();

    return {data, error};
  }

  /**
   * Delete a group
   */
  static async deleteGroup(userId: string, groupId: string): Promise<{error: PostgrestError | null}> {
    const {error} = await supabase.from("groups").delete().eq("id", groupId).eq("user_id", userId); // Ensure user owns the group

    return {error};
  }

  /**
   * Update group card counts (called when cards are added/removed)
   */
  static async updateGroupCardCounts(groupId: string, cardCount: number, studyCardCount?: number): Promise<{data: SupabaseGroup | null; error: PostgrestError | null}> {
    const updateData: Partial<SupabaseGroup> = {
      card_count: cardCount,
      updated_at: new Date().toISOString(),
    };

    if (studyCardCount !== undefined) {
      updateData.study_card_count = studyCardCount;
    }

    const {data, error} = await supabase.from("groups").update(updateData).eq("id", groupId).select().single();

    return {data, error};
  }

  /**
   * Share/unshare a group
   */
  static async toggleGroupSharing(userId: string, groupId: string, isShared: boolean): Promise<{data: SupabaseGroup | null; error: PostgrestError | null}> {
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
  }

  /**
   * Get a specific group by ID (with ownership check)
   */
  static async getGroupById(userId: string, groupId: string): Promise<{data: SupabaseGroup | null; error: PostgrestError | null}> {
    const {data, error} = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .or(`user_id.eq.${userId},is_shared.eq.true`) // User owns it OR it's shared
      .single();

    return {data, error};
  }

  /**
   * Network error helper
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isNetworkError(error: any): boolean {
    return error?.message?.includes("fetch") || error?.message?.includes("network") || error?.message?.includes("connection") || error?.code === "PGRST301";
  }

  /**
   * Retry operation with exponential backoff
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

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(`Retrying group operation (attempt ${attempt + 2}/${maxRetries}) after ${delay}ms delay`);
      }
    }

    throw lastError;
  }
}

// Export types
