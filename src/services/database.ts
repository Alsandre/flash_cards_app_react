import Dexie, {type EntityTable} from "dexie";
import type {Group, Card, StudySession, CardRating, SyncMetadata} from "../types/entities";

// Database class extending Dexie
export class FlashcardDatabase extends Dexie {
  // Define tables with proper typing
  groups!: EntityTable<Group, "id">;
  cards!: EntityTable<Card, "id">;
  studySessions!: EntityTable<StudySession, "id">;
  cardRatings!: EntityTable<CardRating, "id">;
  syncMetadata!: EntityTable<SyncMetadata, "key">;

  constructor() {
    super("FlashcardDatabase");

    // Define schema with indexes as specified in foundation document
    this.version(1).stores({
      groups: "id, name, createdAt, updatedAt",
      cards: "id, groupId, lastRating, createdAt, updatedAt, lastReviewedAt",
      studySessions: "id, groupId, startedAt, completedAt, isCompleted",
      cardRatings: "id, sessionId, cardId, timestamp",
      syncMetadata: "key, lastSyncAt, localVersion, cloudVersion",
    });

    // Add hooks for automatic timestamps and computed fields
    this.groups.hook("creating", (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.cardCount = 0; // Will be computed later
    });

    this.groups.hook("updating", (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
    });

    this.cards.hook("creating", (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.cards.hook("updating", (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
    });

    this.studySessions.hook("creating", (primKey, obj, trans) => {
      obj.startedAt = new Date();
      obj.currentCardIndex = 0;
      obj.isCompleted = false;
    });

    this.cardRatings.hook("creating", (primKey, obj, trans) => {
      obj.timestamp = new Date();
    });
  }

  // Helper method to update group card count
  async updateGroupCardCount(groupId: string): Promise<void> {
    const cardCount = await this.cards.where("groupId").equals(groupId).count();
    await this.groups.update(groupId, {cardCount});
  }

  // Helper method to generate UUIDs
  generateId(): string {
    return crypto.randomUUID();
  }
}

// Create and export database instance
export const db = new FlashcardDatabase();
