'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { UploadSection } from '@/components/upload-section'
import { ExtractionViewClean } from '@/components/ExtractionViewClean'
import { ComparisonView } from '@/components/ComparisonView'
import { useExtractionStore } from '@/lib/store'

export default function Home() {
  const { extractionResult, comparisonResult, isProcessing } = useExtractionStore()
  
  // Determine what to show based on available results
  const showResults = extractionResult || comparisonResult

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {!showResults ? (
          <div className="container mx-auto px-4 py-8">
            <UploadSection />
          </div>
        ) : comparisonResult ? (
          <ComparisonView />
        ) : (
          <ExtractionViewClean />
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>PDF Extraction Playground © 2025 | Built with Next.js, FastAPI, and Modal</p>
      </footer>
    </div>
  )
}
