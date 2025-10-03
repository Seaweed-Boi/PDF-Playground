"""
Model information endpoints
"""
from fastapi import APIRouter
from typing import List
from app.models.schemas import ModelInfo, ModelType

router = APIRouter()

# Model information database
MODEL_INFO = {
    ModelType.DOCLING: ModelInfo(
        name=ModelType.DOCLING,
        display_name="Docling",
        description="Advanced document understanding framework with layout analysis",
        capabilities=[
            "Layout detection",
            "Table extraction",
            "Formula recognition",
            "Multi-column support",
            "Figure extraction",
        ],
        strengths=[
            "Excellent for complex academic papers",
            "Superior table structure preservation",
            "Handles multi-column layouts well",
            "Good formula recognition",
        ],
        limitations=[
            "Slower processing speed",
            "Requires more GPU memory",
            "May struggle with handwritten text",
        ],
        recommended_for=[
            "Scientific papers",
            "Research documents",
            "Technical reports",
            "Documents with complex tables",
        ],
        average_speed="~5-10 seconds per page",
        gpu_required=True,
    ),
    ModelType.MINERU: ModelInfo(
        name=ModelType.MINERU,
        display_name="MinerU",
        description="Specialized PDF extraction tool optimized for scientific documents",
        capabilities=[
            "Scientific document parsing",
            "Mathematical notation",
            "Citation extraction",
            "Bibliography parsing",
            "Figure and caption linking",
        ],
        strengths=[
            "Optimized for academic papers",
            "Excellent LaTeX formula extraction",
            "Good bibliography handling",
            "Fast processing",
        ],
        limitations=[
            "Less effective on non-academic documents",
            "May miss complex layouts",
            "Limited table extraction",
        ],
        recommended_for=[
            "Academic papers",
            "ArXiv documents",
            "Mathematical texts",
            "Papers with equations",
        ],
        average_speed="~3-7 seconds per page",
        gpu_required=True,
    ),
    ModelType.SURYA: ModelInfo(
        name=ModelType.SURYA,
        display_name="Surya",
        description="Multilingual OCR with advanced layout analysis and fallback extraction",
        capabilities=[
            "90+ language support",
            "Layout detection",
            "Reading order detection",
            "Text line detection",
            "Robust OCR with fallback",
        ],
        strengths=[
            "Excellent multilingual support",
            "Fast processing with PyMuPDF fallback",
            "Good for scanned documents",
            "Reliable text extraction",
        ],
        limitations=[
            "Limited table structure extraction",
            "No formula recognition",
            "Uses fallback extraction currently",
        ],
        recommended_for=[
            "Multilingual documents",
            "Scanned PDFs",
            "Simple text extraction",
            "Non-English documents",
        ],
        average_speed="~2-5 seconds per page",
        gpu_required=False,  # Uses fallback
    ),
}


@router.get("/", response_model=List[ModelInfo])
async def list_models():
    """
    Get list of all available extraction models with their capabilities
    """
    return list(MODEL_INFO.values())


@router.get("/{model_name}", response_model=ModelInfo)
async def get_model_info(model_name: ModelType):
    """
    Get detailed information about a specific model
    """
    return MODEL_INFO[model_name]
