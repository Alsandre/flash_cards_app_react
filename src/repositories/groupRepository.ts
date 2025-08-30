import {BaseRepository} from "./base";
import {db} from "../services/database";
import type {Group} from "../types/entities";

export class GroupRepository extends BaseRepository<Group> {
  protected tableName = "groups";

  async findAll(): Promise<Group[]> {
    return await db.groups.orderBy("updatedAt").reverse().toArray();
  }

  async findById(id: string): Promise<Group | null> {
    const group = await db.groups.get(id);
    return group || null;
  }

  async create(entity: Omit<Group, "id">): Promise<Group> {
    const id = this.generateId();
    const group: Group = {
      ...entity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      cardCount: 0,
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
}
