import FileUploader from "@/components/FileUploader";
import MultiFileUploader from "@/components/MultiFileUploader";
import AnalysisResults from "@/components/AnalysisResults";
import RequirementsGuide from "@/components/RequirementsGuide";
import RecentAnalyses from "@/components/RecentAnalyses";
import { useState } from "react";
import { AnalysisResult } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [multipleResults, setMultipleResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState<number>(0);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setMultipleResults([]);
    setIsAnalyzing(false);
  };

  const handleMultipleAnalysisComplete = (results: AnalysisResult[]) => {
    if (results.length > 0) {
      setMultipleResults(results);
      setAnalysisResult(null);
    }
    setIsAnalyzing(false);
    setActiveResultIndex(0);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setMultipleResults([]);
  };

  // Determine what to show in the results section
  const showMultipleResults = !isAnalyzing && multipleResults.length > 0;
  const showSingleResult = !isAnalyzing && analysisResult !== null;
  const currentResult = showMultipleResults
    ? multipleResults[activeResultIndex]
    : analysisResult;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">
          General Education Requirements Analysis
        </h1>
        <p className="mt-2 text-neutral-600">
          Upload a course syllabus and see which Gen Ed requirements OpenAI
          believes it may fulfill. This is a work in progress!
        </p>
        <p className="mt-2 text-neutral-600">
          Please note that this website does not assess syllabi for alignment
          with the requirements for Freshmen Seminar, Writing 1, Writing 2, or
          Oral Communication at this time.{" "}
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 flex items-center">
            <span className="material-icons text-blue-600 mr-1 text-sm">
              info
            </span>
            Analysis Methods
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            This site has been built with the help of Replit and utilizes the
            OpenAI API for AI-powered analysis of user-uploaded syllabis. The
            site has been provided with a list of Gen Ed requirements and
            student learning outcomes (SLOs) for St. Edward's University. The
            user-uploaded syllabi are analyzed for alignment with these rules
            using the OpenAI API. If the API is unavailable, the site is
            designed to rely on simple word and phrase matching, which may lead
            to less accurate results.
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

          {/* Display selector tabs for multiple results */}
          {showMultipleResults && multipleResults.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">
                Analysis Results ({multipleResults.length} courses)
              </h3>
              <Tabs
                value={activeResultIndex.toString()}
                onValueChange={(value) => setActiveResultIndex(parseInt(value))}
                className="w-full"
              >
                <TabsList
                  className="flex overflow-x-auto mb-1 max-w-full pb-1 border-b border-neutral-200"
                  style={{ scrollbarWidth: "none" }}
                >
                  {multipleResults.map((result, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="min-w-max whitespace-nowrap flex-shrink-0 data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none data-[state=active]:shadow-none px-4 py-2"
                    >
                      <span className="font-medium">
                        {result.courseName || result.fileName}
                      </span>
                      {result.courseCode && (
                        <span className="ml-1.5 text-neutral-500">
                          ({result.courseCode})
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          <AnalysisResults
            result={currentResult}
            isAnalyzing={isAnalyzing}
            isMultiple={showMultipleResults}
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
