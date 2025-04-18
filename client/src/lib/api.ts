import { AnalysisResult } from "@shared/schema";

/**
 * Upload and analyze a document
 * @param formData FormData containing the file and optional metadata
 * @param signal AbortSignal for cancellation
 * @returns Promise<AnalysisResult>
 */
export async function analyzeDocument(formData: FormData, signal?: AbortSignal): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
    signal,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to analyze document');
  }
  
  return await response.json();
}

/**
 * Get all analyses from the database
 * @returns Promise<Analysis[]>
 */
export async function getAllAnalyses() {
  const response = await fetch('/api/analyses', {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to fetch analyses');
  }
  
  return await response.json();
}

/**
 * Get a specific analysis by ID
 * @param id Analysis ID
 * @returns Promise<Analysis>
 */
export async function getAnalysisById(id: number) {
  const response = await fetch(`/api/analyses/${id}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to fetch analysis');
  }
  
  return await response.json();
}

/**
 * Get recent analyses
 * @param limit Number of analyses to retrieve
 * @returns Promise<Analysis[]>
 */
export async function getRecentAnalyses(limit: number = 5) {
  const response = await fetch(`/api/analyses/recent/${limit}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to fetch recent analyses');
  }
  
  return await response.json();
}

/**
 * Search analyses by query
 * @param query Search query
 * @returns Promise<Analysis[]>
 */
export async function searchAnalyses(query: string) {
  const response = await fetch(`/api/analyses/search/${encodeURIComponent(query)}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to search analyses');
  }
  
  return await response.json();
}

/**
 * Upload and analyze multiple documents
 * @param formData FormData containing the files and optional metadata
 * @param signal AbortSignal for cancellation
 * @returns Promise<{success: AnalysisResult[], errors: {fileName: string, error: string}[]}>
 */
export async function analyzeMultipleDocuments(formData: FormData, signal?: AbortSignal): Promise<{
  success: AnalysisResult[],
  errors: {fileName: string, error: string}[]
}> {
  const response = await fetch('/api/analyze-multiple', {
    method: 'POST',
    body: formData,
    signal,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to analyze documents');
  }
  
  return await response.json();
}

/**
 * Delete an analysis from the database
 * @param id Analysis ID to delete
 * @returns Promise<{message: string}>
 */
export async function deleteAnalysis(id: number): Promise<{message: string}> {
  const response = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Failed to delete analysis');
  }
  
  return await response.json();
}
