import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Analysis } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Link } from "wouter";
import DeleteAnalysisButton from "@/components/DeleteAnalysisButton";

export default function Database() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  const { data: analyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
    staleTime: 60000 // 1 minute
  });
  
  const handleDeleteSuccess = () => {
    // Invalidate and refetch the analyses data
    queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
  };
  
  const filteredAnalyses = analyses 
    ? analyses.filter((analysis: Analysis) => {
        const courseInfo = `${analysis.courseCode} ${analysis.courseName}`.toLowerCase();
        const approvedRequirements = Array.isArray(analysis.approvedRequirements) 
          ? analysis.approvedRequirements.map((req: any) => req.name.toLowerCase()).join(' ')
          : '';
          
        return !searchQuery || 
          courseInfo.includes(searchQuery.toLowerCase()) ||
          approvedRequirements.includes(searchQuery.toLowerCase());
      })
    : [];
    
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens automatically via the filteredAnalyses
  };
  
  const handleExportCSV = () => {
    if (!analyses || analyses.length === 0) return;
    
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Course Code,Course Name,Upload Date,File Type,Approved Requirements\n";
    
    analyses.forEach((analysis: Analysis) => {
      const approvedReqs = Array.isArray(analysis.approvedRequirements)
        ? analysis.approvedRequirements.map((req: any) => req.name).join('; ')
        : '';
        
      csvContent += `"${analysis.courseCode}","${analysis.courseName}","${formatDate(new Date(analysis.uploadDate))}","${analysis.fileType}","${approvedReqs}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "syllabus_analyses.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Syllabus Analysis Database</h1>
        <p className="mt-2 text-neutral-600">Browse and search previously analyzed syllabi.</p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input 
                type="text" 
                placeholder="Search by course name, code, or requirement..." 
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            <Button variant="outline" onClick={handleExportCSV} className="shrink-0 flex items-center">
              <span className="material-icons text-sm mr-1">download</span>
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Analysis Results</h2>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-neutral-600">Loading analysis database...</p>
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200 border-collapse">
                <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Date Analyzed
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Approved Requirements
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      File Type
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredAnalyses.map((analysis: Analysis, index) => (
                    <tr 
                      key={analysis.id} 
                      className={`transition-colors hover:bg-primary/5 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm">
                          {analysis.courseCode && (
                            <span className="font-medium text-primary">{analysis.courseCode}</span>
                          )}
                          {analysis.courseCode && ": "}
                          <span className="font-medium text-neutral-900">{analysis.courseName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          <span className="inline-flex items-center">
                            <span className="material-icons text-neutral-400 text-xs mr-1.5">event</span>
                            {formatDate(new Date(analysis.uploadDate))}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(analysis.approvedRequirements) && analysis.approvedRequirements.map((req: any) => {
                            // Assign different colors to different requirements for better differentiation
                            let bgColorClass = '';
                            let textColorClass = '';
                            
                            // Map each requirement to a specific color to ensure legibility
                            switch(req.name) {
                              // Core requirements
                              case "Quantitative Reasoning":
                                bgColorClass = "bg-blue-100";
                                textColorClass = "text-blue-800";
                                break;
                              case "Modern Language":
                                bgColorClass = "bg-emerald-100";
                                textColorClass = "text-emerald-800";
                                break;
                              case "Natural Sciences":
                                bgColorClass = "bg-teal-100";
                                textColorClass = "text-teal-800";
                                break;
                              case "Exploring Artistic Works":
                                bgColorClass = "bg-purple-100";
                                textColorClass = "text-purple-800";
                                break;
                              case "Studies in Theology and Religion":
                                bgColorClass = "bg-yellow-100";
                                textColorClass = "text-yellow-800";
                                break;
                              case "Creativity and Making":
                                bgColorClass = "bg-rose-100";
                                textColorClass = "text-rose-800";
                                break;
                              
                              // Additional requirements
                              case "Diverse American Perspectives":
                                bgColorClass = "bg-amber-100";
                                textColorClass = "text-amber-800";
                                break;
                              case "Global Perspectives":
                                bgColorClass = "bg-indigo-100";
                                textColorClass = "text-indigo-800";
                                break;
                              case "Ethics":
                              case "Ethical Reasoning":
                                bgColorClass = "bg-cyan-100";
                                textColorClass = "text-cyan-800";
                                break;
                              
                              // Mission markers
                              case "Writing Rich Mission Marker":
                                bgColorClass = "bg-fuchsia-100";
                                textColorClass = "text-fuchsia-800";
                                break;
                              case "Social Identities Mission Marker":
                                bgColorClass = "bg-pink-100";
                                textColorClass = "text-pink-800";
                                break;
                              case "Experiential Learning for Social Justice":
                                bgColorClass = "bg-violet-100";
                                textColorClass = "text-violet-800";
                                break;
                              
                              // Other requirements
                              case "Historical Perspectives":
                                bgColorClass = "bg-orange-100";
                                textColorClass = "text-orange-800";
                                break;
                              case "Scientific Inquiry":
                                bgColorClass = "bg-green-100";
                                textColorClass = "text-green-800";
                                break;
                              case "Information Literacy":
                                bgColorClass = "bg-sky-100";
                                textColorClass = "text-sky-800";
                                break;
                              case "Critical Thinking":
                                bgColorClass = "bg-red-100";
                                textColorClass = "text-red-800";
                                break;
                              
                              // Default for any other requirements
                              default:
                                bgColorClass = "bg-neutral-200";
                                textColorClass = "text-neutral-800";
                            }
                            
                            return (
                              <span 
                                key={`${analysis.id}-${req.name}`}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bgColorClass} ${textColorClass}`}
                              >
                                {req.name}
                              </span>
                            );
                          })}
                          {(!analysis.approvedRequirements || !Array.isArray(analysis.approvedRequirements) || analysis.approvedRequirements.length === 0) && (
                            <span className="text-sm text-neutral-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          <span className="inline-flex items-center">
                            <span className="material-icons text-neutral-400 text-xs mr-1.5">description</span>
                            {analysis.fileType.toUpperCase().replace('.', '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/syllabus/${analysis.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              title="View Syllabus with Commentary"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                          <DeleteAnalysisButton
                            id={analysis.id}
                            courseName={analysis.courseName}
                            onDelete={handleDeleteSuccess}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-500">
              <p>{searchQuery ? "No matching results found" : "No analyses available yet"}</p>
              {searchQuery && (
                <p className="mt-2 text-sm">
                  Try adjusting your search terms or <Button variant="link" className="p-0 h-auto" onClick={() => setSearchQuery("")}>clear the search</Button>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
