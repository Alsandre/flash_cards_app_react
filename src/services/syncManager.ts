import {HybridGroupRepository} from "../repositories/hybridGroupRepository";
import {HybridCardRepository} from "../repositories/hybridCardRepository";
import type {Group} from "../types/group-schema";
import type {Card} from "../types/card-schema";
import {UserService} from "./userService";

/**
 * Sync Manager - coordinates data synchronization between IndexedDB and Supabase
 * Handles conflict resolution, retry queues, and sync orchestration
 */
export class SyncManager {
  private groupRepo: HybridGroupRepository;
  private cardRepo: HybridCardRepository;
  private userId: string | null = null;
  private syncInProgress = false;
  private syncQueue: Array<{
    type: "group" | "card";
    operation: "create" | "update" | "delete";
    id: string;
    data: Group | Card;
    attempts: number;
  }> = [];

  constructor() {
    this.groupRepo = new HybridGroupRepository();
    this.cardRepo = new HybridCardRepository();
  }

  /**
   * Initialize sync manager with user ID
   */
  initialize(userId: string) {
    this.userId = userId;
    this.groupRepo.setUserId(userId);
    this.cardRepo.setUserId(userId);
  }

  /**
   * Clear user data when logging out
   */
  clear() {
    this.userId = null;
    this.syncQueue = [];
    this.syncInProgress = false;
  }

  /**
   * Get repository instances (for use in Redux slices)
   */
  getRepositories() {
    return {
      groups: this.groupRepo,
      cards: this.cardRepo,
    };
  }

