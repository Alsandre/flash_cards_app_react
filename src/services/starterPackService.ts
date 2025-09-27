import {STARTER_PACK, STARTER_CARDS_GROUP_ID, STARTER_PACK_VERSION} from "../data/starterPack";
import {getGroupRepo, getCardRepo} from "./repositoryService";
import type {Group} from "../types/group-schema";
import type {Card} from "../types/card-schema";

export class StarterPackService {
  /**
   * Ensures the starter pack is always available
   * Called on app initialization
   */
  static async ensureStarterPackExists(): Promise<{group: Group; cards: Card[]}> {
    try {
      // Check if starter pack group already exists
      const existingGroup = await getGroupRepo().findById(STARTER_CARDS_GROUP_ID);

      if (existingGroup) {
        // Check if source is correct - recreate if wrong
        if (existingGroup.source !== "starter_pack") {
          return await this.recreateStarterPack();
        }

        // Check if version matches - recreate if outdated
        const currentVersion = existingGroup.description?.match(/v(\d+\.\d+)/)?.[1];
        if (currentVersion !== STARTER_PACK_VERSION) {
          return await this.recreateStarterPack();
        }

        // Group exists, get its cards
        const cards = await getCardRepo().findByGroupId(STARTER_CARDS_GROUP_ID);

        // If cards are missing, recreate them
        if (cards.length === 0) {
          const createdCards = await this.createStarterCards(existingGroup);
          return {group: existingGroup, cards: createdCards};
        }

        return {group: existingGroup, cards};
      }

      // Create the starter pack from scratch
      return await this.createStarterPack();
    } catch (error) {
      console.error("Error ensuring starter pack exists:", error);
      // If it's a constraint error (duplicate key), the group already exists
      if (error instanceof Error && error.message.includes("Key already exists")) {
        const existingGroup = await getGroupRepo().findById(STARTER_CARDS_GROUP_ID);
        const cards = await getCardRepo().findByGroupId(STARTER_CARDS_GROUP_ID);
        if (existingGroup) {
          return {group: existingGroup, cards};
        }
      }
      // For other errors, re-throw
      throw error;
    }
  }

  /**
   * Creates the complete starter pack (group + cards)
   */
  private static async createStarterPack(): Promise<{group: Group; cards: Card[]}> {
    // Create the group with fixed ID
    const group = await getGroupRepo().create(STARTER_PACK.group, STARTER_CARDS_GROUP_ID); // Use fixed ID

    // Create all cards
    const cards = await this.createStarterCards(group);

    return {group, cards};
  }

  /**
   * Creates starter cards for an existing group
   */
  private static async createStarterCards(group: Group): Promise<Card[]> {
    const now = new Date();
    const cards: Card[] = [];

    for (const cardData of STARTER_PACK.cards) {
      const card = await getCardRepo().create({
        ...cardData,
        groupId: group.id,
        createdAt: now,
        updatedAt: now,
      });
      cards.push(card);
    }

    // Update group card count
    await getGroupRepo().update(group.id, {
      cardCount: cards.length,
    });

    return cards;
  }

  /**
   * Checks if a group is the starter pack
   */
  static isStarterPack(groupId: string): boolean {
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

  /**
   * Recreates the starter pack (useful for updates)
   */
  static async recreateStarterPack(): Promise<{group: Group; cards: Card[]}> {
    try {
      // Delete existing starter pack if it exists
      const existingGroup = await getGroupRepo().findById(STARTER_CARDS_GROUP_ID);
      if (existingGroup) {
        // Delete all cards first
        const existingCards = await getCardRepo().findByGroupId(STARTER_CARDS_GROUP_ID);
        for (const card of existingCards) {
          await getCardRepo().delete(card.id);
        }
        // Delete the group
        await getGroupRepo().delete(STARTER_CARDS_GROUP_ID);
      }
    } catch (error) {
      console.warn("Error cleaning up existing starter pack:", error);
    }

    // Create fresh starter pack
    return await this.createStarterPack();
  }
}
