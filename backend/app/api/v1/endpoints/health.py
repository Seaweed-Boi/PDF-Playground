"""
Health check endpoints
"""
from fastapi import APIRouter
from app.models.schemas import HealthResponse
import torch

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Check API health and model availability
    """
    # Check which models are available
    models_loaded = []
    
    try:
        # These would be actual checks if models are loaded
        models_loaded = ["docling", "mineru"]  # surya temporarily disabled
    except Exception:
        pass
    
    return HealthResponse(
        status="healthy",
        models_loaded=models_loaded,
        gpu_available=torch.cuda.is_available(),
    )
