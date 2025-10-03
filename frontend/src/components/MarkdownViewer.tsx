import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { useExtractionStore } from '@/lib/store'
import { copyToClipboard, downloadMarkdown } from '@/lib/utils'

export function MarkdownViewer() {
  const { extractionResult } = useExtractionStore()
  
  // Add null check
  if (!extractionResult || !extractionResult.markdown_content) {
    return (
      <div className="p-4 text-gray-500">
        No content available
      </div>
    )
  }

  return (
    <div className="p-4 w-full h-full">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {extractionResult.markdown_content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
