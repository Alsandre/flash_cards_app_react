import {SupabaseGroupRepository} from "../repositories/supabaseGroupRepository";
import {SupabaseCardRepository} from "../repositories/supabaseCardRepository";

// Singleton instances for Redux slices to share
export let groupRepo: SupabaseGroupRepository | null = null;
export let cardRepo: SupabaseCardRepository | null = null;

/**
 * Initialize repositories with user ID for Supabase operations
 * Called when user logs in
 */
export function initializeRepositories(userId: string) {
  
  // Prevent re-initialization for the same user
  if (groupRepo && cardRepo) {
    return;
  }
  
  // Create new instances with user ID
  groupRepo = new SupabaseGroupRepository(userId);
  cardRepo = new SupabaseCardRepository(userId);

}

/**
 * Clear repositories when user logs out
 */
export function clearRepositories() {
  groupRepo = null;
  cardRepo = null;

  console.log("📚 Repositories cleared for logout");
}

/**
 * Get authenticated group repository
 */
export function getGroupRepo(): SupabaseGroupRepository {
  
  if (!groupRepo) {
    console.error("📚 [RepositoryService] Group repository not initialized - user must be authenticated");
    throw new Error("Group repository not initialized. User must be authenticated.");
  }
  return groupRepo;
}

/**
 * Get authenticated card repository
 */
export function getCardRepo(): SupabaseCardRepository {
  if (!cardRepo) {
    throw new Error("Card repository not initialized. User must be authenticated.");
  }
  return cardRepo;
}

