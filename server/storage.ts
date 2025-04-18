import { analyses, users, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private userCurrentId: number;
  private analysisCurrentId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.userCurrentId = 1;
    this.analysisCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisCurrentId++;
    const uploadDate = new Date();
    const analysis: Analysis = { ...insertAnalysis, id, uploadDate };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }

  async getAnalysisById(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getRecentAnalyses(limit: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, limit);
  }

  async searchAnalyses(query: string): Promise<Analysis[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.analyses.values()).filter(
      (analysis) => 
        analysis.courseName.toLowerCase().includes(lowerQuery) ||
        (analysis.courseCode && analysis.courseCode.toLowerCase().includes(lowerQuery))
    );
  }
}

export const storage = new MemStorage();
