import {supabase} from "./supabase";
import type {Card} from "../types/card-schema";

// Supabase-compatible Card interface
export interface SupabaseCard extends Omit<Card, "id" | "createdAt" | "updatedAt" | "groupId"> {
  id?: string;
  group_id: string;
  user_id: string;
  last_studied_at?: string | null;
  next_review_date?: string | null;
  interval_days?: number;
  created_at?: string;
  updated_at?: string;
}

// Card service for Supabase operations
export class CardService {
  /**
   * Get all cards for a specific group
   */
  static async getGroupCards(userId: string, groupId: string): Promise<{data: SupabaseCard[] | null; error: any}> {
    try {
      const {data, error} = await supabase.from("cards").select("*").eq("group_id", groupId).eq("user_id", userId).eq("is_active", true).order("created_at", {ascending: false});

      return {data, error};
    } catch (error) {
      console.error("Error fetching group cards:", error);
      return {data: null, error};
    }
  }

  /**
   * Get all cards for the authenticated user
   */
  static async getUserCards(userId: string): Promise<{data: SupabaseCard[] | null; error: any}> {
    try {
      const {data, error} = await supabase.from("cards").select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", {ascending: false});

      return {data, error};
    } catch (error) {
      console.error("Error fetching user cards:", error);
      return {data: null, error};
    }
  }

  /**
   * Create a new card
   */
  static async createCard(userId: string, groupId: string, cardData: Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">): Promise<{data: SupabaseCard | null; error: any}> {
    try {
      const supabaseCard: Omit<SupabaseCard, "id" | "created_at" | "updated_at"> = {
        user_id: userId,
        group_id: groupId,
        content: cardData.content,
        answer: cardData.answer,
        hint: cardData.hint || "",
        userNote: cardData.userNote || "",
        difficultyRating: cardData.difficultyRating,
        totalAttempts: cardData.totalAttempts || 0,
        correctAttempts: cardData.correctAttempts || 0,
        easeFactor: cardData.easeFactor || 2.5,
        interval: cardData.interval || 1,
        interval_days: cardData.interval || 1,
        repetitions: cardData.repetitions || 0,
        last_studied_at: cardData.lastStudiedAt?.toISOString() || null,
        next_review_date: cardData.nextReviewDate?.toISOString() || null,
        averageResponseTime: cardData.averageResponseTime || 0,
        retentionScore: cardData.retentionScore || 0.0,
        sessionAttempts: cardData.sessionAttempts || [],
        tags: cardData.tags || [],
        isActive: cardData.isActive ?? true,
        source: cardData.source || "user_created",
      };

      const {data, error} = await supabase.from("cards").insert(supabaseCard).select().single();

      return {data, error};
    } catch (error) {
      console.error("Error creating card:", error);
      return {data: null, error};
    }
  }

  /**
   * Update a card
   */
  static async updateCard(userId: string, cardId: string, updates: Partial<Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">>): Promise<{data: SupabaseCard | null; error: any}> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Convert Date fields to ISO strings
      if (updates.lastStudiedAt !== undefined) {
        updateData.last_studied_at = updates.lastStudiedAt?.toISOString() || null;
        delete updateData.lastStudiedAt;
      }
      if (updates.nextReviewDate !== undefined) {
        updateData.next_review_date = updates.nextReviewDate?.toISOString() || null;
        delete updateData.nextReviewDate;
      }
      if (updates.interval !== undefined) {
        updateData.interval_days = updates.interval;
        delete updateData.interval;
      }

      const {data, error} = await supabase
        .from("cards")
        .update(updateData)
        .eq("id", cardId)
        .eq("user_id", userId) // Ensure user owns the card
        .select()
        .single();

      return {data, error};
    } catch (error) {
      console.error("Error updating card:", error);
      return {data: null, error};
    }
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
  ): Promise<{data: SupabaseCard | null; error: any}> {
    try {
      const now = new Date();
      const updateData: any = {
        difficultyRating: rating,
        last_studied_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      if (studyData) {
        if (studyData.responseTime) {
          updateData.averageResponseTime = studyData.responseTime;
        }
        if (studyData.wasCorrect !== undefined) {
          // Note: Manual increment - consider using RPC functions for atomic operations in production
          updateData.totalAttempts = (updateData.totalAttempts || 0) + 1;
          if (studyData.wasCorrect) {
            updateData.correctAttempts = (updateData.correctAttempts || 0) + 1;
          }
        }
      }

      const {data, error} = await supabase.from("cards").update(updateData).eq("id", cardId).eq("user_id", userId).select().single();

      return {data, error};
    } catch (error) {
      console.error("Error updating card rating:", error);
      return {data: null, error};
    }
  }

  /**
   * Delete a card
   */
  static async deleteCard(userId: string, cardId: string): Promise<{error: any}> {
    try {
      const {error} = await supabase.from("cards").delete().eq("id", cardId).eq("user_id", userId); // Ensure user owns the card

      return {error};
    } catch (error) {
      console.error("Error deleting card:", error);
      return {error};
    }
  }

  /**
   * Get cards due for review (spaced repetition)
   */
  static async getCardsDueForReview(userId: string, groupId?: string): Promise<{data: SupabaseCard[] | null; error: any}> {
    try {
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
    } catch (error) {
      console.error("Error fetching cards due for review:", error);
      return {data: null, error};
    }
  }

  /**
   * Get cards by difficulty rating
   */
  static async getCardsByDifficulty(userId: string, rating: "easy" | "medium" | "hard", groupId?: string): Promise<{data: SupabaseCard[] | null; error: any}> {
    try {
      let query = supabase.from("cards").select("*").eq("user_id", userId).eq("difficulty_rating", rating).eq("is_active", true);

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const {data, error} = await query.order("last_studied_at", {ascending: true});

      return {data, error};
    } catch (error) {
      console.error("Error fetching cards by difficulty:", error);
      return {data: null, error};
    }
  }

  /**
   * Get card by ID
   */
  static async getCardById(userId: string, cardId: string): Promise<{data: SupabaseCard | null; error: any}> {
    try {
      const {data, error} = await supabase.from("cards").select("*").eq("id", cardId).eq("user_id", userId).single();

      return {data, error};
    } catch (error) {
      console.error("Error fetching card by ID:", error);
      return {data: null, error};
    }
  }

  /**
   * Bulk update cards (useful for sync operations)
   */
  static async bulkUpdateCards(userId: string, cards: Array<{id: string; updates: Partial<SupabaseCard>}>): Promise<{data: SupabaseCard[] | null; error: any}> {
    try {
      const updates = cards.map(({id, updates: cardUpdates}) => ({
        id,
        user_id: userId,
        ...cardUpdates,
        updated_at: new Date().toISOString(),
      }));

      const {data, error} = await supabase.from("cards").upsert(updates, {onConflict: "id"}).select();

      return {data, error};
    } catch (error) {
      console.error("Error bulk updating cards:", error);
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

        console.warn(`Retrying card operation (attempt ${attempt + 2}/${maxRetries}) after ${delay}ms delay`);
      }
    }

    throw lastError;
  }
}

// Export types
