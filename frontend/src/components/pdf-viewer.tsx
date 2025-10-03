'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useExtractionStore } from '@/lib/store'
import { extractionApi } from '@/lib/api'
import dynamic from 'next/dynamic'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

// Import PDF components only on client side
const Document = dynamic(
  () => import('react-pdf').then(mod => mod.Document),
  { ssr: false }
)

const Page = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
)

// Set up PDF.js worker properly
let workerInitialized = false

const initializePdfWorker = async () => {
  if (workerInitialized || typeof window === 'undefined') return
  
  try {
    const pdfjs = await import('pdfjs-dist')
    
    // Use a more reliable worker source
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString()
    
    console.log('PDF.js worker initialized successfully')
    workerInitialized = true
  } catch (error) {
    console.error('Failed to initialize PDF.js worker:', error)
    
    // Fallback to CDN
    try {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
      workerInitialized = true
      console.log('PDF.js worker initialized with CDN fallback')
    } catch (fallbackError) {
      console.error('Failed to initialize PDF.js worker with fallback:', fallbackError)
    }
  }
}

export function PdfViewer() {
  const { extractionResult, selectedFile, currentPage, setCurrentPage } = useExtractionStore()
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)

  const [loading, setLoading] = useState<boolean>(true)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize PDF worker and create file URL
  useEffect(() => {
    initializePdfWorker()
  }, [])

  // Create file URL for PDF display
  useEffect(() => {
    if (selectedFile) {
      console.log('Creating URL for file:', selectedFile.name, selectedFile.type, selectedFile.size)
      const url = URL.createObjectURL(selectedFile)
      setFileUrl(url)
      setError(null)
      console.log('Created file URL:', url)
      return () => {
        console.log('Revoking URL:', url)
        URL.revokeObjectURL(url)
      }
    } else {
      setFileUrl(null)
    }
  }, [selectedFile])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages)
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setError(`Failed to load PDF: ${error.message}`)
    setLoading(false)
  }

  const goToPrevPage = () => {
    setCurrentPage(Math.max(1, currentPage - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(Math.min(numPages, currentPage + 1))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2))
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

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

  if (error) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">File: {selectedFile.name}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            Page {currentPage} of {numPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="flex justify-center">
          <div className="relative">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <p className="text-red-500 mb-2">Failed to load PDF</p>
                    <p className="text-sm text-muted-foreground">Check browser console for details</p>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                className="shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>


          </div>
        </div>
      </div>
    </div>
  )
}