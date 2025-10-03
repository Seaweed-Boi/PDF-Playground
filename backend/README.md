# PDF Extraction Playground - Backend

FastAPI backend for PDF extraction using Docling, MinerU, and Surya models.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run locally
uvicorn app.main:app --reload

# Deploy to Modal
modal setup
modal deploy modal_app.py
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1/models/` - List all models
- `GET /api/v1/models/{model_name}` - Get model info
- `POST /api/v1/extract/single` - Extract with single model
- `POST /api/v1/extract/compare` - Compare multiple models
- `GET /api/v1/extract/annotations/{task_id}` - Get annotations
- `GET /api/v1/extract/markdown/{task_id}` - Download markdown

## Models

### Docling
- Best for complex documents with tables
- Superior layout analysis
- Formula recognition
- ~5-10s per page

### MinerU
- Specialized for scientific papers
- Excellent LaTeX extraction
- Bibliography parsing
- ~3-7s per page

### Surya
- 90+ languages supported
- Fast processing
- Good for scanned documents
- ~2-5s per page

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install in development mode
pip install -r requirements.txt

# Run tests (if available)
pytest

# Format code
black app/
isort app/
```

## Modal Deployment

```bash
# Set up Modal
modal setup

# Create secrets
modal secret create pdf-extraction-secrets

# Deploy
modal deploy modal_app.py

# Check logs
modal app logs pdf-extraction-api
```

## Environment Variables

See `.env.example` for all configuration options.

Required:
- `API_HOST` - API host (default: 0.0.0.0)
- `API_PORT` - API port (default: 8000)
- `MAX_FILE_SIZE` - Max upload size in bytes
- `CORS_ORIGINS` - Allowed CORS origins

## Architecture

```
app/
├── api/           # API routes and endpoints
├── services/      # Business logic and model services
├── models/        # Pydantic schemas
├── utils/         # Helper functions
├── config.py      # Configuration management
└── main.py        # FastAPI application
```

## License

MIT
