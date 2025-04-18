import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocument } from "@/lib/api";
import { AnalysisResult } from "@shared/schema";

interface FileUploaderProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
}

export default function FileUploader({ onAnalysisComplete, onAnalysisStart }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState<{name: string, size: number, type: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  
  const handleFileDialogOpen = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };
  
  const handleFileSelection = (file: File) => {
    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    setFileData({
      name: file.name,
      size: file.size,
      type: fileExtension
    });
    
    uploadAndAnalyzeFile(file);
  };
  
  const uploadAndAnalyzeFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      onAnalysisStart();
      
      // Create new AbortController for this upload
      abortControllerRef.current = new AbortController();
      
      // Simulate progress (real progress would come from upload events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      const formData = new FormData();
      formData.append('file', file);

      // Try to extract course information from filename
      const filenameParts = file.name.split(/[-_\s.]/).filter(part => part.length > 0);
      const possibleCourseCode = filenameParts.find(part => /^[A-Z]{2,4}\d{3,4}[A-Z]?$/i.test(part));
      
      if (possibleCourseCode) {
        formData.append('courseCode', possibleCourseCode.toUpperCase());
      }
      
      const result = await analyzeDocument(formData, abortControllerRef.current.signal);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay before completing to show 100%
      setTimeout(() => {
        setIsUploading(false);
        onAnalysisComplete(result);
        
        toast({
          title: "Analysis complete",
          description: "Your syllabus has been successfully analyzed.",
        });
      }, 500);
      
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      
      if (error.name !== 'AbortError') {
        toast({
          title: "Analysis failed",
          description: error.message || "An error occurred during analysis.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    
    toast({
      title: "Upload cancelled",
      description: "File upload was cancelled.",
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Upload Syllabus</h2>
        
        <div 
          className={`dropzone border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-neutral-300'
          }`}
          onClick={handleFileDialogOpen}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <span className="material-icons text-4xl text-neutral-400 mb-2">upload_file</span>
          <p className="text-neutral-600 mb-1">Drag and drop your syllabus file here</p>
          <p className="text-sm text-neutral-500">or <span className="text-primary">browse files</span></p>
          <p className="text-xs text-neutral-500 mt-1">Supports PDF and DOC/DOCX formats up to 10MB</p>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.doc,.docx" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
        </div>
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="mr-4 relative flex">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle 
                    className="text-neutral-100" 
                    strokeWidth="3" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="18" 
                    cx="20" 
                    cy="20"
                  />
                  <circle 
                    className="text-primary" 
                    strokeWidth="3" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="18" 
                    cx="20" 
                    cy="20" 
                    strokeDasharray="113" 
                    strokeDashoffset={113 - (113 * uploadProgress / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-900">{fileData?.name}</span>
                  <span className="text-sm text-neutral-500">{fileData ? formatFileSize(fileData.size) : ''}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadProgress > 50 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Using AI to analyze syllabus content against Gen Ed requirements...
                  </p>
                )}
              </div>
              <button 
                className="ml-4 text-neutral-400 hover:text-error"
                onClick={handleCancelUpload}
              >
                <span className="material-icons">cancel</span>
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
