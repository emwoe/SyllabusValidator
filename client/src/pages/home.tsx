import FileUploader from "@/components/FileUploader";
import AnalysisResults from "@/components/AnalysisResults";
import RequirementsGuide from "@/components/RequirementsGuide";
import RecentAnalyses from "@/components/RecentAnalyses";
import { useState } from "react";
import { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">General Education Requirements Analysis</h1>
        <p className="mt-2 text-neutral-600">Upload a course syllabus to analyze whether it meets General Education requirements.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FileUploader 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete} 
          />
          
          <AnalysisResults 
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        </div>
        
        <div className="lg:col-span-1">
          <RequirementsGuide />
          <RecentAnalyses />
        </div>
      </div>
    </div>
  );
}
