// Session and database-related type definitions

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
