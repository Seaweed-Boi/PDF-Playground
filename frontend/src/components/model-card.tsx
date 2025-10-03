import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface Model {
  name: string
  description?: string
  // Add other properties your model object has
}

interface ModelCardProps {
  model: Model
  selected: boolean
  onToggle: () => void
}

export function ModelCard({ model, selected, onToggle }: ModelCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-colors hover:border-primary ${
        selected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          {selected && (
            <Check className="h-5 w-5 text-primary" />
          )}
        </div>
        {model.description && (
          <CardDescription>{model.description}</CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}