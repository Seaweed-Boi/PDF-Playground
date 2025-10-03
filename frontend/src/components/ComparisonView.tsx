import { useExtractionStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, RefreshCw, Copy, Clock, FileText, Hash, Trophy } from 'lucide-react'
import { MarkdownViewer } from './MarkdownViewer'
import { copyToClipboard, downloadMarkdown } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'

export function ComparisonView() {
  const { comparisonResult, reset } = useExtractionStore()

  if (!comparisonResult) return null

  const results = Object.entries(comparisonResult.results)
  const metrics = comparisonResult.comparison_metrics

  const handleCopyAll = async () => {
    const combinedContent = results.map(([model, result]) => 
      `# ${model.toUpperCase()} Extraction\n\n${result.markdown_content}\n\n---\n\n`
    ).join('')
    
    await copyToClipboard(combinedContent)
  }

  const handleDownloadAll = () => {
    results.forEach(([model, result]) => {
      if (result.markdown_content) {
        downloadMarkdown(
          result.markdown_content, 
          `${model}-comparison-extraction.md`
        )
      }
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Comparison Results</h1>
          <p className="text-gray-600 mt-1">
            Comparing {results.length} models • Task: {comparisonResult.task_id}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCopyAll} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy All
          </Button>
          
          <Button onClick={handleDownloadAll} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Comparison
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.fastest_model}</div>
              <div className="text-sm text-gray-600">Fastest Model</div>
              <div className="text-xs text-gray-500">
                {metrics.speed_comparison[metrics.fastest_model]?.toFixed(1)}s
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.most_elements}</div>
              <div className="text-sm text-gray-600">Most Elements Detected</div>
              <div className="text-xs text-gray-500">
                {metrics.element_comparison[metrics.most_elements]} elements
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.longest_content}</div>
              <div className="text-sm text-gray-600">Most Content Extracted</div>
              <div className="text-xs text-gray-500">
                {metrics.content_length_comparison[metrics.longest_content]} chars
              </div>
            </div>
          </div>

          {/* Detailed Speed Comparison */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Speed Comparison</h4>
            <div className="space-y-2">
              {Object.entries(metrics.speed_comparison)
                .sort(([,a], [,b]) => a - b)
                .map(([model, time], index) => (
                <div key={model} className="flex items-center justify-between p-3 rounded bg-gray-50 border">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="min-w-[40px]">
                      {index === 0 ? "🏆" : `#${index + 1}`}
                    </Badge>
                    <span className="font-medium text-gray-900 capitalize">
                      {model.charAt(0).toUpperCase() + model.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-mono text-sm">{time.toFixed(1)}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {results.map(([model, result]) => (
          <Card key={model} className="flex flex-col h-[80vh]">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </CardTitle>
                <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                  {result.status}
                </Badge>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{result.metrics?.num_pages || 0}</div>
                  <div className="text-gray-600">Pages</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{result.metrics?.num_elements || 0}</div>
                  <div className="text-gray-600">Elements</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">{result.metrics?.extraction_time?.toFixed(1) || 0}s</div>
                  <div className="text-gray-600">Time</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div className="h-full overflow-auto p-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.markdown_content || 'No content extracted'}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Model</th>
                      <th className="border border-gray-200 p-2 text-center">Pages</th>
                      <th className="border border-gray-200 p-2 text-center">Elements</th>
                      <th className="border border-gray-200 p-2 text-center">Words</th>
                      <th className="border border-gray-200 p-2 text-center">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(([model, result]) => (
                      <tr key={model}>
                        <td className="border border-gray-200 p-2 font-medium">
                          {model.charAt(0).toUpperCase() + model.slice(1)}
                        </td>
                        <td className="border border-gray-200 p-2 text-center">{result.metrics?.num_pages || 0}</td>
                        <td className="border border-gray-200 p-2 text-center">{result.metrics?.num_elements || 0}</td>
                        <td className="border border-gray-200 p-2 text-center">{result.metrics?.word_count || 0}</td>
                        <td className="border border-gray-200 p-2 text-center">{result.metrics?.extraction_time?.toFixed(1) || 0}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="elements" className="mt-4">
              <div className="grid gap-4">
                {results.map(([model, result]) => (
                  <div key={model} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{model.charAt(0).toUpperCase() + model.slice(1)} Element Types</h4>
                    {result.metrics?.element_counts && Object.keys(result.metrics.element_counts).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.metrics.element_counts).map(([type, count]) => (
                          <Badge key={type} variant="outline">
                            {type.replace(/_/g, ' ')}: {count}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No element breakdown available</span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-4">
              <div className="space-y-4">
                {results.map(([model, result]) => (
                  <div key={model} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{model.charAt(0).toUpperCase() + model.slice(1)} Content Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Characters</div>
                        <div className="font-bold">{result.metrics?.character_count?.toLocaleString() || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Words</div>
                        <div className="font-bold">{result.metrics?.word_count?.toLocaleString() || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Avg Words/Element</div>
                        <div className="font-bold">
                          {result.metrics?.num_elements && result.metrics?.word_count 
                            ? Math.round(result.metrics.word_count / result.metrics.num_elements)
                            : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Processing Speed (lower is better)</h4>
                  {results.map(([model, result]) => {
                    const time = result.metrics?.extraction_time || 0
                    const maxTime = Math.max(...results.map(([, r]) => r.metrics?.extraction_time || 0))
                    const width = maxTime > 0 ? (time / maxTime) * 100 : 0
                    
                    return (
                      <div key={model} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{model.charAt(0).toUpperCase() + model.slice(1)}</span>
                          <span>{time.toFixed(1)}s</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}