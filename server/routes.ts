import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import path from "path";
import { insertTypingHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for parsing JSON
  app.use(express.json());
  
  // Serve static files from the root directory
  app.use(express.static(path.resolve(".")));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Typing history routes
  app.post("/api/typing-history", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertTypingHistorySchema.parse(req.body);
      
      // Save to database
      const history = await storage.saveTypingHistory(validatedData);
      
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error saving typing history:", error);
      res.status(500).json({ error: "Failed to save typing history" });
    }
  });

  app.get("/api/typing-history", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getRecentTypingHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching typing history:", error);
      res.status(500).json({ error: "Failed to fetch typing history" });
    }
  });

  app.get("/api/typing-history/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const history = await storage.getTypingHistoryByUserId(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching user typing history:", error);
      res.status(500).json({ error: "Failed to fetch user typing history" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
