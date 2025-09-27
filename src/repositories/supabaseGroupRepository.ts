import { BaseRepository } from "./base";
import { GroupService, type SupabaseGroup } from "../services/groupService";
import type { Group } from "../types/group-schema";

/**
 * Supabase Group Repository - cloud-only operations
 * - All operations go directly to Supabase
 * - User-scoped data access
 * - No local caching or offline support
 */
export class SupabaseGroupRepository extends BaseRepository<Group> {
  protected tableName = "groups";

  private userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
  }

  /**
   * Set user ID for Supabase operations
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  async findAll(): Promise<Group[]> {
    const result = await GroupService.retryOperation(() => 
      GroupService.getUserGroups(this.userId)
    );

    if (result.error || !result.data) {
      console.error("Failed to fetch all groups:", result.error?.message);
      return [];
    }

    return this.convertSupabaseGroupsToLocal(result.data);
  }

  async findById(id: string): Promise<Group | null> {
    const result = await GroupService.retryOperation(() => 
      GroupService.getGroupById(this.userId, id)
    );

    if (result.error || !result.data) {
      return null;
    }

    return this.convertSupabaseGroupToLocal(result.data);
  }

  async create(
    entity: Pick<Group, "name"> & Partial<Omit<Group, "id" | "createdAt" | "updatedAt" | "cardCount" | "studyCardCount">>,
    fixedId?: string
  ): Promise<Group> {
    // Ensure required fields have default values
    const groupData = {
      ...entity,
      isActive: entity.isActive ?? true,
      tags: entity.tags ?? [],
      description: entity.description ?? "",
      source: entity.source ?? "user_created",
    };

    const result = await GroupService.retryOperation(() => 
      GroupService.createGroup(this.userId, groupData, fixedId)
    );

    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to create group");
    }

    return this.convertSupabaseGroupToLocal(result.data);
  }

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    const result = await GroupService.retryOperation(() => 
      GroupService.updateGroup(this.userId, id, updates)
    );

    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to update group");
    }

    return this.convertSupabaseGroupToLocal(result.data);
  }

  async delete(id: string): Promise<void> {
    const result = await GroupService.retryOperation(() => 
      GroupService.deleteGroup(this.userId, id)
    );

    if (result.error) {
      throw new Error(result.error.message || "Failed to delete group");
    }
  }

  async deleteMany(ids: string[]): Promise<{deleted: number; errors: string[]}> {
    const results = await Promise.allSettled(
      ids.map(id => this.delete(id))
    );

    const deleted = results.filter(r => r.status === "fulfilled").length;
    const errors = results
      .filter(r => r.status === "rejected")
      .map(r => (r as PromiseRejectedResult).reason?.message || "Unknown error");

    return { deleted, errors };
  }

  async getGroupsWithCardCounts(): Promise<Group[]> {
    // For now, get groups without card counts
    // TODO: Implement proper card count aggregation in Supabase
    const result = await GroupService.retryOperation(() => 
      GroupService.getUserGroups(this.userId)
    );

    if (result.error || !result.data) {
      console.error("Failed to fetch groups:", result.error?.message);
      return [];
    }

    return this.convertSupabaseGroupsToLocal(result.data);
  }

  /**
   * Convert Supabase group format to local Group interface
   */
  private convertSupabaseGroupToLocal(supabaseGroup: SupabaseGroup): Group {
    return {
      id: supabaseGroup.id || this.generateId(),
      name: supabaseGroup.name,
      description: supabaseGroup.description || "",
      cardCount: supabaseGroup.card_count || 0,
      studyCardCount: supabaseGroup.study_card_count || 0,
      tags: supabaseGroup.tags || [],
      isActive: supabaseGroup.is_active ?? true,
      source: supabaseGroup.source || "user_created",
      createdAt: supabaseGroup.created_at ? new Date(supabaseGroup.created_at) : new Date(),
      updatedAt: supabaseGroup.updated_at ? new Date(supabaseGroup.updated_at) : new Date(),
    };
  }

  /**
   * Convert array of Supabase groups to local format
   */
  private convertSupabaseGroupsToLocal(supabaseGroups: SupabaseGroup[]): Group[] {
    return supabaseGroups.map(group => this.convertSupabaseGroupToLocal(group));
  }
}
