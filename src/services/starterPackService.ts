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
    const isStarterPack = group.source === "starter_pack";
    console.log(`🔍 [StarterPackService] isStarterPack check:`, {
      groupId: group.id,
      groupName: group.name,
      source: group.source,
      isStarterPack,
      method: 'source-based'
    });
    return isStarterPack;
  }

  /**
   * Checks if a group is a starter pack by ID (for backward compatibility)
   * @deprecated Use isStarterPack(group) instead
   */
  static isStarterPackById(groupId: string): boolean {
    const isStarterPack = groupId === STARTER_CARDS_GROUP_ID;
    console.log(`🔍 [StarterPackService] isStarterPackById check (DEPRECATED):`, {
      groupId,
      hardcodedId: STARTER_CARDS_GROUP_ID,
      isStarterPack,
      method: 'id-based',
      warning: 'This method is deprecated, use isStarterPack(group) instead'
    });
    return isStarterPack;
  }

  /**
   * Gets the starter pack if it exists
   */
  static async getStarterPack(): Promise<{group: Group; cards: Card[]} | null> {
    console.log(`📦 [StarterPackService] Getting starter pack from database...`);
    try {
      const group = await getGroupRepo().findById(STARTER_CARDS_GROUP_ID);
      console.log(`📦 [StarterPackService] Group lookup result:`, {
        found: !!group,
        groupId: STARTER_CARDS_GROUP_ID,
        group: group ? {
          id: group.id,
          name: group.name,
          source: group.source,
          cardCount: group.cardCount
        } : null
      });
      
      if (!group) {
        console.log(`📦 [StarterPackService] No starter pack group found in database`);
        return null;
      }

      const cards = await getCardRepo().findByGroupId(STARTER_CARDS_GROUP_ID);
      console.log(`📦 [StarterPackService] Cards lookup result:`, {
        cardCount: cards.length,
        groupId: STARTER_CARDS_GROUP_ID,
        sampleCards: cards.slice(0, 2).map(c => ({
          id: c.id,
          content: c.content.substring(0, 30) + '...',
          source: c.source
        }))
      });
      
      return {group, cards};
    } catch (error) {
      console.error(`❌ [StarterPackService] Error getting starter pack:`, error);
      return null;
    }
  }

  /**
   * Debug method to validate refactoring
   */
  static debugValidateRefactoring(groups: Group[]): void {
    console.log(`🔬 [StarterPackService] DEBUG: Validating refactoring with ${groups.length} groups`);
    
    const starterPacksBySource = groups.filter(g => g.source === "starter_pack");
    const starterPacksById = groups.filter(g => g.id === STARTER_CARDS_GROUP_ID);
    
    console.log(`🔬 [StarterPackService] DEBUG: Starter pack analysis:`, {
      totalGroups: groups.length,
      starterPacksBySource: starterPacksBySource.length,
      starterPacksById: starterPacksById.length,
      hardcodedId: STARTER_CARDS_GROUP_ID,
      sourceBasedGroups: starterPacksBySource.map(g => ({
        id: g.id,
        name: g.name,
        source: g.source
      })),
      idBasedGroups: starterPacksById.map(g => ({
        id: g.id,
        name: g.name,
        source: g.source
      }))
    });
    
    // Validate consistency
    if (starterPacksBySource.length !== starterPacksById.length) {
      console.warn(`⚠️ [StarterPackService] DEBUG: Inconsistency detected!`, {
        sourceBasedCount: starterPacksBySource.length,
        idBasedCount: starterPacksById.length,
        recommendation: 'Check if hardcoded ID matches source field'
      });
    } else {
      console.log(`✅ [StarterPackService] DEBUG: Starter pack identification methods are consistent`);
    }
  }

}
