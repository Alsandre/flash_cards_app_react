import {getGroupRepo, getCardRepo} from "./repositoryService";
import type {Group} from "../types/group-schema";
import type {Card} from "../types/card-schema";

// Keep hardcoded ID for existing database compatibility
export const STARTER_CARDS_GROUP_ID = "00000000-0000-0000-0000-000000000002";

export class StarterPackService {

  /**
   * Checks if a group is a starter pack
   * Now uses source field instead of hardcoded ID
   */
  static isStarterPack(group: Group): boolean {
    return group.source === "starter_pack";
  }

  /**
   * Checks if a group is a starter pack by ID (for backward compatibility)
   * @deprecated Use isStarterPack(group) instead
   */
  static isStarterPackById(groupId: string): boolean {
    return groupId === STARTER_CARDS_GROUP_ID;
  }

  /**
   * Gets the starter pack if it exists
   */
  static async getStarterPack(): Promise<{group: Group; cards: Card[]} | null> {
    try {
      const group = await getGroupRepo().findById(STARTER_CARDS_GROUP_ID);
      if (!group) return null;

      const cards = await getCardRepo().findByGroupId(STARTER_CARDS_GROUP_ID);
      return {group, cards};
    } catch (error) {
      console.error("Error getting starter pack:", error);
      return null;
    }
  }


}
