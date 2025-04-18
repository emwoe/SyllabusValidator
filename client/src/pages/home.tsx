import FileUploader from "@/components/FileUploader";
import MultiFileUploader from "@/components/MultiFileUploader";
import AnalysisResults from "@/components/AnalysisResults";
import RequirementsGuide from "@/components/RequirementsGuide";
import RecentAnalyses from "@/components/RecentAnalyses";
import { useState } from "react";
import { AnalysisResult } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleMultipleAnalysisComplete = (results: AnalysisResult[]) => {
    if (results.length > 0) {
      setAnalysisResult(results[0]);
    }
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
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 flex items-center">
            <span className="material-icons text-blue-600 mr-1 text-sm">info</span>
            Analysis Methods
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Our system uses AI-powered analysis to intelligently match syllabus content with General Education requirements.
            The AI evaluates context and meaning rather than just exact keyword matches, providing more accurate results.
            If AI analysis is unavailable, we'll fall back to a basic keyword matching system.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="single" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Syllabus</TabsTrigger>
              <TabsTrigger value="multi">Multiple Syllabi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single">
              <FileUploader 
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete} 
              />
            </TabsContent>
            
            <TabsContent value="multi">
              <MultiFileUploader 
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleMultipleAnalysisComplete} 
              />
            </TabsContent>
          </Tabs>
          
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
