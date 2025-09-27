import {supabase} from "./supabase";
import type {PostgrestError} from "@supabase/supabase-js";
import type {Card} from "../types/card-schema";

// Supabase Card interface - matches exact database schema with snake_case
export interface SupabaseCard {
  id?: string;
  group_id: string;
  user_id: string;
  content: string;
  answer: string;
  hint?: string | null;
  user_note?: string | null;
  tags?: string[] | null;
  difficulty_rating?: "easy" | "medium" | "hard" | null;
  total_attempts?: number;
  correct_attempts?: number;
  last_studied_at?: string | null;
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_date?: string | null;
  average_response_time?: number;
  retention_score?: number;
  is_active?: boolean;
  source?: "user_created" | "starter_pack";
  created_at?: string;
  updated_at?: string;
}

// Card service for Supabase operations
export class CardService {
  /**
   * Get all cards for a specific group
   */
  static async getGroupCards(userId: string, groupId: string): Promise<{data: SupabaseCard[] | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("cards").select("*").eq("group_id", groupId).eq("user_id", userId).eq("is_active", true).order("created_at", {ascending: false});

    return {data, error};
  }

  /**
   * Get all cards for the authenticated user
   */
  static async getUserCards(userId: string): Promise<{data: SupabaseCard[] | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("cards").select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", {ascending: false});

    return {data, error};
  }

  /**
   * Create a new card
   */
  static async createCard(userId: string, groupId: string, cardData: Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">, customId?: string): Promise<{data: SupabaseCard | null; error: PostgrestError | null}> {
    const supabaseCard: Omit<SupabaseCard, "created_at" | "updated_at"> = {
      id: customId || crypto.randomUUID(), // Use provided ID or generate new one
      user_id: userId,
      group_id: groupId,
      content: cardData.content,
      answer: cardData.answer,
      hint: cardData.hint || "",
      user_note: cardData.userNote || "",
      difficulty_rating: cardData.difficultyRating,
      total_attempts: cardData.totalAttempts || 0,
      correct_attempts: cardData.correctAttempts || 0,
      ease_factor: cardData.easeFactor || 2.5,
      // interval is mapped to interval_days in database
      interval_days: cardData.interval || 1,
      repetitions: cardData.repetitions || 0,
      last_studied_at: cardData.lastStudiedAt?.toISOString() || null,
      next_review_date: cardData.nextReviewDate?.toISOString() || null,
      average_response_time: cardData.averageResponseTime || 0,
      retention_score: cardData.retentionScore || 0.0,
      tags: cardData.tags || [],
      is_active: cardData.isActive ?? true,
      source: cardData.source || "user_created",
    };

    const {data, error} = await supabase.from("cards").insert(supabaseCard).select().single();

    return {data, error};
  }

  /**
   * Update a card
   */
  static async updateCard(userId: string, cardId: string, updates: Partial<Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">>): Promise<{data: SupabaseCard | null; error: PostgrestError | null}> {
    const updateData: Partial<SupabaseCard> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Convert Date fields to ISO strings and handle property mapping
    if (updates.lastStudiedAt !== undefined) {
      updateData.last_studied_at = updates.lastStudiedAt?.toISOString() || null;
    }
    if (updates.nextReviewDate !== undefined) {
      updateData.next_review_date = updates.nextReviewDate?.toISOString() || null;
    }
    if (updates.interval !== undefined) {
      updateData.interval_days = updates.interval;
    }

    const {data, error} = await supabase
      .from("cards")
      .update(updateData)
      .eq("id", cardId)
      .eq("user_id", userId) // Ensure user owns the card
      .select()
      .single();

    return {data, error};
  }

  /**
   * Update card rating and study progress
   */
  static async updateCardRating(
    userId: string,
    cardId: string,
    rating: "easy" | "medium" | "hard",
    studyData?: {
      responseTime?: number;
      wasCorrect?: boolean;
    }
  ): Promise<{data: SupabaseCard | null; error: PostgrestError | null}> {
    const now = new Date();
    const updateData: Partial<SupabaseCard> = {
      difficulty_rating: rating,
      last_studied_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (studyData) {
      if (studyData.responseTime) {
        updateData.average_response_time = studyData.responseTime;
      }
      if (studyData.wasCorrect !== undefined) {
        // Note: Manual increment - consider using RPC functions for atomic operations in production
        updateData.total_attempts = (updateData.total_attempts || 0) + 1;
        if (studyData.wasCorrect) {
          updateData.correct_attempts = (updateData.correct_attempts || 0) + 1;
        }
      }
    }

    const {data, error} = await supabase.from("cards").update(updateData).eq("id", cardId).eq("user_id", userId).select().single();

    return {data, error};
  }

  /**
   * Delete a card
   */
  static async deleteCard(userId: string, cardId: string): Promise<{error: PostgrestError | null}> {
    const {error} = await supabase.from("cards").delete().eq("id", cardId).eq("user_id", userId); // Ensure user owns the card

    return {error};
  }

  /**
   * Get cards due for review (spaced repetition)
   */
  static async getCardsDueForReview(userId: string, groupId?: string): Promise<{data: SupabaseCard[] | null; error: PostgrestError | null}> {
    let query = supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .or("next_review_date.is.null,next_review_date.lte." + new Date().toISOString());

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const {data, error} = await query.order("next_review_date", {ascending: true});

    return {data, error};
  }

  /**
   * Get cards by difficulty rating
   */
  static async getCardsByDifficulty(userId: string, rating: "easy" | "medium" | "hard", groupId?: string): Promise<{data: SupabaseCard[] | null; error: PostgrestError | null}> {
    let query = supabase.from("cards").select("*").eq("user_id", userId).eq("difficulty_rating", rating).eq("is_active", true);

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const {data, error} = await query.order("last_studied_at", {ascending: true});

    return {data, error};
  }

  /**
   * Get card by ID
   */
  static async getCardById(userId: string, cardId: string): Promise<{data: SupabaseCard | null; error: PostgrestError | null}> {
    const {data, error} = await supabase.from("cards").select("*").eq("id", cardId).eq("user_id", userId).single();

    return {data, error};
  }

  /**
   * Bulk update cards (useful for sync operations)
   */
  static async bulkUpdateCards(userId: string, cards: Array<{id: string; updates: Partial<SupabaseCard>}>): Promise<{data: SupabaseCard[] | null; error: PostgrestError | null}> {
    const updates = cards.map(({id, updates: cardUpdates}) => ({
      id,
      user_id: userId,
      ...cardUpdates,
      updated_at: new Date().toISOString(),
    }));

    const {data, error} = await supabase.from("cards").upsert(updates, {onConflict: "id"}).select();

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

        console.warn(`Retrying card operation (attempt ${attempt + 2}/${maxRetries}) after ${delay}ms delay`);
      }
    }

    throw lastError;
  }
}

// Export types
