import { BaseRepository } from "./base";
import { CardService, type SupabaseCard } from "../services/cardService";
import { supabase } from "../services/supabase";
import type { Card } from "../types/card-schema";

/**
 * Supabase Card Repository - cloud-only operations
 * - All operations go directly to Supabase
 * - User-scoped data access
 * - No local caching or offline support
 */
export class SupabaseCardRepository extends BaseRepository<Card> {
  protected tableName = "cards";

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

  async findAll(): Promise<Card[]> {
    const result = await CardService.retryOperation(() => 
      CardService.getUserCards(this.userId)
    );

    if (result.error || !result.data) {
      console.error("Failed to fetch all cards:", result.error?.message);
      return [];
    }

    return this.convertSupabaseCardsToLocal(result.data);
  }

  async findById(id: string): Promise<Card | null> {
    const result = await CardService.retryOperation(() => 
      CardService.getCardById(this.userId, id)
    );

    if (result.error || !result.data) {
      return null;
    }

    return this.convertSupabaseCardToLocal(result.data);
  }

  async findByGroupId(groupId: string): Promise<Card[]> {
    const result = await CardService.retryOperation(() => 
      CardService.getGroupCards(this.userId, groupId)
    );

    if (result.error || !result.data) {
      console.error("Failed to fetch group cards:", result.error?.message);
      return [];
    }

    return this.convertSupabaseCardsToLocal(result.data);
  }

  async create(entity: Omit<Card, "id">): Promise<Card> {
    const result = await CardService.retryOperation(() => 
      CardService.createCard(this.userId, entity.groupId, entity)
    );

    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to create card");
    }

    return this.convertSupabaseCardToLocal(result.data);
  }

  async update(id: string, updates: Partial<Card>): Promise<Card> {
    const result = await CardService.retryOperation(() => 
      CardService.updateCard(this.userId, id, updates)
    );

    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to update card");
    }

    return this.convertSupabaseCardToLocal(result.data);
  }

  async delete(id: string): Promise<void> {
    // Direct Supabase call since CardService doesn't have deleteCard method yet
    const { error } = await supabase.from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId);

    if (error) {
      throw new Error(error.message || "Failed to delete card");
    }
  }

  /**
   * Convert Supabase card format to local Card interface
   */
  private convertSupabaseCardToLocal(supabaseCard: SupabaseCard): Card {
    return {
      id: supabaseCard.id || this.generateId(),
      groupId: supabaseCard.group_id,
      content: supabaseCard.content,
      answer: supabaseCard.answer,
      hint: supabaseCard.hint || "",
      userNote: supabaseCard.user_note || "",
      difficultyRating: supabaseCard.difficulty_rating || null,
      totalAttempts: supabaseCard.total_attempts || 0,
      correctAttempts: supabaseCard.correct_attempts || 0,
      easeFactor: supabaseCard.ease_factor || 2.5,
      interval: supabaseCard.interval_days || 1,
      repetitions: supabaseCard.repetitions || 0,
      lastStudiedAt: supabaseCard.last_studied_at ? new Date(supabaseCard.last_studied_at) : undefined,
      nextReviewDate: supabaseCard.next_review_date ? new Date(supabaseCard.next_review_date) : undefined,
      averageResponseTime: supabaseCard.average_response_time || 0,
      retentionScore: supabaseCard.retention_score || 0.0,
      tags: supabaseCard.tags || [],
      isActive: supabaseCard.is_active ?? true,
      source: supabaseCard.source || "user_created",
      createdAt: supabaseCard.created_at ? new Date(supabaseCard.created_at) : new Date(),
      updatedAt: supabaseCard.updated_at ? new Date(supabaseCard.updated_at) : new Date(),
    };
  }

  /**
   * Convert array of Supabase cards to local format
   */
  private convertSupabaseCardsToLocal(supabaseCards: SupabaseCard[]): Card[] {
    return supabaseCards.map(card => this.convertSupabaseCardToLocal(card));
  }
}
