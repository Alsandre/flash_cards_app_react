import {BaseRepository} from "./base";
import {db} from "../services/database";
import type {Card} from "../types/card-schema";

export class CardRepository extends BaseRepository<Card> {
  protected tableName = "cards";

  async findAll(): Promise<Card[]> {
    return await db.cards.orderBy("createdAt").toArray();
  }

  async findById(id: string): Promise<Card | null> {
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

    await db.cards.add(card);

    // Update group card count
    await db.updateGroupCardCount(entity.groupId);

    return card;
  }

  async update(id: string, updates: Partial<Card>): Promise<Card> {
    const existingCard = await this.findById(id);
    if (!existingCard) {
      throw new Error(`Card with id ${id} not found`);
    }

    await db.cards.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const updatedCard = await this.findById(id);
    if (!updatedCard) {
      throw new Error(`Card with id ${id} not found after update`);
    }

    // Update group card count if groupId changed
    if (updates.groupId && updates.groupId !== existingCard.groupId) {
      await db.updateGroupCardCount(existingCard.groupId);
      await db.updateGroupCardCount(updates.groupId);
    }

    return updatedCard;
  }

  async delete(id: string): Promise<void> {
    const card = await this.findById(id);
    if (card) {
      await db.cards.delete(id);
      await db.updateGroupCardCount(card.groupId);
    }
  }

  // Additional methods specific to cards
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
}
