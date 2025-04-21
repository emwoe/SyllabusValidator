import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PDFViewerProps {
  url: string;
  title?: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openInNewTab() {
    window.open(url, '_blank');
  }

  function downloadFile() {
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = title || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-red-600 mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          <p>{error}</p>
        </div>
        <Button 
          onClick={openInNewTab}
          className="gap-2"
        >
          <ExternalLink size={16} />
          Open in New Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <Card>
        <CardHeader>
          <CardTitle>{title || "Document"}</CardTitle>
          <CardDescription>PDF Document</CardDescription>
        </CardHeader>
        
        <CardContent className="flex items-center justify-center p-6 bg-gray-50">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-36 h-48 bg-white border border-gray-200 rounded-sm shadow-sm mb-4 relative flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-600"></div>
              <FileText className="text-gray-400 mb-2" size={48} />
              <div className="text-xs text-gray-500 px-2 text-center">Document Preview</div>
              <div className="absolute right-0 bottom-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-tl-sm font-medium">PDF</div>
            </div>
            <p className="text-sm text-gray-500 text-center max-w-sm truncate">{title || "Document"}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={downloadFile}
            className="gap-2"
          >
            <Download size={16} />
            Download
          </Button>
          
          <Button 
            onClick={openInNewTab}
            className="gap-2"
          >
            <ExternalLink size={16} />
            View PDF
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          This PDF document is available for <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">direct viewing</a> or download. 
          If you have trouble viewing the document, try downloading it first.
        </p>
      </div>
    </div>
  );
}