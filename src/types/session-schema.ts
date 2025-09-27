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

// SyncMetadata removed - no longer using IndexedDB sync

export type Rating = "dont_know" | "doubt" | "know";
