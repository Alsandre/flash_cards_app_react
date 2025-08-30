import {BaseRepository} from "./base";
import {db} from "../services/database";
import type {Card, Rating} from "../types/entities";

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

  async findByRating(rating: Rating): Promise<Card[]> {
    return await db.cards.where("lastRating").equals(rating).toArray();
  }

  async findByGroupAndRating(groupId: string, rating: Rating): Promise<Card[]> {
    return await db.cards
      .where("groupId")
      .equals(groupId)
      .and((card) => card.lastRating === rating)
      .toArray();
  }

  async updateRating(cardId: string, rating: Rating): Promise<Card> {
    return await this.update(cardId, {
      lastRating: rating,
      lastReviewedAt: new Date(),
    });
  }

  async getCardsForStudySession(groupId: string, limit: number): Promise<Card[]> {
    // Get cards for study session, prioritizing cards that haven't been reviewed
    // or were rated as "dont_know" or "doubt"
    const cards = await db.cards.where("groupId").equals(groupId).toArray();

    // Sort by priority: unreviewed first, then by last rating (dont_know, doubt, know)
    const sortedCards = cards.sort((a, b) => {
      // Unreviewed cards first
      if (!a.lastReviewedAt && b.lastReviewedAt) return -1;
      if (a.lastReviewedAt && !b.lastReviewedAt) return 1;

      // Then by rating priority
      const ratingPriority = {dont_know: 0, doubt: 1, know: 2};
      const aPriority = a.lastRating ? ratingPriority[a.lastRating] : -1;
      const bPriority = b.lastRating ? ratingPriority[b.lastRating] : -1;

      return aPriority - bPriority;
    });

    return sortedCards.slice(0, limit);
  }
}
