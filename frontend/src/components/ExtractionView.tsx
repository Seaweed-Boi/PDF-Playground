import { useExtractionStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, Copy } from 'lucide-react'
import { MarkdownViewer } from './MarkdownViewer'
import { copyToClipboard, downloadMarkdown } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Import PdfViewer dynamically to avoid SSR issues
const PdfViewer = dynamic(
  () => import('./pdf-viewer-simple').then(mod => mod.PdfViewerSimple),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading PDF viewer...</div>
  }
)

export function ExtractionView() {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Extraction Results</h2>
          <p className="text-sm text-muted-foreground">
            Model: {extractionResult.model} • Status: {extractionResult.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          
          <Button onClick={handleDownloadMarkdown} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download MD
          </Button>
          
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex flex-col lg:flex-row gap-4 h-[80vh]">
        {/* Left Pane - PDF Viewer */}
        <div className="flex-1 min-w-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">PDF with Annotations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)]">
              <PdfViewer />
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - Markdown Content */}
        <div className="flex-1 min-w-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Extracted Content ({extractionResult.model})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)]">
              <MarkdownViewer />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extraction Metrics */}
      {extractionResult.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Pages</div>
                <div className="text-lg">{extractionResult.metrics.num_pages}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Elements</div>
                <div className="text-lg">{extractionResult.metrics.num_elements}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Words</div>
                <div className="text-lg">{extractionResult.metrics.word_count}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Processing Time</div>
                <div className="text-lg">{extractionResult.metrics.extraction_time?.toFixed(2)}s</div>
              </div>
            </div>
            
            {/* Element breakdown */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Element Types</h4>
              <div className="grid gap-2 md:grid-cols-3">
                {Object.entries(extractionResult.metrics.element_counts || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}