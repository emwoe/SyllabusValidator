import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { getAnalysisById } from "@/lib/api";
import { Analysis, ApprovedRequirement, RejectedRequirement, RequirementFit } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, XCircle, FileText, User, Clock, Award, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getRequirementColors } from "@/lib/requirementColors";
import PDFViewer from "@/components/PDFViewer";

export default function SyllabusView() {
  const [match, params] = useRoute<{ id: string }>("/syllabus/:id");
  const id = match && params?.id ? parseInt(params.id) : undefined;
  const [syllabusText, setSyllabusText] = useState("");
  const [fileType, setFileType] = useState("");
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [isLoadingSyllabus, setIsLoadingSyllabus] = useState(false);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["/api/analyses", id],
    queryFn: () => (id ? getAnalysisById(id) : Promise.reject("Invalid ID")),
    enabled: !!id,
  });

  useEffect(() => {
    async function loadSyllabusText() {
      if (!id) return;
      
      try {
        setIsLoadingSyllabus(true);
        const response = await fetch(`/api/analyses/${id}/content`);
        if (!response.ok) throw new Error("Failed to load syllabus content");
        
        const data = await response.json();
        setSyllabusText(data.content);
        setFileType(data.fileType || "");
        setDocumentPath(data.documentPath);
      } catch (error) {
        console.error("Error loading syllabus content:", error);
      } finally {
        setIsLoadingSyllabus(false);
      }
    }
    
    loadSyllabusText();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/database">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft size={16} /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Loading Analysis...</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/database">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft size={16} /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Analysis Not Found</h1>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              The requested analysis could not be found. It may have been deleted.
            </p>
            <Button asChild className="mt-4">
              <Link href="/database">Go to Database</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fileName = analysis.fileName || "Unknown File";
  const courseName = analysis.courseName || "Unknown Course";
  const courseCode = analysis.courseCode || "";
  const courseTitle = courseCode ? `${courseCode}: ${courseName}` : courseName;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/database">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft size={16} /> Back to Database
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2 truncate">Syllabus Analysis: {courseTitle}</h1>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Syllabus Document Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2 justify-between">
              <div className="flex items-center">
                <FileText size={18} className="mr-2" />
                Syllabus Document
                {analysis.fileType && (
                  <Badge variant="outline" className="uppercase text-xs ml-1">
                    {analysis.fileType.replace('.', '')}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="flex items-start">
                <FileText size={16} className="mr-2 mt-0.5 text-neutral-500" />
                <div>
                  <div className="font-medium">File Name</div>
                  <div className="text-sm text-neutral-600">{fileName}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <User size={16} className="mr-2 mt-0.5 text-neutral-500" />
                <div>
                  <div className="font-medium">Course</div>
                  <div className="text-sm text-neutral-600">{courseTitle}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={16} className="mr-2 mt-0.5 text-neutral-500" />
                <div>
                  <div className="font-medium">Analyzed On</div>
                  <div className="text-sm text-neutral-600">
                    {formatDate(new Date(analysis.uploadDate))}
                  </div>
                </div>
              </div>
            </div>
            
            {isLoadingSyllabus ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            ) : syllabusText ? (
              <div className="document-viewer">
                {documentPath && fileType.toLowerCase() === '.pdf' ? (
                  <div>
                    <PDFViewer 
                      url={`/api/documents/${documentPath}`} 
                      title={courseTitle} 
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-md border shadow-sm max-h-[600px] overflow-y-auto document-scroll">
                    <div className={`
                      ${fileType?.includes('pdf') ? 'font-sans' : 'font-mono'} 
                      text-sm whitespace-pre-wrap leading-relaxed
                    `}>
                      {syllabusText}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <div>
                    File size: {(analysis.fileSize / 1024).toFixed(1)} KB
                  </div>
                  <div>
                    Uploaded: {formatDate(new Date(analysis.uploadDate))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center bg-neutral-50 rounded-md border border-neutral-200 h-[300px]">
                <FileText size={36} className="text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-medium">Original syllabus content not available</p>
                <p className="text-neutral-400 text-sm mt-1 px-4">
                  This analysis was created before the document content storage feature was implemented. 
                  To see syllabus content, please upload a new document.
                </p>
                <Button variant="outline" className="mt-4" size="sm" asChild>
                  <Link href="/home">Upload New Syllabus</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Best Fit(s) */}
            <div className="mb-4">
              <h3 className="font-medium flex items-center text-blue-700 mb-2">
                <Award size={16} className="mr-1" /> Best Fit{analysis.potentialFits?.length && analysis.potentialFits.some((fit: RequirementFit) => fit.matchScore >= 90) ? 's' : ''}
              </h3>
              
              {analysis.bestFit ? (
                <div className="space-y-3">
                  {/* Primary Best Fit */}
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-blue-700">{analysis.bestFit.name}</div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {analysis.bestFit.matchScore}% Match
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-blue-600 mt-2">
                      {analysis.bestFit.reasoning}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex-1 min-w-[150px]">
                        <div className="text-xs font-medium text-blue-700 mb-1">Matching SLOs:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.bestFit.matchingSLOs?.length ? (
                            analysis.bestFit.matchingSLOs.map((slo: number) => (
                              <Badge key={slo} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                SLO {slo}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-blue-500">None</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-[150px]">
                        <div className="text-xs font-medium text-blue-700 mb-1">Missing SLOs:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.bestFit.missingSLOs?.length ? (
                            analysis.bestFit.missingSLOs.map((slo: number) => (
                              <Badge key={slo} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                SLO {slo}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-blue-500">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary Best Fits (if any) */}
                  {analysis.potentialFits?.filter((fit: RequirementFit) => fit.matchScore >= 90).map((fit: RequirementFit, index: number) => (
                    <div key={index} className="bg-blue-50 border border-blue-100 rounded-md p-3 opacity-90">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-blue-700">{fit.name}</div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {fit.matchScore}% Match
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-blue-600 mt-2">
                        {fit.reasoning}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex-1 min-w-[150px]">
                          <div className="text-xs font-medium text-blue-700 mb-1">Matching SLOs:</div>
                          <div className="flex flex-wrap gap-1">
                            {fit.matchingSLOs?.length ? (
                              fit.matchingSLOs.map((slo: number) => (
                                <Badge key={slo} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  SLO {slo}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-blue-500">None</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-[150px]">
                          <div className="text-xs font-medium text-blue-700 mb-1">Missing SLOs:</div>
                          <div className="flex flex-wrap gap-1">
                            {fit.missingSLOs?.length ? (
                              fit.missingSLOs.map((slo: number) => (
                                <Badge key={slo} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                  SLO {slo}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-blue-500">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic mb-4">No best fit requirement identified</p>
              )}
            </div>
            
            <Separator />

            <div>
              <h3 className="font-medium text-green-600 flex items-center mb-2">
                <Check size={16} className="mr-1" /> Other Potential Fits
              </h3>
              {analysis.potentialFits && analysis.potentialFits.filter((fit: RequirementFit) => fit.matchScore < 90).length > 0 ? (
                <ul className="space-y-2">
                  {analysis.potentialFits.filter((fit: RequirementFit) => fit.matchScore < 90).map((fit: RequirementFit, index: number) => {
                    const { bgColorClass, textColorClass } = getRequirementColors(fit.name);
                    // Create lighter/darker variants for the border and background
                    const bgLighterClass = bgColorClass.replace('100', '50');
                    const borderClass = bgColorClass.replace('bg', 'border');
                    return (
                      <li key={index} className={`${bgLighterClass} border ${borderClass} rounded-md p-3`}>
                        <div className="flex justify-between items-center">
                          <div className={`font-medium ${textColorClass}`}>{fit.name}</div>
                          <Badge variant="outline" className={`${bgColorClass} ${textColorClass} border-${borderClass}`}>
                            {fit.matchScore}% Match
                          </Badge>
                        </div>
                        <p className={`text-sm ${textColorClass} mt-2`}>
                          {fit.reasoning}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex-1 min-w-[150px]">
                            <div className={`text-xs font-medium ${textColorClass} mb-1`}>Matching SLOs:</div>
                            <div className="flex flex-wrap gap-1">
                              {fit.matchingSLOs?.length ? (
                                fit.matchingSLOs.map((slo: number) => (
                                  <Badge key={slo} variant="outline" className={`${bgColorClass} ${textColorClass} border-${borderClass}`}>
                                    SLO {slo}
                                  </Badge>
                                ))
                              ) : (
                                <span className={`text-xs ${textColorClass}`}>None</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <div className={`text-xs font-medium ${textColorClass} mb-1`}>Missing SLOs:</div>
                            <div className="flex flex-wrap gap-1">
                              {fit.missingSLOs?.length ? (
                                fit.missingSLOs.map((slo: number) => (
                                  <Badge key={slo} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                    SLO {slo}
                                  </Badge>
                                ))
                              ) : (
                                <span className={`text-xs ${textColorClass}`}>None</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 italic">No other potential fits identified</p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-red-600 flex items-center mb-2">
                <XCircle size={16} className="mr-1" /> Does Not Meet Requirements For
              </h3>
              {analysis.rejectedRequirements.length === 0 ? (
                <p className="text-sm text-neutral-500 italic">No requirements rejected</p>
              ) : (
                <ul className="space-y-2">
                  {analysis.rejectedRequirements.map((req: RejectedRequirement) => (
                    <li key={req.name} className="bg-red-50 border border-red-100 rounded-md p-3">
                      <div className="font-medium text-red-700">{req.name}</div>
                      <div className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Missing criteria:</span>
                        <ul className="list-disc list-inside mt-1 pl-1">
                          {req.missingRequirements.map((missing: string, idx: number) => (
                            <li key={idx} className="text-xs text-red-600 ml-2">{missing}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {req.missingSLOs.map((slo: number) => (
                          <Badge key={slo} variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            SLO {slo}
                          </Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}