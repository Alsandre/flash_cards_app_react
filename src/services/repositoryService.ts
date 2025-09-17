import {HybridGroupRepository} from "../repositories/hybridGroupRepository";
import {HybridCardRepository} from "../repositories/hybridCardRepository";

// Singleton instances for Redux slices to share
export let groupRepo: HybridGroupRepository;
export let cardRepo: HybridCardRepository;

/**
 * Initialize repositories with user ID for Supabase sync
 * Called when user logs in
 */
export function initializeRepositories(userId: string) {
  // Create new instances with user ID
  groupRepo = new HybridGroupRepository(userId);
  cardRepo = new HybridCardRepository(userId);

  console.log("📚 Repositories initialized for user:", userId);
}

/**
 * Clear repositories when user logs out
 */
export function clearRepositories() {
  groupRepo = new HybridGroupRepository();
  cardRepo = new HybridCardRepository();

  console.log("📚 Repositories cleared for logout");
}

// Initialize with empty repos for unauthenticated state
groupRepo = new HybridGroupRepository();
cardRepo = new HybridCardRepository();

