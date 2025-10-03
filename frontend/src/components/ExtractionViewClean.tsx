import { useExtractionStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Copy } from 'lucide-react'
import { MarkdownViewer } from './MarkdownViewer'
import { copyToClipboard, downloadMarkdown } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Import PdfViewer dynamically to avoid SSR issues
const PdfViewer = dynamic(
  () => import('./pdf-viewer-simple').then(mod => mod.PdfViewerSimple),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading PDF viewer...</div>
  }
)

export function ExtractionViewClean() {
  const { extractionResult, reset } = useExtractionStore()

  if (!extractionResult) return null

  const handleCopyToClipboard = async () => {
    if (extractionResult.markdown_content) {
      const success = await copyToClipboard(extractionResult.markdown_content)
      // Could add toast notification here
    }
  }

  const handleDownloadMarkdown = () => {
    if (extractionResult.markdown_content) {
      downloadMarkdown(
        extractionResult.markdown_content, 
        `${extractionResult.model}-extraction.md`
      )
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extraction Results</h1>
          <p className="text-gray-600 mt-1">
            Model: {extractionResult.model} • Status: {extractionResult.status}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCopyToClipboard} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          
          <Button onClick={handleDownloadMarkdown} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download MD
          </Button>
          
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Dual Pane Layout - Fixed Overlap Issue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">
        
        {/* Left Pane - PDF Viewer */}
        <div className="w-full">
          <Card className="h-[70vh] overflow-hidden">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg">PDF Document</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(70vh-4rem)] relative">
              <div className="absolute inset-0">
                <PdfViewer />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - Extracted Content */}
        <div className="w-full">
          <Card className="h-[70vh]">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg">Extracted Content</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(70vh-4rem)] overflow-y-auto">
              <MarkdownViewer />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing Metrics */}
      {extractionResult.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{extractionResult.metrics.num_pages}</div>
                <div className="text-sm text-gray-600">Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{extractionResult.metrics.num_elements}</div>
                <div className="text-sm text-gray-600">Elements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{extractionResult.metrics.word_count}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{extractionResult.metrics.extraction_time?.toFixed(1)}s</div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
            </div>
            
            {/* Element breakdown - Debug and Fix */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Element Types</h4>
              {(() => {
                console.log('Element counts:', extractionResult.metrics.element_counts);
                return null;
              })()}
              {extractionResult.metrics.element_counts && Object.keys(extractionResult.metrics.element_counts).length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(extractionResult.metrics.element_counts).map(([type, count]) => (
                    <div key={type} className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-lg font-bold text-blue-600">{count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
                  <div className="text-gray-600">Element type breakdown not available</div>
                  <div className="text-sm text-gray-500 mt-1">This model doesn't provide detailed element classification</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}