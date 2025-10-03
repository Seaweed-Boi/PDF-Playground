"""
PDF extraction endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Request
from fastapi.responses import FileResponse
from typing import Optional
import uuid
import aiofiles
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.models.schemas import (
    ExtractionResponse,
    ComparisonResponse,
    ModelType,
    ErrorResponse,
)
from app.services.processor import PDFProcessor
from app.utils.file_utils import validate_pdf, save_upload_file

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Initialize processor
processor = PDFProcessor()


@router.post("/single", response_model=ExtractionResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def extract_single_model(
    request: Request,
    file: UploadFile = File(..., description="PDF file to extract"),
    model: ModelType = Form(..., description="Model to use for extraction"),
    generate_annotations: bool = Form(True, description="Generate visual annotations"),
):
    """
    Extract content from PDF using a single model
    
    - **file**: PDF file to process (max 50MB)
    - **model**: Extraction model to use (docling, mineru, or surya)
    - **generate_annotations**: Whether to generate annotated images
    
    Returns extracted markdown content, document elements, and metrics.
    """
    # Validate file
    try:
        await validate_pdf(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    try:
        # Save uploaded file
        file_path = await save_upload_file(file, task_id)
        
        # Process PDF
        logger.info(f"Processing {file.filename} with {model} model")
        result = await processor.process_pdf(
            file_path=file_path,
            model=model,
            task_id=task_id,
            generate_annotations=generate_annotations,
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}",
        )


@router.post("/compare", response_model=ComparisonResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def extract_compare_models(
    request: Request,
    file: UploadFile = File(..., description="PDF file to extract"),
    models: str = Form(..., description="Comma-separated list of models (e.g., 'docling,mineru')"),
    generate_annotations: bool = Form(True, description="Generate visual annotations"),
):
    """
    Extract content from PDF using multiple models for comparison
    
    - **file**: PDF file to process (max 50MB)
    - **models**: Comma-separated model names (2-3 models)
    - **generate_annotations**: Whether to generate annotated images
    
    Returns results from all models with comparison metrics.
    """
    # Validate file
    try:
        await validate_pdf(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Parse models
    try:
        model_list = [ModelType(m.strip()) for m in models.split(",")]
        if len(model_list) < 2 or len(model_list) > 3:
            raise ValueError("Must select 2-3 models for comparison")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    try:
        # Save uploaded file
        file_path = await save_upload_file(file, task_id)
        
        # Process with all models
        logger.info(f"Processing {file.filename} with models: {model_list}")
        results = {}
        
        for model in model_list:
            result = await processor.process_pdf(
                file_path=file_path,
                model=model,
                task_id=f"{task_id}_{model}",
                generate_annotations=generate_annotations,
            )
            results[model.value] = result
        
        # Calculate comparison metrics
        comparison_metrics = processor.compare_results(results)
        
        return ComparisonResponse(
            task_id=task_id,
            results=results,
            comparison_metrics=comparison_metrics,
        )
        
    except Exception as e:
        logger.error(f"Error in comparison: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing comparison: {str(e)}",
        )


@router.get("/annotations/{task_id}")
async def get_annotations(task_id: str, page: int = 1):
    """
    Get annotated image for a specific page
    
    - **task_id**: Task ID from extraction request
    - **page**: Page number (1-indexed)
    
    Returns PNG image with bounding box annotations.
    """
    annotations_path = f"{settings.RESULTS_DIR}/{task_id}/annotations/page_{page}.png"
    
    try:
        return FileResponse(
            annotations_path,
            media_type="image/png",
            filename=f"annotated_page_{page}.png",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Annotations not found for this task/page",
        )


@router.get("/markdown/{task_id}")
async def get_markdown(task_id: str):
    """
    Download extracted markdown content
    
    - **task_id**: Task ID from extraction request
    
    Returns markdown file for download.
    """
    markdown_path = f"{settings.RESULTS_DIR}/{task_id}/content.md"
    
    try:
        return FileResponse(
            markdown_path,
            media_type="text/markdown",
            filename="extracted_content.md",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Markdown file not found for this task",
        )
