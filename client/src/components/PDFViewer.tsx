import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, ExternalLink, AlertTriangle, Download } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Set up the worker for PDF.js with caching to improve performance
// Use a local worker source to avoid network issues
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  title?: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [viewMode, setViewMode] = useState<'pdf.js' | 'iframe'>('pdf.js');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setLoading(true);
    setError(null);
    setLoadStartTime(Date.now());
    setLoadTimeout(false);
    
    // Set a shorter 6-second timeout for PDF loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadTimeout(true);
      }
    }, 6000);
    
    return () => clearTimeout(timeoutId);
  }, [url]);
  
  // Reset and try again functionality
  const handleRetry = () => {
    setLoadAttempts(prev => prev + 1);
    setNumPages(null);
    setPageNumber(1);
    setLoading(true);
    setError(null);
    setLoadTimeout(false);
    // Switch to iframe view after multiple attempts
    if (loadAttempts >= 1) {
      setViewMode('iframe');
    }
  };
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setLoadTimeout(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error('Error loading PDF:', err);
    
    // Switch to iframe view if PDF.js fails
    if (viewMode === 'pdf.js') {
      console.log('Switching to iframe view due to PDF.js error');
      setViewMode('iframe');
      setLoading(false);
      setLoadTimeout(false);
    } else {
      setError('Failed to load PDF. The file may be corrupted or too large to view in the browser.');
      setLoading(false);
    }
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return numPages ? Math.min(Math.max(1, newPageNumber), numPages) : 1;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  }

  function openInNewTab() {
    window.open(url, '_blank');
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
      {title && (
        <h3 className="text-lg font-medium mb-3">{title}</h3>
      )}
      
      {loadTimeout && viewMode === 'pdf.js' && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The PDF is taking longer than expected to load. 
            <Button variant="link" onClick={handleRetry} className="px-1 py-0 h-auto">Try direct view</Button> or
            <Button variant="link" onClick={openInNewTab} className="px-1 py-0 h-auto">open in a new tab</Button>.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={viewMode} onValueChange={(val) => setViewMode(val as 'pdf.js' | 'iframe')} className="mb-2">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="pdf.js">Advanced Viewer</TabsTrigger>
          <TabsTrigger value="iframe">Direct Viewer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pdf.js">
          <div className="border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
            <div className="flex justify-between items-center p-2 border-b bg-white">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm">
                  {pageNumber} of {numPages || '...'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextPage}
                  disabled={numPages === null || pageNumber >= numPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openInNewTab} 
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 flex justify-center min-h-[500px] max-h-[600px] overflow-auto document-scroll">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-gray-400 mb-3" />
                  <span className="text-gray-500">Loading PDF...</span>
                  <span className="text-gray-400 text-xs mt-1">
                    {loadTimeout ? "This PDF may be large. Please be patient." : "This may take a moment"}
                  </span>
                </div>
              ) : (
                <Document
                  file={url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex items-center justify-center h-[500px]">
                      <Loader2 size={24} className="animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500">Loading PDF...</span>
                    </div>
                  }
                  options={{
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/standard_fonts/'
                  }}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex items-center justify-center p-4">
                        <Loader2 size={20} className="animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500 text-sm">Loading page {pageNumber}...</span>
                      </div>
                    }
                  />
                </Document>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="iframe">
          <div className="border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
            <div className="flex justify-between items-center p-2 border-b bg-white">
              <div className="text-sm text-gray-500">
                <span>Direct PDF View</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openInNewTab} 
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </Button>
            </div>
            
            <div className="p-0 min-h-[500px] max-h-[600px] overflow-hidden bg-white">
              <iframe 
                ref={iframeRef}
                src={url} 
                title={title || "PDF Document"} 
                className="w-full h-[550px] border-0"
                onLoad={() => setLoading(false)}
                onError={(e) => {
                  console.error("Iframe load error", e);
                  setError("Failed to load PDF in direct view mode.");
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
        <span>
          {viewMode === 'pdf.js' 
            ? 'Use the controls above to navigate through pages' 
            : 'Direct view provides the native browser PDF experience'}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRetry}
            className="text-xs"
          >
            <Loader2 size={14} className="mr-1" />
            Reload
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openInNewTab}
            className="text-xs"
          >
            <ExternalLink size={14} className="mr-1" />
            Open in New Tab
          </Button>
        </div>
      </div>
    </div>
  );
}