import {BaseRepository} from "./base";
import {db} from "../services/database";
import {GroupService} from "../services/groupService";
import type {Group} from "../types/group-schema";

/**
 * Hybrid Group Repository - implements dual-write pattern
 * - Writes to both IndexedDB (immediate) and Supabase (background)
 * - Reads from IndexedDB for speed
 * - Handles offline/online scenarios gracefully
 */
export class HybridGroupRepository extends BaseRepository<Group> {
  protected tableName = "groups";

  private userId?: string;

  constructor(userId?: string) {
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
    // Always read from IndexedDB for speed
    return await db.groups.orderBy("updatedAt").reverse().toArray();
  }

  async findById(id: string): Promise<Group | null> {
    // Always read from IndexedDB for speed
    const group = await db.groups.get(id);
    return group || null;
  }

  async create(entity: Pick<Group, "name"> & Partial<Omit<Group, "id" | "createdAt" | "updatedAt" | "cardCount" | "studyCardCount">>, fixedId?: string): Promise<Group> {
    const id = fixedId || this.generateId();
    const group: Group = {
      ...entity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      cardCount: 0,
      studyCardCount: 0,
      tags: entity.tags || [],
      isActive: entity.isActive ?? true,
      source: entity.source || "user_created",
    };

    // 1. Write to IndexedDB immediately (local-first)
    await db.groups.add(group);

    // 2. Background sync to Supabase (if user is authenticated and not starter pack)
    if (this.userId && group.source !== "starter_pack") {
      this.syncOperationToSupabase("create", group).catch((error) => {
        console.warn("Background sync failed for group creation:", error);
        // TODO: Queue for retry
      });
    }

    return group;
  }

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // 1. Update IndexedDB immediately
    await db.groups.update(id, updateData);

    const updatedGroup = await this.findById(id);
    if (!updatedGroup) {
      throw new Error(`Group with id ${id} not found`);
    }

    // 2. Background sync to Supabase (if user is authenticated and not starter pack)
    if (this.userId && updatedGroup.source !== "starter_pack") {
      this.syncOperationToSupabase("update", updatedGroup).catch((error) => {
        console.warn("Background sync failed for group update:", error);
        // TODO: Queue for retry
      });
    }

    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    // Get group before deletion for sync
    const groupToDelete = await this.findById(id);

    if (!groupToDelete) {
      throw new Error(`Group with id ${id} not found`);
    }

    // Immediate dual delete - fail if either fails
    const deletePromises = [
      // Delete from IndexedDB (also deletes associated cards)
      this.deleteFromLocal(id),
    ];

    // Add Supabase deletion if user is authenticated and not starter pack
    if (this.userId && groupToDelete.source !== "starter_pack") {
      deletePromises.push(
        GroupService.deleteGroup(this.userId, id).then((result) => {
          if (result.error) {
            throw new Error(`Supabase deletion failed: ${result.error.message}`);
          }
        })
      );
    }

