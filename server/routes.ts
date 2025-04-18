import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalysisSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractTextFromDocument } from "./utils/documentParser";
import { analyzeGenEdRequirements, genEdRequirements } from "./utils/genEdAnalyzer";
import { analyzeWithOpenAI } from "./utils/openaiAnalyzer";

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(import.meta.dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed.") as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to upload and analyze a syllabus
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      
      // Extract text from the uploaded document
      const text = await extractTextFromDocument(file.path, path.extname(file.originalname).toLowerCase());
      
      // Use OpenAI to analyze the extracted text against Gen Ed requirements
      // If the OpenAI analysis fails, fall back to the basic keyword analysis
      let analysisResult;
      let analysisMethod = "keyword";
      
      try {
        console.log("Analyzing syllabus with OpenAI...");
        analysisResult = await analyzeWithOpenAI(text, genEdRequirements);
        analysisMethod = "ai";
        console.log("OpenAI analysis complete");
      } catch (aiError) {
        console.error("OpenAI analysis failed, falling back to basic analysis:", aiError);
        analysisResult = await analyzeGenEdRequirements(text);
      }
      
      // Prefer user-provided course information over AI-extracted information
      const courseName = req.body.courseName || analysisResult.courseName || "Unnamed Course";
      const courseCode = req.body.courseCode || analysisResult.courseCode || "";

      // Format the data for storage
      const analysisData = {
        courseName,
        courseCode,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: path.extname(file.originalname).toLowerCase(),
        approvedRequirements: analysisResult.approvedRequirements,
        rejectedRequirements: analysisResult.rejectedRequirements
      };

      // Validate the data before storing
      const parsedData = insertAnalysisSchema.parse(analysisData);
      
      // Store the analysis in the database
      const savedAnalysis = await storage.createAnalysis(parsedData);

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      // Return the analysis result
      res.status(200).json({
        id: savedAnalysis.id,
        courseName, 
        courseCode,
        approvedRequirements: analysisResult.approvedRequirements,
        rejectedRequirements: analysisResult.rejectedRequirements,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: path.extname(file.originalname).toLowerCase(),
        uploadDate: savedAnalysis.uploadDate,
        analysisMethod: analysisMethod
      });
    } catch (error: any) {
      console.error("Error analyzing syllabus:", error);
      res.status(500).json({ message: error.message || "An error occurred during analysis" });
    }
  });

  // API route to get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses();
      res.status(200).json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch analyses" });
    }
  });

  // API route to get a specific analysis by ID
  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const analysis = await storage.getAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.status(200).json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch analysis" });
    }
  });

  // API route to get recent analyses
  app.get("/api/analyses/recent/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const analyses = await storage.getRecentAnalyses(limit);
      res.status(200).json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch recent analyses" });
    }
  });

  // API route to search analyses
  app.get("/api/analyses/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const analyses = await storage.searchAnalyses(query);
      res.status(200).json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to search analyses" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
