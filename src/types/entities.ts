// Core data models as defined in foundation document

export interface Group {
  id: string; // UUID
  name: string;
  description?: string;
  studyCardCount: number; // X cards per session
  createdAt: Date;
  updatedAt: Date;
  cardCount: number; // computed field
}

export interface Card {
  id: string; // UUID
  groupId: string; // foreign key
  front: string;
  back: string;
  properties: Record<string, any>; // flexible properties for filtering
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
  key: string; // Primary key for sync metadata
  lastSyncAt?: Date;
  localVersion: number;
  cloudVersion?: number;
  conflicts: string[]; // array of conflicted entity IDs
}

// Type for card ratings
export type Rating = "dont_know" | "doubt" | "know";
