import fs from "fs";
import { promisify } from "util";
import mammoth from "mammoth";
import { PDFExtract } from 'pdf.js-extract';

const readFile = promisify(fs.readFile);
const pdfExtract = new PDFExtract();

/**
 * Extract text from a document based on its file type
 * @param filePath Path to the document file
 * @param fileType File extension (.pdf, .doc, .docx)
 * @returns Promise<string> Extracted text
 */
export async function extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
  try {
    switch (fileType.toLowerCase()) {
      case ".pdf":
        return extractTextFromPDF(filePath);
      case ".doc":
      case ".docx":
        return extractTextFromDOCX(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error("Error extracting text from document:", error);
    throw new Error(`Failed to extract text from document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract text from a PDF document
 * @param filePath Path to the PDF file
 * @returns Promise<string> Extracted text
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    console.log(`Extracting text from PDF: ${filePath}`);
    const pdfData = await pdfExtract.extract(filePath, {});
    
    console.log(`PDF has ${pdfData.pages.length} pages`);
    
    // Combine text from all pages with better handling
    let fullText = '';
    for (let i = 0; i < pdfData.pages.length; i++) {
      const page = pdfData.pages[i];
      const pageText = page.content.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
      
      console.log(`Extracted ${pageText.length} characters from page ${i+1}`);
    }
      
    console.log(`Total extracted text length: ${fullText.length} characters`);
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    
    // If extraction fails, return an informative message
    return "PDF text extraction failed. Please try a different file format.";
  }
}

/**
 * Extract text from a DOCX document
 * @param filePath Path to the DOCX file
 * @returns Promise<string> Extracted text
 */
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : String(error)}`);
  }
}
