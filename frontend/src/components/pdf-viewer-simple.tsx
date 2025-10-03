'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useExtractionStore } from '@/lib/store'

// Simple PDF viewer using iframe
export function PdfViewerSimple() {
  const { selectedFile } = useExtractionStore()
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Create file URL for PDF display
  useEffect(() => {
    if (selectedFile) {
      console.log('Creating URL for file:', selectedFile.name, selectedFile.type, selectedFile.size)
      const url = URL.createObjectURL(selectedFile)
      setFileUrl(url)
      console.log('Created file URL:', url)
      return () => {
        console.log('Revoking URL:', url)
        URL.revokeObjectURL(url)
      }
    } else {
      setFileUrl(null)
    }
  }, [selectedFile])

  if (!selectedFile) {
    return (
      <Card className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Upload a PDF to view</p>
      </Card>
    )
  }

  if (!fileUrl) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Preparing PDF...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full">
      {/* PDF Display - Clean and Simple */}
      <div className="h-full bg-gray-50">
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  )
}