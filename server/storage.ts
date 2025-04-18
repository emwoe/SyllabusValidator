import { analyses, users, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analysis methods
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalyses(): Promise<Analysis[]>;
  getAnalysisById(id: number): Promise<Analysis | undefined>;
  getRecentAnalyses(limit: number): Promise<Analysis[]>;
  searchAnalyses(query: string): Promise<Analysis[]>;
  deleteAnalysis(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses);
  }

  async getAnalysisById(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis;
  }

  async getRecentAnalyses(limit: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .orderBy(desc(analyses.uploadDate))
      .limit(limit);
  }

  async searchAnalyses(query: string): Promise<Analysis[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(analyses)
      .where(
        or(
          like(analyses.courseName, lowerQuery),
          like(analyses.courseCode || '', lowerQuery)
        )
      );
  }
  
  async deleteAnalysis(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(analyses)
        .where(eq(analyses.id, id))
        .returning({ id: analyses.id });
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting analysis:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
