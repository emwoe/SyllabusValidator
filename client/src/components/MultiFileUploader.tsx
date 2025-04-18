import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeMultipleDocuments } from "@/lib/api";
import { AnalysisResult } from "@shared/schema";
import { AlertCircle, CheckCircle, Trash2, Upload } from "lucide-react";

interface MultiFileUploaderProps {
  onAnalysisComplete: (results: AnalysisResult[]) => void;
  onAnalysisStart: () => void;
}

export default function MultiFileUploader({ onAnalysisComplete, onAnalysisStart }: MultiFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [courseInfoMap, setCourseInfoMap] = useState<Record<string, { name: string; code: string }>>({});
  
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
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFileSelection(files);
  };
  
  const handleFileSelection = (files: File[]) => {
    // Filter for allowed file types
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast({
          title: `Invalid file type: ${file.name}`,
          description: "Only PDF, DOC, and DOCX files are allowed.",
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: `File too large: ${file.name}`,
          description: "Maximum file size is 10MB.",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Also remove the course info for this file if it exists
    if (fileToRemove && courseInfoMap[fileToRemove.name]) {
      setCourseInfoMap(prev => {
        const updated = { ...prev };
        delete updated[fileToRemove.name];
        return updated;
      });
    }
  };
  
  const uploadAndAnalyzeFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      onAnalysisStart();
      
      // Create new AbortController for this upload
      abortControllerRef.current = new AbortController();
      
      // Simulate progress (real progress would come from upload events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      const formData = new FormData();
      
      // Add all files to formData with their individual course info
      selectedFiles.forEach(file => {
        // Add the file
        formData.append('files', file);
        
        // Add course info for this file if provided
        const courseInfo = courseInfoMap[file.name];
        if (courseInfo) {
          if (courseInfo.name) {
            formData.append(`courseName_${file.name}`, courseInfo.name);
          }
          if (courseInfo.code) {
            formData.append(`courseCode_${file.name}`, courseInfo.code);
          }
        }
      });
      
      const results = await analyzeMultipleDocuments(formData, abortControllerRef.current.signal);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay before completing to show 100%
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFiles([]);
        setCourseInfoMap({});
        
        if (results.success.length > 0) {
          onAnalysisComplete(results.success);
        }
        
        // Show results summary
        if (results.success.length > 0 && results.errors.length === 0) {
          toast({
            title: "Analysis complete",
            description: `Successfully analyzed ${results.success.length} syllabi.`,
          });
        } else if (results.success.length > 0 && results.errors.length > 0) {
          toast({
            title: "Analysis partially complete",
            description: `Analyzed ${results.success.length} syllabi with ${results.errors.length} errors.`,
            variant: "destructive"
          });
        } else if (results.success.length === 0 && results.errors.length > 0) {
          toast({
            title: "Analysis failed",
            description: `Failed to analyze any of the ${results.errors.length} syllabi.`,
            variant: "destructive"
          });
        }
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
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Analyze Multiple Syllabi</h2>
        
        <p className="mb-4 text-neutral-600">
          Upload and analyze multiple syllabus files at once. Each file can be for a different course.
        </p>
        
        <div 
          className={`dropzone border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-neutral-300'
          }`}
          onClick={handleFileDialogOpen}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <Upload className="w-10 h-10 text-neutral-400 mb-2" />
          <p className="text-neutral-600 mb-1">Drag and drop multiple syllabus files here</p>
          <p className="text-sm text-neutral-500">or <span className="text-primary">browse files</span></p>
          <p className="text-xs text-neutral-500 mt-1">Supports PDF and DOC/DOCX formats up to 10MB</p>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.doc,.docx" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
          />
        </div>
        
        {selectedFiles.length > 0 && !isUploading && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-neutral-900 mb-2">Selected Files</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-neutral-500 mr-2">{formatFileSize(file.size)}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        className="text-neutral-400 hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Course Name"
                        className="w-full px-2 py-1 text-sm border border-neutral-300 rounded-md"
                        value={courseInfoMap[file.name]?.name || ''}
                        onChange={(e) => {
                          setCourseInfoMap(prev => ({
                            ...prev,
                            [file.name]: {
                              ...prev[file.name],
                              name: e.target.value
                            }
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Course Code"
                        className="w-full px-2 py-1 text-sm border border-neutral-300 rounded-md"
                        value={courseInfoMap[file.name]?.code || ''}
                        onChange={(e) => {
                          setCourseInfoMap(prev => ({
                            ...prev,
                            [file.name]: {
                              ...prev[file.name],
                              code: e.target.value
                            }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <Button 
                onClick={uploadAndAnalyzeFiles}
                className="bg-primary text-white"
              >
                Analyze {selectedFiles.length} Files
              </Button>
            </div>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
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
                  <span className="text-sm font-medium text-neutral-900">Uploading {selectedFiles.length} files</span>
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
                <AlertCircle size={18} />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}