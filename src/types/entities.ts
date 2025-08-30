export interface Group {
  id: string;
  name: string;
  description?: string;
  studyCardCount: number;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
}

export interface Card {
  id: string;
  groupId: string;
  front: string;
  back: string;
  hint?: string;
  properties: Record<string, any>;
  lastRating?: "dont_know" | "doubt" | "know";
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
}

export interface StudySession {
  id: string;
  groupId: string;
  startedAt: Date;
  completedAt?: Date;
  totalCards: number;
  currentCardIndex: number;
  isCompleted: boolean;
}

export interface CardRating {
  id: string;
  sessionId: string;
  cardId: string;
  rating: "dont_know" | "doubt" | "know";
  timestamp: Date;
}

export interface SyncMetadata {
  key: string;
  lastSyncAt?: Date;
  localVersion: number;
  cloudVersion?: number;
  conflicts: string[];
}

export type Rating = "dont_know" | "doubt" | "know";
