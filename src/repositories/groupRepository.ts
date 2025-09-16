import {BaseRepository} from "./base";
import {db} from "../services/database";
import type {Group} from "../types/group-schema";

export class GroupRepository extends BaseRepository<Group> {
  protected tableName = "groups";

  async findAll(): Promise<Group[]> {
    return await db.groups.orderBy("updatedAt").reverse().toArray();
  }

  async findById(id: string): Promise<Group | null> {
    const group = await db.groups.get(id);
    return group || null;
  }

  async create(entity: Pick<Group, "name"> & Partial<Omit<Group, "id" | "createdAt" | "updatedAt" | "cardCount" | "studyCardCount">>, fixedId?: string): Promise<Group> {
    const id = fixedId || this.generateId();
    const group: Group = {
      ...entity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      cardCount: 0,
      studyCardCount: 0,
      tags: entity.tags || [],
      isActive: entity.isActive ?? true,
      source: entity.source || "user_created",
    };

    await db.groups.add(group);
    return group;
  }

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    await db.groups.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const updatedGroup = await this.findById(id);
    if (!updatedGroup) {
      throw new Error(`Group with id ${id} not found`);
    }

    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    // Also delete associated cards
    await db.cards.where("groupId").equals(id).delete();
    await db.groups.delete(id);
  }

  // Additional methods specific to groups
  async findByName(name: string): Promise<Group[]> {
    return await db.groups.where("name").startsWithIgnoreCase(name).toArray();
  }

  async getGroupsWithCardCounts(): Promise<Group[]> {
    const groups = await this.findAll();

    // Update card counts for all groups
    for (const group of groups) {
      await db.updateGroupCardCount(group.id);
    }

    // Return updated groups
    return await this.findAll();
  }

  async saveAllGroups(groups: Group[]): Promise<void> {
    // Clear existing groups and save new ones
    await db.groups.clear();
    // Create mutable copies to avoid "read-only property" errors
    const mutableGroups = groups.map((group) => ({...group}));
    await db.groups.bulkAdd(mutableGroups);
  }
}