    // Execute both deletions simultaneously
    await Promise.all(deletePromises);
  }

  /**
   * Delete multiple groups by IDs
   */
  async deleteMany(ids: string[]): Promise<{deleted: number; errors: string[]}> {
    const results = await Promise.allSettled(ids.map((id) => this.delete(id)));

    const deleted = results.filter((r) => r.status === "fulfilled").length;
    const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map((r) => r.reason?.message || "Unknown error");

    return {deleted, errors};
  }

  /**
   * Delete from local IndexedDB only
   */
  private async deleteFromLocal(id: string): Promise<void> {
    await db.cards.where("groupId").equals(id).delete();
    await db.groups.delete(id);
  }

  /**
   * Background sync operation to Supabase
   */
  private async syncOperationToSupabase(operation: "create" | "update" | "delete", group: Group): Promise<void> {
    if (!this.userId) return;

    try {
      switch (operation) {
        case "create":
          await GroupService.retryOperation(() =>
            GroupService.createGroup(this.userId!, {
              name: group.name,
              description: group.description,
              tags: group.tags,
              isActive: group.isActive,
              source: group.source,
            })
          );
          break;

        case "update":
          await GroupService.retryOperation(() =>
            GroupService.updateGroup(this.userId!, group.id, {
              name: group.name,
              description: group.description,
              tags: group.tags,
              isActive: group.isActive,
            })
          );
          break;

        case "delete":
          await GroupService.retryOperation(() => GroupService.deleteGroup(this.userId!, group.id));
          break;
      }
    } catch (error) {
      console.error(`Supabase sync failed for group ${operation} after retries:`, error);

      // Enhanced error handling - don't re-throw to prevent UI breakage
      // The local operation succeeded, sync will retry later
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          console.warn(`Network error during group ${operation}, will retry on reconnect`);
        } else if (error.message.includes("auth") || error.message.includes("unauthorized")) {
          console.error(`Auth error during group ${operation}, user may need to re-authenticate`);
        } else {
          console.error(`Unknown sync error during group ${operation}:`, error.message);
        }
      }

      // Don't re-throw - local operation succeeded, sync can retry later
    }
  }

  /**
   * Sync groups from Supabase to IndexedDB
   * Used for initial load and periodic sync
   */
  async syncFromSupabase(): Promise<{synced: number; error?: string}> {
    if (!this.userId) {
      return {synced: 0, error: "User not authenticated"};
    }

    try {
      const result = await GroupService.retryOperation(() => GroupService.getUserGroups(this.userId!));

      if (result.error || !result.data) {
        return {synced: 0, error: result.error?.message || "Failed to fetch groups"};
      }

      const supabaseGroups = result.data;
      let syncedCount = 0;

      for (const supabaseGroup of supabaseGroups) {
        // Convert Supabase format to local format
        const localGroup: Group = {
          id: supabaseGroup.id || this.generateId(),
          name: supabaseGroup.name,
          description: supabaseGroup.description || "",
          tags: supabaseGroup.tags || [],
          isActive: supabaseGroup.is_active ?? true,
          source: supabaseGroup.source || "user_created",
          cardCount: supabaseGroup.card_count || 0,
          studyCardCount: supabaseGroup.study_card_count || 0,
          createdAt: supabaseGroup.created_at ? new Date(supabaseGroup.created_at) : new Date(),
          updatedAt: supabaseGroup.updated_at ? new Date(supabaseGroup.updated_at) : new Date(),
        };

        // Check if group exists locally
        const existingGroup = await this.findById(localGroup.id);

        if (!existingGroup) {
          // Add new group
          await db.groups.add(localGroup);
          syncedCount++;
        } else {
          // Update if cloud version is newer
          if (localGroup.updatedAt > existingGroup.updatedAt) {
            await db.groups.update(localGroup.id, {
              name: localGroup.name,
              description: localGroup.description,
              tags: localGroup.tags,
              isActive: localGroup.isActive,
              source: localGroup.source,
              studyCardCount: localGroup.studyCardCount,
              cardCount: localGroup.cardCount,
              updatedAt: new Date(),
            });
            syncedCount++;
          }
        }
      }

      return {synced: syncedCount};
    } catch (error) {
      console.error("Sync from Supabase failed:", error);
      return {
        synced: 0,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  /**
   * Sync all local groups to Supabase
   * Used to push local changes to cloud during initial sync
   */
  async syncAllGroupsToSupabase(): Promise<{synced: number; error?: string}> {
    if (!this.userId) {
      return {synced: 0, error: "User not authenticated"};
    }

    try {
      // Get all local groups (exclude starter pack - it should stay local only)
      const allLocalGroups = await this.findAll();
      const localGroups = allLocalGroups.filter((group) => group.source !== "starter_pack");

      // Get all cloud groups for comparison
      const cloudResult = await GroupService.retryOperation(() => GroupService.getUserGroups(this.userId!));
      if (cloudResult.error) {
        return {synced: 0, error: cloudResult.error.message};
      }

      const cloudGroups = cloudResult.data || [];
      const cloudGroupsMap = new Map(cloudGroups.map((g) => [g.id, g]));

      let syncedCount = 0;

      for (const localGroup of localGroups) {
        const cloudGroup = cloudGroupsMap.get(localGroup.id);

        if (!cloudGroup) {
          // MERGE: Local group doesn't exist in cloud → push to cloud
          const createResult = await GroupService.retryOperation(() =>
            GroupService.createGroup(this.userId!, {
              name: localGroup.name,
              description: localGroup.description,
              tags: localGroup.tags,
              isActive: localGroup.isActive,
              source: localGroup.source,
            })
          );

          if (!createResult.error) {
            syncedCount++;
          }
        } else {
          // NEWER WINS: Compare timestamps
          const localUpdated = localGroup.updatedAt;
          const cloudUpdated = cloudGroup.updated_at ? new Date(cloudGroup.updated_at) : new Date(0);

          if (localUpdated > cloudUpdated) {
            // Local is newer → update cloud
            const updateResult = await GroupService.retryOperation(() =>
              GroupService.updateGroup(this.userId!, localGroup.id, {
                name: localGroup.name,
                description: localGroup.description,
                tags: localGroup.tags,
                isActive: localGroup.isActive,
              })
            );

            if (!updateResult.error) {
              syncedCount++;
            }
          }
        }
      }

      return {synced: syncedCount};
    } catch (error) {
      console.error("Sync to Supabase failed:", error);
      return {
        synced: 0,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  // Legacy methods preserved for backward compatibility
  async findByName(name: string): Promise<Group[]> {
    return await db.groups.where("name").startsWithIgnoreCase(name).toArray();
  }

  async getGroupsWithCardCounts(): Promise<Group[]> {
    const groups = await this.findAll();

    // Update card counts for all groups
    for (const group of groups) {
      await db.updateGroupCardCount(group.id);
    }

    // Return updated groups
    return await this.findAll();
  }

  async saveAllGroups(groups: Group[]): Promise<void> {
    // Clear existing groups and save new ones
    await db.groups.clear();
    // Create mutable copies to avoid "read-only property" errors
    const mutableGroups = groups.map((group) => ({...group}));
    await db.groups.bulkAdd(mutableGroups);
  }

  /**
   * Force sync - useful for manual sync operations
   */
  async forceSyncFromSupabase(): Promise<{synced: number; error?: string}> {
    return await this.syncFromSupabase();
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{lastSync?: Date; pendingOps: number}> {
    // TODO: Implement sync status tracking
    return {
      lastSync: undefined,
      pendingOps: 0,
    };
  }
}
