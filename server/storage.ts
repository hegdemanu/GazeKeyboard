import { users, typingHistory, type User, type InsertUser, type TypingHistory, type InsertTypingHistory } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Typing history methods
  saveTypingHistory(history: InsertTypingHistory): Promise<TypingHistory>;
  getTypingHistoryByUserId(userId: number): Promise<TypingHistory[]>;
  getRecentTypingHistory(limit?: number): Promise<TypingHistory[]>;
}

// PostgreSQL storage implementation
export class DbStorage implements IStorage {
  private db: any;

  constructor() {
    const connectionString = process.env.DATABASE_URL || "";
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async saveTypingHistory(history: InsertTypingHistory): Promise<TypingHistory> {
    const result = await this.db.insert(typingHistory).values(history).returning();
    return result[0];
  }

  async getTypingHistoryByUserId(userId: number): Promise<TypingHistory[]> {
    return await this.db.select().from(typingHistory).where(eq(typingHistory.userId, userId));
  }

  async getRecentTypingHistory(limit: number = 10): Promise<TypingHistory[]> {
    return await this.db.select().from(typingHistory).limit(limit);
  }
}

// In-memory implementation (fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private typingHistories: Map<number, TypingHistory>;
  currentUserId: number;
  currentHistoryId: number;

  constructor() {
    this.users = new Map();
    this.typingHistories = new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveTypingHistory(history: InsertTypingHistory): Promise<TypingHistory> {
    const id = this.currentHistoryId++;
    const now = new Date();
    const newHistory: TypingHistory = { 
      id, 
      text: history.text,
      userId: history.userId ?? null, // Handle the case when userId is undefined
      dateCreated: now
    };
    this.typingHistories.set(id, newHistory);
    return newHistory;
  }

  async getTypingHistoryByUserId(userId: number): Promise<TypingHistory[]> {
    return Array.from(this.typingHistories.values()).filter(
      history => history.userId === userId
    );
  }

  async getRecentTypingHistory(limit: number = 10): Promise<TypingHistory[]> {
    return Array.from(this.typingHistories.values())
      .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
      .slice(0, limit);
  }
}

// Choose whether to use the database or in-memory storage
let storage: IStorage;

try {
  // Try to use the database
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    storage = new DbStorage();
    console.log("Using PostgreSQL database for storage");
  } else {
    throw new Error("Database connection string not found");
  }
} catch (error) {
  console.warn("Database connection failed, falling back to in-memory storage:", error);
  storage = new MemStorage();
}

export { storage };
