import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the root directory
  app.use(express.static(path.resolve(".")));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
