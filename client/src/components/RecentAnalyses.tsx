import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Analysis } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

export default function RecentAnalyses() {
  const { data: recentAnalyses, isLoading } = useQuery({
    queryKey: ['/api/analyses/recent/3'],
    staleTime: 60000 // 1 minute
  });
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Recent Analyses</h2>
        
        {isLoading ? (
          <div className="py-4 text-center text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <p className="text-sm">Loading recent analyses...</p>
          </div>
        ) : recentAnalyses && recentAnalyses.length > 0 ? (
          <div className="space-y-3">
            {recentAnalyses.map((analysis: Analysis) => (
              <div key={analysis.id} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                <h3 className="font-medium text-neutral-900 text-sm">
                  {analysis.courseCode ? `${analysis.courseCode}: ` : ''}{analysis.courseName}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Analyzed on {formatDate(new Date(analysis.uploadDate))}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Array.isArray(analysis.approvedRequirements) && analysis.approvedRequirements.map((req: any) => (
                    <span 
                      key={`${analysis.id}-${req.name}`}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary"
                    >
                      {req.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-neutral-500">
            <p>No recent analyses found</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link href="/database">
            <a className="text-primary text-sm font-medium hover:text-primary/80">
              View database →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
