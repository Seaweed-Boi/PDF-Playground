# PDF Extraction Playground - Frontend

Next.js frontend for PDF extraction platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
npm start

# Deploy to Vercel
vercel
```

## Features

- Drag-and-drop PDF upload
- Model selection with descriptions
- Dual-pane viewer (PDF + Markdown)
- Visual annotations with bounding boxes
- Multi-model comparison
- Dark/Light mode
- Export to markdown
- Copy to clipboard
- Responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Shadcn/UI (Radix)
- **State**: Zustand
- **HTTP**: Axios
- **PDF**: React-PDF
- **Markdown**: React-Markdown

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── ui/           # Shadcn UI components
│   └── ...           # Custom components
└── lib/              # Utilities and helpers
    ├── api.ts        # API client
    ├── store.ts      # Zustand store
    └── utils.ts      # Helper functions
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Lint code
npm run lint

# Build
npm run build
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=PDF Extraction Playground
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on Vercel
3. Configure environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Components

### Core Components

- `Header` - Navigation and theme toggle
- `UploadSection` - File upload interface
- `ModelSelector` - Model selection UI
- `ExtractionView` - Results display
- `PdfViewer` - PDF with annotations
- `MarkdownViewer` - Markdown renderer

### UI Components (Shadcn)

- Button, Card, Dialog
- Select, Tabs, Toast
- Progress, Alert
- And more...

## State Management

Using Zustand for global state:

```typescript
const { 
  selectedFile,
  selectedModels,
  extractionResult,
  isProcessing 
} = useExtractionStore()
```

## API Integration

```typescript
import { extractionApi } from '@/lib/api'

// Single extraction
const result = await extractionApi.extractSingle(file, 'docling')

// Comparison
const comparison = await extractionApi.extractCompare(file, ['docling', 'surya'])
```

## License

MIT
