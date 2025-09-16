import type {Middleware} from "@reduxjs/toolkit";
import type {Card} from "../../types/card-schema";
import type {Group} from "../../types/group-schema";
import {CardRepository} from "../../repositories/cardRepository";
import {GroupRepository} from "../../repositories/groupRepository";

const cardRepository = new CardRepository();
const groupRepository = new GroupRepository();

// Debounce function to avoid excessive IndexedDB writes
const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: T) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const debouncedSaveCards = debounce(async (cards: Card[]) => {
  try {
    await cardRepository.saveAllCards(cards);
  } catch (error) {
    console.error("Failed to persist cards:", error);
  }
}, 500);

const debouncedSaveGroups = debounce(async (groups: Group[]) => {
  try {
    await groupRepository.saveAllGroups(groups);
  } catch (error) {
    console.error("Failed to persist groups:", error);
  }
}, 500);

export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Type check action to ensure it has type property
  if (typeof action === "object" && action !== null && "type" in action) {
    const typedAction = action as {type: string};

    // Persist card changes to IndexedDB
    if (typedAction.type.startsWith("cards/")) {
      const state = store.getState() as {cards: {cards: Card[]}};
      debouncedSaveCards(state.cards.cards);
    }

    // Persist group changes to IndexedDB
    if (typedAction.type.startsWith("groups/")) {
      const state = store.getState() as {groups: {groups: Group[]}};
      debouncedSaveGroups(state.groups.groups);
    }
  }

  return result;
};
