/**
 * Card Schema Interface
 *
 * Single source of truth for card data across all session types.
 * Supports current functionality and future backend migration.
 */

export interface Card {
  // ========================================
  // CORE IDENTITY
  // ========================================

  /** Unique identifier for the card */
  id: string;

  /** Reference to the parent group */
  groupId: string;

  /** When the card was first created */
  createdAt: Date;

  /** When the card was last modified */
  updatedAt: Date;

  // ========================================
  // CONTENT (Immutable)
  // ========================================

  /** The question, prompt, or front-side content */
  content: string;

  /** The correct answer or back-side content */
  answer: string;

  /** Optional hint text to assist with answering */
  hint?: string;

  // ========================================
  // USER PROGRESS DATA
  // ========================================

  /** User's personal note for this card */
  userNote: string;

  /** Timestamp of last study session for this card */
  lastStudiedAt?: Date;

  /** Total number of times this card has been studied */
  totalAttempts: number;

  /** Number of successful/correct attempts */
  correctAttempts: number;

  // ========================================
  // CURRENT SESSION STATE
  // ========================================

  /** User's answer in the current session (temporary) */
  currentUserAnswer?: string;

  /** User's difficulty rating in current session (temporary) */
  currentRating?: StudyRating;

  // ========================================
  // SPACED REPETITION ALGORITHM
  // ========================================

  /** Ease factor for spaced repetition (default: 2.5) */
  easeFactor: number;

  /** Current interval in days until next review (default: 1) */
  interval: number;

  /** Number of consecutive correct answers */
  repetitions: number;

  /** When this card should next appear for review */
  nextReviewDate?: Date;

  // ========================================
  // PERFORMANCE ANALYTICS
  // ========================================

  /** Average response time in milliseconds */
  averageResponseTime: number;

  /** User-perceived difficulty rating */
  difficultyRating: "easy" | "medium" | "hard" | null;

  /** Success rate over time (0.0-1.0) */
  retentionScore: number;

  // ========================================
  // META INFORMATION
  // ========================================

  /** Categorization tags for organization */
  tags: string[];

  /** Whether this card can be studied/shown */
  isActive: boolean;

  /** Origin of this card (starter pack vs user created) */
  source: CardSource;

}

/**
 * Individual study attempt record
 * Used for detailed analytics and algorithm improvement
 */
export interface StudyAttempt {
  /** When this attempt occurred */
  timestamp: Date;

  /** What the user submitted as their answer */
  userAnswer: string;

  /** Whether the answer was deemed correct */
  isCorrect: boolean;

  /** How long it took to answer (milliseconds) */
  responseTimeMs: number;

  /** User's difficulty rating for this attempt */
  rating: StudyRating;

  /** Which study mode was active */
  studyMode: StudyMode;
}

/**
 * User's subjective difficulty rating
 */
export type StudyRating = "easy" | "medium" | "hard";

/**
 * Available study session modes
 */
export type StudyMode = "flow" | "commit" | "validate" | "mastery";

/**
 * Card origin tracking
 */
export type CardSource = "starter_pack" | "user_created";

/**
 * Minimal card data for read-only operations (explore mode)
 */
export interface CardReadOnly {
  id: string;
  content: string;
  answer: string;
  hint?: string;
}

/**
 * Card data optimized for study session operations
 */
export interface CardStudyView extends CardReadOnly {
  userNote: string;
  lastStudiedAt?: Date;
  easeFactor: number;
  interval: number;
  nextReviewDate?: Date;
}

/**
 * Aggregated card statistics for analytics
 */
export interface CardStats {
  cardId: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  averageResponseTime: number;
  lastStudied?: Date;
  currentStreak: number;
  bestStreak: number;
}

/**
 * Default values for new cards
 */
export const DEFAULT_CARD_VALUES = {
  userNote: "",
  totalAttempts: 0,
  correctAttempts: 0,
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  averageResponseTime: 0,
  difficultyRating: null,
  retentionScore: 0.0,
  tags: [] as string[],
  isActive: true,
  source: "user_created" as CardSource,
} as const;
