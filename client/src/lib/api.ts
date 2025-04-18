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
