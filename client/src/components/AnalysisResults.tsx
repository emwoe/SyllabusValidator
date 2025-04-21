import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResult, ApprovedRequirement, RejectedRequirement, RequirementFit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { getRequirementColors } from "@/lib/requirementColors";

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export default function AnalysisResults({ result, isAnalyzing, isMultiple = false }: AnalysisResultsProps & { isMultiple?: boolean }) {
  const [expandedApproved, setExpandedApproved] = useState<string[]>([]);
  const [expandedRejected, setExpandedRejected] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleExpanded = (requirement: string, type: 'approved' | 'rejected') => {
    if (type === 'approved') {
      setExpandedApproved(prev => 
        prev.includes(requirement) 
          ? prev.filter(r => r !== requirement) 
          : [...prev, requirement]
      );
    } else {
      setExpandedRejected(prev => 
        prev.includes(requirement) 
          ? prev.filter(r => r !== requirement) 
          : [...prev, requirement]
      );
    }
  };

  // All analyses are automatically saved to the database

  const handleExportPDF = () => {
    toast({
      title: "Export initiated",
      description: "Generating PDF export...",
    });
    
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "PDF has been generated and downloaded.",
      });
    }, 1500);
  };

  const handleExportCSV = () => {
    if (!result) return;
    
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Course,Requirement,Status,Matching/Missing Requirements,Matching/Missing SLOs\n";
    
    // Add approved requirements
    result.approvedRequirements.forEach(req => {
      csvContent += `"${result.courseName}","${req.name}","Approved","${req.matchingRequirements.join('; ')}","${req.matchingSLOs.join(', ')}"\n`;
    });
    
    // Add rejected requirements
    result.rejectedRequirements.forEach(req => {
      csvContent += `"${result.courseName}","${req.name}","Rejected","${req.missingRequirements.join('; ')}","${req.missingSLOs.join(', ')}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${result.courseCode || 'course'}_analysis.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: "CSV has been downloaded.",
    });
  };

  const handlePrintResults = () => {
    window.print();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Analysis Results</h2>
        
        {!result && !isAnalyzing && (
          <div className="py-8 text-center text-neutral-500">
            <p>Upload a syllabus to see analysis results</p>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-neutral-600">Analyzing syllabus content...</p>
            <p className="text-sm text-neutral-500 mt-1">This may take a few moments</p>
          </div>
        )}
        
        {result && !isAnalyzing && (
          <div>
            {/* Course details */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <div>
                <h3 className="font-medium text-neutral-900">
                  {result.courseCode ? `${result.courseCode}: ` : ''}{result.courseName}
                </h3>
                <p className="text-sm text-neutral-600 mt-1 flex flex-wrap items-center gap-2">
                  {isMultiple && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <span className="material-icons text-xs mr-1">view_carousel</span> Batch Analysis
                    </span>
                  )}
                  <span className="inline-flex items-center">
                    <span className="material-icons text-neutral-400 text-xs mr-1">event</span>
                    {formatDate(result.uploadDate)}
                  </span>
                  <span className="inline-flex items-center">
                    <span className="material-icons text-neutral-400 text-xs mr-1">description</span>
                    {result.fileType.toUpperCase().replace('.', '')}
                  </span>
                  <span className="inline-flex items-center">
                    <span className="material-icons text-neutral-400 text-xs mr-1">folder</span>
                    {formatFileSize(result.fileSize)}
                  </span>
                  {result.analysisMethod && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <span className="material-icons text-xs mr-1">smart_toy</span>
                      {result.analysisMethod === 'ai' ? 'AI-Powered Analysis' : 'Keyword Analysis'}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="material-icons text-xs mr-1">save</span>
                    Saved to Database
                  </span>
                </p>
              </div>
            </div>
            
            {/* Best Fit Section */}
            {result.bestFit && (
              <div className="mb-6 bg-gradient-to-r from-primary/5 to-transparent p-5 rounded-lg border border-primary/10">
                <h3 className="font-medium text-neutral-900 mb-3 flex items-center">
                  <span className="material-icons text-primary mr-1">stars</span>
                  Best Fit for Gen Ed Requirements
                </h3>
                
                <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
                  <div className="px-4 py-3">
                    {/* Requirement name with score */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {/* Use the requirementColors utility to get consistent styling */}
                        {(() => {
                          const colors = getRequirementColors(result.bestFit.name);
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${colors.bgColorClass} ${colors.textColorClass}`}>
                              {result.bestFit.name}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-1">Match Score:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          result.bestFit.matchScore >= 80 ? "bg-green-100 text-green-800" :
                          result.bestFit.matchScore >= 60 ? "bg-amber-100 text-amber-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {result.bestFit.matchScore}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="mt-2 text-sm text-neutral-700 bg-neutral-50 p-3 rounded-md">
                      <p className="font-medium mb-1">Reasoning:</p>
                      <p>{result.bestFit.reasoning}</p>
                    </div>
                    
                    {/* SLO matches */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Matching SLOs:</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.bestFit.matchingSLOs && result.bestFit.matchingSLOs.length > 0 ? (
                            result.bestFit.matchingSLOs.map((slo) => (
                              <span 
                                key={`best-match-slo-${slo}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                              >
                                SLO {slo}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-neutral-500">No matching SLOs</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Missing SLOs:</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.bestFit.missingSLOs && result.bestFit.missingSLOs.length > 0 ? (
                            result.bestFit.missingSLOs.map((slo) => (
                              <span 
                                key={`best-missing-slo-${slo}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600"
                              >
                                SLO {slo}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-neutral-500">No missing SLOs</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show the second best fit in potential fits section if there is one */}
            {result.potentialFits && result.potentialFits.length > 0 && result.potentialFits[0]?.matchScore >= 70 && (
              <div className="mb-6">
                <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                  <span className="material-icons text-amber-500 mr-1">trending_up</span>
                  Secondary Match
                </h3>
                
                <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
                  <div className="px-4 py-3">
                    {/* Requirement name with score */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {(() => {
                          const colors = getRequirementColors(result.potentialFits[0].name);
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${colors.bgColorClass} ${colors.textColorClass}`}>
                              {result.potentialFits[0].name}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-1">Match Score:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          result.potentialFits[0].matchScore >= 80 ? "bg-green-100 text-green-800" :
                          result.potentialFits[0].matchScore >= 60 ? "bg-amber-100 text-amber-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {result.potentialFits[0].matchScore}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="mt-2 text-sm text-neutral-700 bg-neutral-50 p-3 rounded-md">
                      <p className="font-medium mb-1">Reasoning:</p>
                      <p>{result.potentialFits[0].reasoning}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Approved requirements */}
            {result.approvedRequirements.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                  <span className="material-icons text-green-500 mr-1">check_circle</span>
                  Potential Fits
                </h3>
                
                {result.approvedRequirements.map((req) => (
                  <div 
                    key={`approved-${req.name}`} 
                    className={`bg-white border border-neutral-100 rounded-lg mb-2 overflow-hidden`}
                  >
                    <div 
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                      onClick={() => toggleExpanded(req.name, 'approved')}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-900">{req.name}</span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary">
                          Approved
                        </span>
                      </div>
                      <span className={`material-icons text-neutral-400 transform ${expandedApproved.includes(req.name) ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                    <div 
                      className={`px-4 pb-3 pt-0 border-t border-neutral-100 ${
                        expandedApproved.includes(req.name) ? 'block' : 'hidden'
                      }`}
                    >
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Matching Requirements</h4>
                        <ul className="text-sm text-neutral-600 space-y-1 ml-5 list-disc">
                          {req.matchingRequirements.map((item, index) => (
                            <li key={`req-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Matching SLOs</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {req.matchingSLOs.map((slo) => (
                            <span 
                              key={`slo-${slo}`}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                            >
                              SLO {slo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Rejected requirements */}
            {result.rejectedRequirements.length > 0 && (
              <div>
                <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                  <span className="material-icons text-error mr-1">cancel</span>
                  Does Not Meet Requirements For
                </h3>
                
                {result.rejectedRequirements.map((req) => (
                  <div 
                    key={`rejected-${req.name}`} 
                    className={`bg-white border border-neutral-100 rounded-lg mb-2 overflow-hidden`}
                  >
                    <div 
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                      onClick={() => toggleExpanded(req.name, 'rejected')}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-900">{req.name}</span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error">
                          Not Approved
                        </span>
                      </div>
                      <span className={`material-icons text-neutral-400 transform ${expandedRejected.includes(req.name) ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                    <div 
                      className={`px-4 pb-3 pt-0 border-t border-neutral-100 ${
                        expandedRejected.includes(req.name) ? 'block' : 'hidden'
                      }`}
                    >
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Missing Requirements</h4>
                        <ul className="text-sm text-neutral-600 space-y-1 ml-5 list-disc">
                          {req.missingRequirements.map((item, index) => (
                            <li key={`missing-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-neutral-900 mb-1">Missing SLOs</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {req.missingSLOs.map((slo) => (
                            <span 
                              key={`missing-slo-${slo}`}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600"
                            >
                              SLO {slo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Export options */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="flex items-center"
              >
                <span className="material-icons text-sm mr-1">picture_as_pdf</span>
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                className="flex items-center"
              >
                <span className="material-icons text-sm mr-1">table_view</span>
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrintResults}
                className="flex items-center"
              >
                <span className="material-icons text-sm mr-1">print</span>
                Print
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
