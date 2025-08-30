// Base repository interface as defined in foundation document

export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Base repository implementation with common functionality
export abstract class BaseRepository<T extends {id: string}> implements Repository<T> {
  protected abstract tableName: string;

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(entity: Omit<T, "id">): Promise<T>;
  abstract update(id: string, updates: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;

  // Helper method for generating IDs
  protected generateId(): string {
    return crypto.randomUUID();
  }
}
