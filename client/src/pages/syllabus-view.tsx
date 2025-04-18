import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { getAnalysisById } from "@/lib/api";
import { Analysis, ApprovedRequirement, RejectedRequirement } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, XCircle, FileText, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getRequirementColors } from "@/lib/requirementColors";

export default function SyllabusView() {
  const [match, params] = useRoute<{ id: string }>("/syllabus/:id");
  const id = match && params?.id ? parseInt(params.id) : undefined;
  const [syllabusText, setSyllabusText] = useState("");
  const [fileType, setFileType] = useState("");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Analysis details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-green-600 flex items-center mb-2">
                  <Check size={16} className="mr-1" /> Approved Requirements
                </h3>
                {analysis.approvedRequirements.length === 0 ? (
                  <p className="text-sm text-neutral-500 italic">No requirements approved</p>
                ) : (
                  <ul className="space-y-2">
                    {analysis.approvedRequirements.map((req: ApprovedRequirement) => {
                      const { bgColorClass, textColorClass } = getRequirementColors(req.name);
                      // Create lighter/darker variants for the border and background
                      const bgLighterClass = bgColorClass.replace('100', '50');
                      const borderClass = bgColorClass.replace('bg', 'border');
                      return (
                        <li key={req.name} className={`${bgLighterClass} border ${borderClass} rounded-md p-3`}>
                          <div className={`font-medium ${textColorClass}`}>{req.name}</div>
                          <div className={`text-sm ${textColorClass} mt-1`}>
                            <span className="font-medium">Matching criteria:</span>
                            <ul className="list-disc list-inside mt-1 pl-1">
                              {req.matchingRequirements.map((match: string, idx: number) => (
                                <li key={idx} className={`text-xs ${textColorClass} ml-2`}>{match}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {req.matchingSLOs.map((slo: number) => (
                              <Badge key={slo} variant="outline" className={`${bgColorClass} ${textColorClass} border-${borderClass}`}>
                                SLO {slo}
                              </Badge>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-red-600 flex items-center mb-2">
                  <XCircle size={16} className="mr-1" /> Rejected Requirements
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

        {/* Right column - Syllabus text with commentary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Syllabus Content with Commentary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSyllabus ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : syllabusText ? (
                <div className="document-viewer">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b">
                    <div className="flex items-center">
                      <FileText size={18} className="mr-2 text-neutral-600" />
                      <span className="font-medium">{analysis.fileName}</span>
                    </div>
                    {fileType && (
                      <Badge variant="outline" className="uppercase text-xs">
                        {fileType.replace('.', '')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-6 bg-white rounded-md border shadow-sm max-h-[600px] overflow-y-auto">
                    {/* Document content with styling based on file type */}
                    <div className={`
                      ${fileType?.includes('.pdf') ? 'font-sans' : 'font-mono'} 
                      text-sm whitespace-pre-wrap leading-relaxed
                    `}>
                      {syllabusText}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 flex flex-col items-center justify-center bg-neutral-50 rounded-md border border-neutral-200 h-[300px]">
                  <FileText size={36} className="text-neutral-300 mb-3" />
                  <p className="text-neutral-500">Original syllabus content not available</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    The document may have been uploaded before content storage was implemented
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}