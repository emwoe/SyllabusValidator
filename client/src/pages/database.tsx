import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Analysis } from "@shared/schema";
import { formatDate } from "@/lib/utils";

export default function Database() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['/api/analyses'],
    staleTime: 60000 // 1 minute
  });
  
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date Analyzed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Approved Requirements
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      File Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredAnalyses.map((analysis: Analysis) => (
                    <tr key={analysis.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          {analysis.courseCode && `${analysis.courseCode}: `}{analysis.courseName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(new Date(analysis.uploadDate))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(analysis.approvedRequirements) && analysis.approvedRequirements.map((req: any) => (
                            <span 
                              key={`${analysis.id}-${req.name}`}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary"
                            >
                              {req.name}
                            </span>
                          ))}
                          {(!analysis.approvedRequirements || analysis.approvedRequirements.length === 0) && (
                            <span className="text-sm text-neutral-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {analysis.fileType.toUpperCase().replace('.', '')}
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
