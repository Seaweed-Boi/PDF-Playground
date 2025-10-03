'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ModelSelector } from '@/components/model-selector'
import { useExtractionStore } from '@/lib/store'
import { extractionApi } from '@/lib/api'
import { formatBytes } from '@/lib/utils'

const MAX_FILE_SIZE = 52428800 // 50MB

export function UploadSection() {
  const {
    selectedFile,
    selectedModels,
    setSelectedFile,
    setExtractionResult,
    setComparisonResult,
    setIsProcessing,
    setError,
  } = useExtractionStore()

  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`)
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }, [setSelectedFile, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  })

  const handleExtract = async () => {
    if (!selectedFile || selectedModels.length === 0) return

    setIsProcessing(true)
    setError(null)
    setUploadProgress(10)

    try {
      if (selectedModels.length === 1) {
        // Single model extraction
        setUploadProgress(30)
        const result = await extractionApi.extractSingle(selectedFile, selectedModels[0])
        setUploadProgress(100)
        setExtractionResult(result)
      } else {
        // Multi-model comparison
        setUploadProgress(30)
        const result = await extractionApi.extractCompare(selectedFile, selectedModels)
        setUploadProgress(100)
        setComparisonResult(result)
      }
    } catch (error: any) {
      console.error('Extraction error:', error)
      setError(error.response?.data?.detail || 'Failed to extract PDF. Please try again.')
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Card */}
      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${selectedFile ? 'bg-muted/50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {selectedFile ? (
            <div className="space-y-3">
              <FileText className="h-16 w-16 mx-auto text-primary" />
              <div>
                <p className="text-lg font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                }}
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (max {formatBytes(MAX_FILE_SIZE)})
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Model Selection */}
      <ModelSelector />

      {/* Extract Button */}
      {selectedFile && selectedModels.length > 0 && (
        <div className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleExtract}
            disabled={uploadProgress > 0}
          >
            {uploadProgress > 0 ? (
              'Processing...'
            ) : selectedModels.length > 1 ? (
              `Compare ${selectedModels.length} models`
            ) : (
              `Extract with ${selectedModels[0]}`
            )}
          </Button>

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>
      )}
    </div>
  )
}
