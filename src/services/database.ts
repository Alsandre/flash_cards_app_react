import Dexie, {type EntityTable} from "dexie";
import type {Group} from "../types/group-schema";
import type {Card} from "../types/card-schema";
import type {StudySession, CardRating, SyncMetadata} from "../types/session-schema";

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

    // Version 2: Add new schema fields
    this.version(2)
      .stores({
        groups: "id, name, createdAt, updatedAt, isActive, source, version",
        cards: "id, groupId, createdAt, updatedAt, isActive, source, version, content, answer, nextReviewDate",
        studySessions: "id, groupId, startedAt, completedAt, isCompleted",
        cardRatings: "id, sessionId, cardId, timestamp",
        syncMetadata: "key, lastSyncAt, localVersion, cloudVersion",
      })
      .upgrade((tx) => {
        // Migrate existing groups to new schema
        return tx
          .table("groups")
          .toCollection()
          .modify((group) => {
            if (!group.studyCardCount) group.studyCardCount = group.cardCount || 0;
            if (!group.tags) group.tags = [];
            if (group.isActive === undefined) group.isActive = true;
            if (!group.source) group.source = "user_created";
          });
      });

    this.groups.hook("creating", (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.cardCount = 0;
      obj.studyCardCount = 0;
      if (!obj.tags) obj.tags = [];
      if (obj.isActive === undefined) obj.isActive = true;
      if (!obj.source) obj.source = "user_created";
    });

    this.groups.hook("updating", (modifications) => {
      (modifications as Partial<Group>).updatedAt = new Date();
    });

    this.cards.hook("creating", (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      // Set defaults for new schema fields
      if (!obj.userNote) obj.userNote = "";
      if (!obj.totalAttempts) obj.totalAttempts = 0;
      if (!obj.correctAttempts) obj.correctAttempts = 0;
      if (!obj.sessionAttempts) obj.sessionAttempts = [];
      if (!obj.easeFactor) obj.easeFactor = 2.5;
      if (!obj.interval) obj.interval = 1;
      if (!obj.repetitions) obj.repetitions = 0;
      if (!obj.averageResponseTime) obj.averageResponseTime = 0;
      if (!obj.difficultyRating) obj.difficultyRating = null;
      if (!obj.retentionScore) obj.retentionScore = 0.0;
      if (!obj.tags) obj.tags = [];
      if (obj.isActive === undefined) obj.isActive = true;
      if (!obj.source) obj.source = "user_created";
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
    const studyCardCount = await this.cards
      .where("groupId")
      .equals(groupId)
      .and((card) => card.isActive !== false)
      .count();
    await this.groups.update(groupId, {cardCount, studyCardCount});
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}

export const db = new FlashcardDatabase();
