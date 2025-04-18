import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the analysis result table
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  courseName: text("course_name").notNull(),
  courseCode: text("course_code"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  approvedRequirements: jsonb("approved_requirements").notNull(),
  rejectedRequirements: jsonb("rejected_requirements").notNull(),
  content: text("content"),  // Store the extracted document text
});

// Define the insert schema for analyses
export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  uploadDate: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// Define required type definitions for the Gen Ed requirements
export interface RequirementDetail {
  name: string;
  description: string;
  slos: string[];
}

export interface MatchingRequirement {
  requirement: string;
  matches: string[];
  slos: number[];
}

export interface MissingRequirement {
  requirement: string;
  missing: string[];
  slos: number[];
}

export interface ApprovedRequirement {
  name: string;
  matchingRequirements: string[];
  matchingSLOs: number[];
}

export interface RejectedRequirement {
  name: string;
  missingRequirements: string[];
  missingSLOs: number[];
}

export interface AnalysisResult {
  courseName: string;
  courseCode: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  approvedRequirements: ApprovedRequirement[];
  rejectedRequirements: RejectedRequirement[];
  analysisMethod?: "ai" | "keyword";  // 'ai' for OpenAI, 'keyword' for basic matching
}
