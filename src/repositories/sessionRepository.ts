import {BaseRepository} from "./base";
import {db} from "../services/database";
import type {StudySession} from "../types/entities";

export class SessionRepository extends BaseRepository<StudySession> {
  protected tableName = "studySessions";

  async findAll(): Promise<StudySession[]> {
    return await db.studySessions.orderBy("startedAt").reverse().toArray();
  }

  async findById(id: string): Promise<StudySession | null> {
    const session = await db.studySessions.get(id);
    return session || null;
  }

  async create(entity: Omit<StudySession, "id">): Promise<StudySession> {
    const id = this.generateId();
    const session: StudySession = {
      ...entity,
      id,
      startedAt: new Date(),
      currentCardIndex: 0,
      isCompleted: false,
    };

    await db.studySessions.add(session);
    return session;
  }

  async update(id: string, updates: Partial<StudySession>): Promise<StudySession> {
    await db.studySessions.update(id, updates);

    const updatedSession = await this.findById(id);
    if (!updatedSession) {
      throw new Error(`StudySession with id ${id} not found`);
    }

    return updatedSession;
  }

  async delete(id: string): Promise<void> {
    // Also delete associated card ratings
    await db.cardRatings.where("sessionId").equals(id).delete();
    await db.studySessions.delete(id);
  }

  // Additional methods specific to study sessions
  async findByGroupId(groupId: string): Promise<StudySession[]> {
    return await db.studySessions.where("groupId").equals(groupId).reverse().sortBy("startedAt");
  }

  async findActiveSession(groupId: string): Promise<StudySession | null> {
    const activeSessions = await db.studySessions
      .where("groupId")
      .equals(groupId)
      .and((session) => !session.isCompleted)
      .toArray();

    return activeSessions.length > 0 ? activeSessions[0] : null;
  }

  async completeSession(sessionId: string): Promise<StudySession> {
    return await this.update(sessionId, {
      isCompleted: true,
      completedAt: new Date(),
    });
  }

  async updateProgress(sessionId: string, currentCardIndex: number): Promise<StudySession> {
    return await this.update(sessionId, {currentCardIndex});
  }

  async getSessionStats(sessionId: string): Promise<{
    totalCards: number;
    currentIndex: number;
    completedCards: number;
    remainingCards: number;
    progressPercentage: number;
  }> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    const completedCards = session.currentCardIndex;
    const remainingCards = session.totalCards - completedCards;
    const progressPercentage = session.totalCards > 0 ? Math.round((completedCards / session.totalCards) * 100) : 0;

    return {
      totalCards: session.totalCards,
      currentIndex: session.currentCardIndex,
      completedCards,
      remainingCards,
      progressPercentage,
    };
  }
}
