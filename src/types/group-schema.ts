/**
 * Group Schema Interface
 *
 * Single source of truth for group data across all session types.
 * Compatible with the new Redux store and backend migration.
 */

export interface Group {
  // ========================================
  // CORE IDENTITY
  // ========================================

  /** Unique identifier for the group */
  id: string;

  /** Display name of the group */
  name: string;

  /** Optional description of the group */
  description?: string;

  /** When the group was first created */
  createdAt: Date;

  /** When the group was last modified */
  updatedAt: Date;

  // ========================================
  // METADATA
  // ========================================

  /** Number of cards in this group (computed) */
  cardCount: number;

  /** Number of cards available for study (computed) */
  studyCardCount: number;

  /** Categorization tags for organization */
  tags: string[];

  /** Whether this group can be studied/shown */
  isActive: boolean;

  /** Origin of this group (starter pack vs user created) */
  source: GroupSource;

}

/**
 * Group origin tracking
 */
export type GroupSource = "starter_pack" | "user_created";

/**
 * Minimal group data for read-only operations
 */
export interface GroupReadOnly {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
}

/**
 * Group data with statistics for analytics
 */
export interface GroupStats extends GroupReadOnly {
  studyCardCount: number;
  averageCardScore: number;
  lastStudiedAt?: Date;
  totalStudySessions: number;
  completionRate: number;
}

/**
 * Default values for new groups
 */
export const DEFAULT_GROUP_VALUES = {
  cardCount: 0,
  studyCardCount: 0,
  tags: [],
  isActive: true,
  source: "user_created" as GroupSource,
} as const;