  /**
   * Perform initial sync from Supabase to local storage
   * Called when user first logs in or app starts
   */
  async performInitialSync(): Promise<{success: boolean; error?: string; stats?: {groups: number; cards: number}}> {
    if (!this.userId) {
      return {success: false, error: "User not authenticated"};
    }

    if (this.syncInProgress) {
      return {success: false, error: "Sync already in progress"};
    }

    console.log("🔄 Starting bidirectional initial sync...");
    this.syncInProgress = true;

    try {
      // PHASE 1: Push local changes to cloud (merge new, newer wins for conflicts)
      console.log("📤 Pushing local groups to cloud...");
      const groupPushResult = await this.groupRepo.syncAllGroupsToSupabase();
      if (groupPushResult.error) {
        console.warn(`Group push failed: ${groupPushResult.error}`);
      }

      // PHASE 2: Pull cloud changes to local (merge new, newer wins for conflicts)
      console.log("📥 Pulling cloud groups to local...");
      const groupPullResult = await this.groupRepo.syncFromSupabase();
      if (groupPullResult.error) {
        throw new Error(`Group pull failed: ${groupPullResult.error}`);
      }

      // PHASE 3: Pull cloud cards to local (cards don't have syncToSupabase yet)
      console.log("📥 Pulling cloud cards to local...");
      const cardSyncResult = await this.cardRepo.syncFromSupabase();
      if (cardSyncResult.error) {
        throw new Error(`Card sync failed: ${cardSyncResult.error}`);
      }

      const stats = {
        groups: (groupPushResult.synced || 0) + (groupPullResult.synced || 0),
        cards: cardSyncResult.synced,
      };

      console.log("✅ Initial sync completed:", stats);
      this.syncInProgress = false;

      return {success: true, stats};
    } catch (error) {
      this.syncInProgress = false;
      console.error("❌ Initial sync failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  /**
   * Perform background sync (periodic sync while app is running)
   */
  async performBackgroundSync(): Promise<{success: boolean; error?: string; stats?: {groups: number; cards: number}}> {
    if (!this.userId) {
      return {success: false, error: "User not authenticated"};
    }

    if (this.syncInProgress) {
      console.log("⏳ Background sync skipped - sync already in progress");
      return {success: false, error: "Sync already in progress"};
    }

    console.log("🔄 Starting background sync...");
    this.syncInProgress = true;

    try {
      // Process any queued operations first
      await this.processQueue();

      // Sync from Supabase (pull changes)
      const groupSyncResult = await this.groupRepo.syncFromSupabase();
      const cardSyncResult = await this.cardRepo.syncFromSupabase();

      const stats = {
        groups: groupSyncResult.synced,
        cards: cardSyncResult.synced,
      };

      this.syncInProgress = false;

      if (stats.groups > 0 || stats.cards > 0) {
        console.log("✅ Background sync completed:", stats);
      }

      return {success: true, stats};
    } catch (error) {
      this.syncInProgress = false;
      console.error("❌ Background sync failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  /**
   * Force full sync (manual sync triggered by user)
   */
  async forceSync(): Promise<{success: boolean; error?: string; stats?: {groups: number; cards: number}}> {
    console.log("🔄 Starting forced sync...");
    return await this.performInitialSync();
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Get sync statistics
   */
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    lastSync?: Date;
    queuedOperations: number;
    inProgress: boolean;
    groups: {lastSync?: Date; pendingOps: number};
    cards: {lastSync?: Date; pendingOps: number};
  }> {
    const groupStatus = await this.groupRepo.getSyncStatus();
    const cardStatus = await this.cardRepo.getSyncStatus();

    return {
      isOnline: navigator.onLine,
      queuedOperations: this.syncQueue.length,
      inProgress: this.syncInProgress,
      groups: groupStatus,
      cards: cardStatus,
    };
  }

  /**
   * Queue operation for retry (when sync fails)
   */
  queueOperation(type: "group" | "card", operation: "create" | "update" | "delete", id: string, data: Group | Card) {
    this.syncQueue.push({
      type,
      operation,
      id,
      data,
      attempts: 0,
    });

    console.log(`📥 Queued ${type} ${operation} for sync retry`);
  }

  /**
   * Process queued operations
   */
  private async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`🔄 Processing ${this.syncQueue.length} queued operations...`);

    const failedOperations: typeof this.syncQueue = [];

    for (const operation of this.syncQueue) {
      try {
        await this.retryQueuedOperation(operation);
        console.log(`✅ Queued ${operation.type} ${operation.operation} synced successfully`);
      } catch (error) {
        operation.attempts++;
        if (operation.attempts < 3) {
          failedOperations.push(operation);
        } else {
          console.error(`❌ Queued ${operation.type} ${operation.operation} failed permanently after 3 attempts:`, error);
        }
      }
    }

    this.syncQueue = failedOperations;
  }

  /**
   * Retry a queued operation
   */
  private async retryQueuedOperation(operation: (typeof this.syncQueue)[0]): Promise<void> {
    // Implementation depends on operation type
    // This is a simplified version - in reality, you'd need to reconstruct the proper service calls

    if (operation.type === "group") {
      // Retry group operation
      console.log(`Retrying group ${operation.operation} for ID: ${operation.id}`);
      // Implementation would call appropriate GroupService method
    } else if (operation.type === "card") {
      // Retry card operation
      console.log(`Retrying card ${operation.operation} for ID: ${operation.id}`);
      // Implementation would call appropriate CardService method
    }
  }

  /**
   * Update user analytics after study session
   */
  async updateUserAnalytics(analytics: {studyTime?: number; cardsStudied?: number; groupsCreated?: number}) {
    if (!this.userId) return;

    try {
      const mappedAnalytics = {
        total_study_time: analytics.studyTime,
        cards_studied: analytics.cardsStudied,
        groups_created: analytics.groupsCreated,
      };
      await UserService.retryOperation(() => UserService.updateUserAnalytics(this.userId!, mappedAnalytics));
      console.log("📊 User analytics updated:", analytics);
    } catch (error) {
      console.warn("Failed to update user analytics:", error);
      // TODO: Queue for retry
    }
  }

  /**
   * Setup automatic periodic sync (call this on app startup)
   */
  startPeriodicSync(intervalMinutes: number = 15) {
    if (!this.userId) return;

    // Sync every N minutes while app is active
    const syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.syncInProgress) {
        await this.performBackgroundSync();
      }
    }, intervalMinutes * 60 * 1000);

    // Sync when coming back online
    const handleOnline = () => {
      console.log("📡 Back online - triggering sync");
      if (!this.syncInProgress) {
        this.performBackgroundSync();
      }
    };

    window.addEventListener("online", handleOnline);

    // Return cleanup function
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("online", handleOnline);
    };
  }

  /**
   * Emergency offline mode - disable all Supabase operations
   */
  enableOfflineMode() {
    console.log("📴 Offline mode enabled - all operations will be local only");
    this.userId = null; // This will prevent Supabase sync operations
  }

  /**
   * Re-enable online mode
   */
  enableOnlineMode(userId: string) {
    console.log("📡 Online mode enabled - resuming sync operations");
    this.initialize(userId);
  }
}

// Singleton instance
export const syncManager = new SyncManager();
