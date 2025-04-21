import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, AlertTriangle } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title?: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={downloadFile}
          className="gap-2"
          size="lg"
        >
          <Download size={18} />
          Download Syllabus
        </Button>
        
        <Button 
          onClick={openInNewTab}
          className="gap-2"
          size="lg"
        >
          <ExternalLink size={18} />
          View Syllabus
        </Button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-center">
          This PDF document is available for viewing or download. If you have trouble viewing the document in your browser, try downloading it first.
        </p>
      </div>
    </div>
  );
}