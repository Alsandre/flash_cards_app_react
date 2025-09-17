import {BaseRepository} from "./base";
import {db} from "../services/database";
import {CardService} from "../services/cardService";
import type {Card} from "../types/card-schema";

/**
 * Hybrid Card Repository - implements dual-write pattern
 * - Writes to both IndexedDB (immediate) and Supabase (background)
 * - Reads from IndexedDB for speed
 * - Handles offline/online scenarios gracefully
 */
export class HybridCardRepository extends BaseRepository<Card> {
  protected tableName = "cards";

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

  async findAll(): Promise<Card[]> {
    // Always read from IndexedDB for speed
    return await db.cards.orderBy("createdAt").toArray();
  }

  async findById(id: string): Promise<Card | null> {
    // Always read from IndexedDB for speed
    const card = await db.cards.get(id);
    return card || null;
  }

  async create(entity: Omit<Card, "id">): Promise<Card> {
    const id = this.generateId();
    const card: Card = {
      ...entity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. Write to IndexedDB immediately (local-first)
    await db.cards.add(card);

    // Update group card count
    await db.updateGroupCardCount(entity.groupId);

    // 2. Background sync to Supabase (if user is authenticated and not starter pack)
    if (this.userId && card.source !== "starter_pack") {
      this.syncToSupabase("create", card).catch((error) => {
        console.warn("Background sync failed for card creation:", error);
        // TODO: Queue for retry
      });
    }

    return card;
  }

  async update(id: string, updates: Partial<Card>): Promise<Card> {
    const existingCard = await this.findById(id);
    if (!existingCard) {
      throw new Error(`Card with id ${id} not found`);
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // 1. Update IndexedDB immediately
    await db.cards.update(id, updateData);

    const updatedCard = await this.findById(id);
    if (!updatedCard) {
      throw new Error(`Card with id ${id} not found after update`);
    }

    // Update group card count if groupId changed
    if (updates.groupId && updates.groupId !== existingCard.groupId) {
      await db.updateGroupCardCount(existingCard.groupId);
      await db.updateGroupCardCount(updates.groupId);
    }

    // 2. Background sync to Supabase (if user is authenticated and not starter pack)
    if (this.userId && updatedCard.source !== "starter_pack") {
      this.syncToSupabase("update", updatedCard).catch((error) => {
        console.warn("Background sync failed for card update:", error);
        // TODO: Queue for retry
      });
    }

    return updatedCard;
  }

  async delete(id: string): Promise<void> {
    // Get card before deletion for sync
    const cardToDelete = await this.findById(id);

    if (!cardToDelete) {
      throw new Error(`Card with id ${id} not found`);
    }

    // Immediate dual delete - fail if either fails
    const deletePromises = [
      // Delete from IndexedDB and update group count
      this.deleteFromLocal(id, cardToDelete.groupId),
    ];

    // Add Supabase deletion if user is authenticated and not starter pack
    if (this.userId && cardToDelete.source !== "starter_pack") {
      deletePromises.push(
        CardService.deleteCard(this.userId, id).then((result) => {
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
   * Delete from local IndexedDB only
   */
  private async deleteFromLocal(id: string, groupId: string): Promise<void> {
    await db.cards.delete(id);
    await db.updateGroupCardCount(groupId);
  }

  /**
   * Background sync operation to Supabase
   */
  private async syncToSupabase(operation: "create" | "update" | "delete", card: Card): Promise<void> {
    if (!this.userId) return;

    try {
      switch (operation) {
        case "create":
          await CardService.retryOperation(
            () =>
              CardService.createCard(
                this.userId!,
                card.groupId,
                {
                  content: card.content,
                  answer: card.answer,
                  hint: card.hint,
                  userNote: card.userNote,
                  difficultyRating: card.difficultyRating,
                  totalAttempts: card.totalAttempts,
                  correctAttempts: card.correctAttempts,
                  easeFactor: card.easeFactor,
                  interval: card.interval,
                  repetitions: card.repetitions,
                  lastStudiedAt: card.lastStudiedAt,
                  nextReviewDate: card.nextReviewDate,
                  averageResponseTime: card.averageResponseTime,
                  retentionScore: card.retentionScore,
                  sessionAttempts: card.sessionAttempts,
                  tags: card.tags,
                  isActive: card.isActive,
                  source: card.source,
                },
                card.id
              ) // 🎯 PRESERVE LOCAL ID
          );
          break;

        case "update":
          await CardService.retryOperation(() =>
            CardService.updateCard(this.userId!, card.id, {
              content: card.content,
              answer: card.answer,
              hint: card.hint,
              userNote: card.userNote,
              difficultyRating: card.difficultyRating,
              totalAttempts: card.totalAttempts,
              correctAttempts: card.correctAttempts,
              easeFactor: card.easeFactor,
              interval: card.interval,
              repetitions: card.repetitions,
              lastStudiedAt: card.lastStudiedAt,
              nextReviewDate: card.nextReviewDate,
              averageResponseTime: card.averageResponseTime,
              retentionScore: card.retentionScore,
              sessionAttempts: card.sessionAttempts,
              tags: card.tags,
              isActive: card.isActive,
              source: card.source,
            })
          );
          break;

        case "delete":
          await CardService.retryOperation(() => CardService.deleteCard(this.userId!, card.id));
          break;
      }
    } catch (error) {
      console.error(`Supabase sync failed for card ${operation} after retries:`, error);

      // Enhanced error handling - don't re-throw to prevent UI breakage
      // The local operation succeeded, sync will retry later
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          console.warn(`Network error during card ${operation}, will retry on reconnect`);
        } else if (error.message.includes("auth") || error.message.includes("unauthorized")) {
          console.error(`Auth error during card ${operation}, user may need to re-authenticate`);
        } else {
          console.error(`Unknown sync error during card ${operation}:`, error.message);
        }
      }

      // Don't re-throw - local operation succeeded, sync can retry later
    }
  }

  /**
   * Sync cards from Supabase to IndexedDB
   * Used for initial load and periodic sync
   */
  async syncFromSupabase(groupId?: string): Promise<{synced: number; error?: string}> {
    if (!this.userId) {
      return {synced: 0, error: "User not authenticated"};
    }

    try {
      const result = groupId ? await CardService.retryOperation(() => CardService.getGroupCards(this.userId!, groupId)) : await CardService.retryOperation(() => CardService.getUserCards(this.userId!));

      if (result.error || !result.data) {
        return {synced: 0, error: result.error?.message || "Failed to fetch cards"};
      }

      const supabaseCards = result.data;
      let syncedCount = 0;

      for (const supabaseCard of supabaseCards) {
        // Convert Supabase format to local format
        const localCard: Card = {
          id: supabaseCard.id || this.generateId(),
          groupId: supabaseCard.group_id,
          content: supabaseCard.content,
          answer: supabaseCard.answer,
          hint: supabaseCard.hint || "",
          userNote: supabaseCard.userNote || "",
          difficultyRating: supabaseCard.difficultyRating,
          totalAttempts: supabaseCard.totalAttempts || 0,
          correctAttempts: supabaseCard.correctAttempts || 0,
          easeFactor: supabaseCard.easeFactor || 2.5,
          interval: supabaseCard.interval_days || 1,
          repetitions: supabaseCard.repetitions || 0,
          lastStudiedAt: supabaseCard.last_studied_at ? new Date(supabaseCard.last_studied_at) : undefined,
          nextReviewDate: supabaseCard.next_review_date ? new Date(supabaseCard.next_review_date) : undefined,
          averageResponseTime: supabaseCard.averageResponseTime || 0,
          retentionScore: supabaseCard.retentionScore || 0.0,
          sessionAttempts: supabaseCard.sessionAttempts || [],
          tags: supabaseCard.tags || [],
          isActive: supabaseCard.is_active ?? true,
          source: supabaseCard.source || "user_created",
          createdAt: supabaseCard.created_at ? new Date(supabaseCard.created_at) : new Date(),
          updatedAt: supabaseCard.updated_at ? new Date(supabaseCard.updated_at) : new Date(),
        };

        // Check if card exists locally
        const existingCard = await this.findById(localCard.id);

        if (!existingCard) {
          // Add new card
          await db.cards.add(localCard);
          syncedCount++;
        } else {
          // Update if cloud version is newer
          if (localCard.updatedAt > existingCard.updatedAt) {
            await db.cards.update(localCard.id, {
              content: localCard.content,
              answer: localCard.answer,
              hint: localCard.hint,
              userNote: localCard.userNote,
              difficultyRating: localCard.difficultyRating,
              totalAttempts: localCard.totalAttempts,
              correctAttempts: localCard.correctAttempts,
              easeFactor: localCard.easeFactor,
              interval: localCard.interval,
              repetitions: localCard.repetitions,
              lastStudiedAt: localCard.lastStudiedAt,
              nextReviewDate: localCard.nextReviewDate,
              averageResponseTime: localCard.averageResponseTime,
              retentionScore: localCard.retentionScore,
              sessionAttempts: localCard.sessionAttempts,
              tags: localCard.tags,
              isActive: localCard.isActive,
              updatedAt: new Date(),
            });
            syncedCount++;
          }
        }
      }

      // Update group card counts after sync
      if (syncedCount > 0) {
        const affectedGroupIds = groupId ? [groupId] : [...new Set(supabaseCards.map((card) => card.group_id))];

        for (const affectedGroupId of affectedGroupIds) {
          await db.updateGroupCardCount(affectedGroupId);
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

  // Legacy methods preserved for backward compatibility
  async findByGroupId(groupId: string): Promise<Card[]> {
    return await db.cards.where("groupId").equals(groupId).toArray();
  }

  async findByRating(rating: "easy" | "medium" | "hard"): Promise<Card[]> {
    return await db.cards.where("difficultyRating").equals(rating).toArray();
  }

  async findByGroupAndRating(groupId: string, rating: "easy" | "medium" | "hard"): Promise<Card[]> {
    return await db.cards
      .where("groupId")
      .equals(groupId)
      .and((card) => card.difficultyRating === rating)
      .toArray();
  }

  async updateRating(cardId: string, rating: "easy" | "medium" | "hard"): Promise<Card> {
    return await this.update(cardId, {
      difficultyRating: rating,
      lastStudiedAt: new Date(),
    });
  }

  async getCardsForStudySession(groupId: string, limit: number): Promise<Card[]> {
    // Get cards for study session, prioritizing cards that haven't been reviewed
    // or were rated as "hard" or "medium"
    const cards = await db.cards.where("groupId").equals(groupId).toArray();

    // Sort by priority: unreviewed first, then by difficulty rating (hard, medium, easy)
    const sortedCards = cards.sort((a, b) => {
      // Unreviewed cards first
      if (!a.lastStudiedAt && b.lastStudiedAt) return -1;
      if (a.lastStudiedAt && !b.lastStudiedAt) return 1;

      // Then by rating priority (hard cards need more practice)
      const ratingPriority = {hard: 0, medium: 1, easy: 2};
      const aPriority = a.difficultyRating ? ratingPriority[a.difficultyRating] : -1;
      const bPriority = b.difficultyRating ? ratingPriority[b.difficultyRating] : -1;

      return aPriority - bPriority;
    });

    return sortedCards.slice(0, limit);
  }

  async saveAllCards(cards: Card[]): Promise<void> {
    // Clear existing cards and save new ones
    await db.cards.clear();
    // Create mutable copies to avoid "read-only property" errors
    const mutableCards = cards.map((card) => ({...card}));
    await db.cards.bulkAdd(mutableCards);

    // Update group card counts for all groups
    const groupIds = [...new Set(cards.map((card) => card.groupId))];
    for (const groupId of groupIds) {
      await db.updateGroupCardCount(groupId);
    }
  }

  /**
   * Force sync - useful for manual sync operations
   */
  async forceSyncFromSupabase(groupId?: string): Promise<{synced: number; error?: string}> {
    return await this.syncFromSupabase(groupId);
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

  /**
   * Sync specific card rating update
   */
  async syncRatingUpdate(cardId: string, rating: "easy" | "medium" | "hard", studyData?: {responseTime?: number; wasCorrect?: boolean}): Promise<void> {
    if (this.userId) {
      try {
        await CardService.retryOperation(() => CardService.updateCardRating(this.userId!, cardId, rating, studyData));
      } catch (error) {
        console.warn("Background rating sync failed:", error);
        // TODO: Queue for retry
      }
    }
  }
}
