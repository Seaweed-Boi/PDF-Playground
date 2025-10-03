import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { modelApi } from '@/lib/api'
import { useExtractionStore } from '@/lib/store'
import { ModelCard } from './model-card'

interface ModelInfo {
  name: string
  description?: string
  provider?: string
}

export function ModelSelector() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedModels, setSelectedModels } = useExtractionStore()
  
  useEffect(() => {
    setLoading(true)
    modelApi.getModels()
      .then(setModels)
      .catch((err) => {
        console.error('Failed to fetch models:', err)
        setError(err.message || 'Failed to load models')
      })
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading models...
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
        <br />
        <small className="text-muted-foreground">
          Check console for details. Make sure backend is running.
        </small>
      </div>
    )
  }
  
  if (models.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No models available
      </div>
    )
  }
  
  const toggleModel = (modelName: string) => {
    if (selectedModels.includes(modelName)) {
      setSelectedModels(selectedModels.filter(m => m !== modelName))
    } else if (selectedModels.length < 3) {
      setSelectedModels([...selectedModels, modelName])
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Extraction Model(s)</h3>
        {selectedModels.length > 1 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Comparison Mode
          </Badge>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {models.map(model => (
          <ModelCard 
            key={model.name}
            model={model}
            selected={selectedModels.includes(model.name)}
            onToggle={() => toggleModel(model.name)}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        {selectedModels.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected
            {selectedModels.length > 1 && ' - Results will be compared side-by-side'}
          </p>
        )}
        {selectedModels.length >= 3 && (
          <p className="text-xs text-amber-600">
            Maximum 3 models for comparison
          </p>
        )}
      </div>
    </div>
  )
}