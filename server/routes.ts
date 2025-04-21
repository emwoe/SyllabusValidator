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
import { processPDFForWeb, isPDF } from "./utils/pdfOptimizer";

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
  // API route to upload and analyze a single syllabus
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
      
      // Always prioritize user-provided course information
      // If user input is available, use it even if it's empty
      const hasUserCourseName = 'courseName' in req.body; 
      const hasUserCourseCode = 'courseCode' in req.body;
      
      const courseName = hasUserCourseName ? req.body.courseName : (analysisResult.courseName || "Unnamed Course");
      const courseCode = hasUserCourseCode ? req.body.courseCode : (analysisResult.courseCode || "");

      // Format the data for storage
      const analysisData = {
        courseName,
        courseCode,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: path.extname(file.originalname).toLowerCase(),
        approvedRequirements: analysisResult.approvedRequirements,
        rejectedRequirements: analysisResult.rejectedRequirements,
        bestFit: analysisResult.bestFit,
        potentialFits: analysisResult.potentialFits,
        poorFits: analysisResult.poorFits,
        content: text, // Store the original extracted text
        documentPath: "" // Will be set after file is copied
      };

      // Validate the data before storing
      const parsedData = insertAnalysisSchema.parse(analysisData);
      
      // Create a unique stored filename for the document
      const documentsDir = path.join(import.meta.dirname, "../uploads/documents");
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }
      
      // Generate document ID and path for storage
      const documentId = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const storedFilename = `document-${documentId}${path.extname(file.originalname)}`;
      
      // Process PDF files for web optimization if applicable
      let finalStoredFilename = storedFilename;
      if (isPDF(file.path)) {
        console.log('Processing PDF for web optimization...');
        finalStoredFilename = processPDFForWeb(file.path, documentsDir, storedFilename);
      } else {
        // For non-PDF files, just copy as-is
        const storedPath = path.join(documentsDir, storedFilename);
        fs.copyFileSync(file.path, storedPath);
      }
      
      // Add the document path to the analysis data
      parsedData.documentPath = finalStoredFilename;
      
      // Store the analysis in the database
      const savedAnalysis = await storage.createAnalysis(parsedData);

      // Clean up the temporary uploaded file
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
        analysisMethod: analysisMethod,
        bestFit: analysisResult.bestFit,
        potentialFits: analysisResult.potentialFits,
        poorFits: analysisResult.poorFits,
        content: text // Include the extracted text in the response
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
  
  // API route to upload and analyze multiple syllabi
  app.post("/api/analyze-multiple", upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const results = [];
      const errors = [];
      
      // Process each file
      for (const file of files) {
        try {
          // Extract text from the uploaded document
          const text = await extractTextFromDocument(file.path, path.extname(file.originalname).toLowerCase());
          
          // Use OpenAI to analyze the extracted text against Gen Ed requirements
          // If the OpenAI analysis fails, fall back to the basic keyword analysis
          let analysisResult;
          let analysisMethod = "keyword";
          
          try {
            console.log(`Analyzing syllabus ${file.originalname} with OpenAI...`);
            analysisResult = await analyzeWithOpenAI(text, genEdRequirements);
            analysisMethod = "ai";
            console.log(`OpenAI analysis complete for ${file.originalname}`);
          } catch (aiError) {
            console.error(`OpenAI analysis failed for ${file.originalname}, falling back to basic analysis:`, aiError);
            analysisResult = await analyzeGenEdRequirements(text);
          }
          
          // Get file-specific course info if provided
          const fileSpecificName = req.body[`courseName_${file.originalname}`] || "";
          const fileSpecificCode = req.body[`courseCode_${file.originalname}`] || "";
          
          // Use file-specific course info if provided, otherwise use AI extraction results
          let courseName = fileSpecificName || analysisResult.courseName || "Unnamed Course";
          let courseCode = fileSpecificCode || analysisResult.courseCode || "";
          
          // Format the data for storage
          const analysisData = {
            courseName,
            courseCode,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: path.extname(file.originalname).toLowerCase(),
            approvedRequirements: analysisResult.approvedRequirements,
            rejectedRequirements: analysisResult.rejectedRequirements,
            content: text, // Store the original document text
            documentPath: "", // Will be set after file is copied
            bestFit: analysisResult.bestFit,
            potentialFits: analysisResult.potentialFits,
            poorFits: analysisResult.poorFits
          };
          
          // Validate the data before storing
          const parsedData = insertAnalysisSchema.parse(analysisData);
          
          // Create a unique stored filename for the document
          const documentsDir = path.join(import.meta.dirname, "../uploads/documents");
          if (!fs.existsSync(documentsDir)) {
            fs.mkdirSync(documentsDir, { recursive: true });
          }
          
          // Generate document ID and path for storage
          const documentId = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const storedFilename = `document-${documentId}${path.extname(file.originalname)}`;
          
          // Process PDF files for web optimization if applicable
          let finalStoredFilename = storedFilename;
          if (isPDF(file.path)) {
            console.log(`Processing PDF for web optimization: ${file.originalname}`);
            finalStoredFilename = processPDFForWeb(file.path, documentsDir, storedFilename);
          } else {
            // For non-PDF files, just copy as-is
            const storedPath = path.join(documentsDir, storedFilename);
            fs.copyFileSync(file.path, storedPath);
          }
          
          // Add the document path to the analysis data
          parsedData.documentPath = finalStoredFilename;
          
          // Store the analysis in the database
          const savedAnalysis = await storage.createAnalysis(parsedData);
          
          // Add to results
          results.push({
            id: savedAnalysis.id,
            courseName,
            courseCode,
            approvedRequirements: analysisResult.approvedRequirements,
            rejectedRequirements: analysisResult.rejectedRequirements,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: path.extname(file.originalname).toLowerCase(),
            uploadDate: savedAnalysis.uploadDate,
            analysisMethod,
            bestFit: analysisResult.bestFit,
            potentialFits: analysisResult.potentialFits,
            poorFits: analysisResult.poorFits,
            content: text, // Include the extracted text
            documentPath: finalStoredFilename // Include the document path
          });
          
          // Clean up the temporary uploaded file
          fs.unlinkSync(file.path);
          
        } catch (fileError: any) {
          // Add to errors but continue processing other files
          errors.push({
            fileName: file.originalname,
            error: fileError.message || "Error analyzing file"
          });
          
          // Clean up the file even if analysis failed
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      
      // Return the combined results
      res.status(200).json({
        success: results,
        errors: errors
      });
      
    } catch (error: any) {
      console.error("Error analyzing multiple syllabi:", error);
      res.status(500).json({ message: error.message || "An error occurred during analysis" });
    }
  });
  
  // API route to delete an analysis from the database
  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const deleted = await storage.deleteAnalysis(id);
      if (!deleted) {
        return res.status(404).json({ message: "Analysis not found or could not be deleted" });
      }
      
      res.status(200).json({ message: "Analysis deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ message: error.message || "Failed to delete analysis" });
    }
  });
  
  // API route to get the original syllabus content for a specific analysis
  app.get("/api/analyses/:id/content", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const analysis = await storage.getAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Check if we have the actual content stored
      if (analysis.content) {
        // Return the actual syllabus content
        res.status(200).json({ 
          content: analysis.content,
          fileType: analysis.fileType,
          documentPath: analysis.documentPath || null
        });
      } else {
        // Fallback for legacy analyses without stored content
        const approvedReqs = Array.isArray(analysis.approvedRequirements) 
          ? analysis.approvedRequirements.map((req: any) => 
              `- ${req.name}\n  Matching elements: ${req.matchingRequirements?.join(', ') || 'None'}\n  Matching SLOs: ${req.matchingSLOs?.join(', ') || 'None'}`
            ).join('\n\n')
          : 'None';

        const rejectedReqs = Array.isArray(analysis.rejectedRequirements)
          ? analysis.rejectedRequirements.map((req: any) => 
              `- ${req.name}\n  Missing elements: ${req.missingRequirements?.join(', ') || 'None'}\n  Missing SLOs: ${req.missingSLOs?.join(', ') || 'None'}`
            ).join('\n\n')
          : 'None';

        res.status(200).json({ 
          content: `SYLLABUS CONTENT FOR: ${analysis.courseName} (${analysis.courseCode})\n\n` +
            `The original syllabus content is not available for this analysis.\n\n` +
            `File: ${analysis.fileName}\n` +
            `Size: ${analysis.fileSize} bytes\n` +
            `Type: ${analysis.fileType}\n` +
            `Uploaded: ${new Date(analysis.uploadDate).toLocaleString()}\n\n` +
            `APPROVED REQUIREMENTS:\n${approvedReqs}\n\n` +
            `REJECTED REQUIREMENTS:\n${rejectedReqs}`,
          fileType: analysis.fileType,
          documentPath: analysis.documentPath || null
        });
      }
    } catch (error: any) {
      console.error("Error fetching syllabus content:", error);
      res.status(500).json({ message: error.message || "Failed to fetch syllabus content" });
    }
  });
  
  // API route to serve document files
  app.get("/api/documents/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      
      // Prevent path traversal attacks
      if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      
      const documentsDir = path.join(import.meta.dirname, "../uploads/documents");
      const filePath = path.join(documentsDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = "application/octet-stream"; // Default
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.doc') {
        contentType = 'application/msword';
      } else if (ext === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      
      // Set content type and send file
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("Error serving document:", error);
      res.status(500).json({ message: error.message || "Failed to serve document" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
