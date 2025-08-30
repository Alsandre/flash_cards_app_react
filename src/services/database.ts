import Dexie, {type EntityTable} from "dexie";
import type {Group, Card, StudySession, CardRating, SyncMetadata} from "../types/entities";

export class FlashcardDatabase extends Dexie {
  groups!: EntityTable<Group, "id">;
  cards!: EntityTable<Card, "id">;
  studySessions!: EntityTable<StudySession, "id">;
  cardRatings!: EntityTable<CardRating, "id">;
  syncMetadata!: EntityTable<SyncMetadata, "key">;

  constructor() {
    super("FlashcardDatabase");

    this.version(1).stores({
      groups: "id, name, createdAt, updatedAt",
      cards: "id, groupId, lastRating, createdAt, updatedAt, lastReviewedAt",
      studySessions: "id, groupId, startedAt, completedAt, isCompleted",
      cardRatings: "id, sessionId, cardId, timestamp",
      syncMetadata: "key, lastSyncAt, localVersion, cloudVersion",
    });

    this.groups.hook("creating", (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.cardCount = 0;
    });

    this.groups.hook("updating", (modifications) => {
      (modifications as Partial<Group>).updatedAt = new Date();
    });

    this.cards.hook("creating", (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.cards.hook("updating", (modifications) => {
      (modifications as Partial<Card>).updatedAt = new Date();
    });

    this.studySessions.hook("creating", (_primKey, obj) => {
      obj.startedAt = new Date();
      obj.currentCardIndex = 0;
      obj.isCompleted = false;
    });

    this.cardRatings.hook("creating", (_primKey, obj) => {
      obj.timestamp = new Date();
    });
  }

  async updateGroupCardCount(groupId: string): Promise<void> {
    const cardCount = await this.cards.where("groupId").equals(groupId).count();
    await this.groups.update(groupId, {cardCount});
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}

export const db = new FlashcardDatabase();
