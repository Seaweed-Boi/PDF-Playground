"""
PDF Processing Service
Coordinates different extraction models
"""
import os
from pathlib import Path
from typing import Dict, Any
from loguru import logger
import time

from app.config import settings
from app.models.schemas import (
    ModelType,
    ExtractionResponse,
    ExtractionMetrics,
    DocumentElement,
)
from app.services.models.docling_service import DoclingService
from app.services.models.mineru_service import MinerUService
from app.services.models.surya_service import SuryaService


class PDFProcessor:
    """Main PDF processing orchestrator"""
    
    def __init__(self):
        """Initialize all model services"""
        self.services = {
            ModelType.DOCLING: DoclingService(),
            ModelType.MINERU: MinerUService(),
            ModelType.SURYA: SuryaService(),
        }
        logger.info("PDF Processor initialized with Docling and MinerU models")
    
    async def process_pdf(
        self,
        file_path: str,
        model: ModelType,
        task_id: str,
        generate_annotations: bool = True,
    ) -> ExtractionResponse:
        """
        Process PDF with specified model
        
        Args:
            file_path: Path to PDF file
            model: Model to use
            task_id: Unique task identifier
            generate_annotations: Whether to generate visual annotations
            
        Returns:
            ExtractionResponse with results
        """
        start_time = time.time()
        
        try:
            # Get appropriate service
            service = self.services[model]
            
            # Extract content
            logger.info(f"Starting extraction with {model.value}")
            result = await service.extract(
                file_path=file_path,
                task_id=task_id,
                generate_annotations=generate_annotations,
            )
            
            # Calculate metrics
            extraction_time = time.time() - start_time
            metrics = self._calculate_metrics(
                result["elements"],
                result["markdown_content"],
                extraction_time,
            )
            
            # Prepare response
            response = ExtractionResponse(
                task_id=task_id,
                model=model,
                status="completed",
                markdown_content=result["markdown_content"],
                elements=result["elements"],
                metrics=metrics,
                annotations_url=result.get("annotations_url"),
            )
            
            # Save markdown
            await self._save_markdown(task_id, result["markdown_content"])
            
            logger.info(
                f"Extraction completed in {extraction_time:.2f}s, "
                f"found {len(result['elements'])} elements"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in PDF processing: {str(e)}", exc_info=True)
            raise
    
    def _calculate_metrics(
        self,
        elements: list,
        markdown_content: str,
        extraction_time: float,
    ) -> ExtractionMetrics:
        """Calculate extraction metrics"""
        # Count element types
        element_counts = {}
        pages = set()
        
        for element in elements:
            elem_type = element.type.value if hasattr(element, 'type') else element.get('type')
            element_counts[elem_type] = element_counts.get(elem_type, 0) + 1
            page = element.page if hasattr(element, 'page') else element.get('page', 1)
            pages.add(page)
        
        # Count characters and words
        character_count = len(markdown_content)
        word_count = len(markdown_content.split())
        
        return ExtractionMetrics(
            extraction_time=extraction_time,
            num_pages=len(pages),
            num_elements=len(elements),
            element_counts=element_counts,
            character_count=character_count,
            word_count=word_count,
        )
    
    async def _save_markdown(self, task_id: str, content: str):
        """Save markdown content to file"""
        import aiofiles
        
        result_dir = Path(settings.RESULTS_DIR) / task_id
        result_dir.mkdir(parents=True, exist_ok=True)
        
        markdown_path = result_dir / "content.md"
        async with aiofiles.open(markdown_path, "w", encoding="utf-8") as f:
            await f.write(content)
    
    def compare_results(self, results: Dict[str, ExtractionResponse]) -> Dict[str, Any]:
        """
        Compare results from multiple models
        
        Args:
            results: Dictionary of model -> ExtractionResponse
            
        Returns:
            Dictionary with comparison metrics
        """
        comparison = {
            "fastest_model": None,
            "most_elements": None,
            "longest_content": None,
            "speed_comparison": {},
            "element_comparison": {},
            "content_length_comparison": {},
        }
        
        fastest_time = float('inf')
        most_elements = 0
        longest_content = 0
        
        for model_name, result in results.items():
            # Speed comparison
            extraction_time = result.metrics.extraction_time
            comparison["speed_comparison"][model_name] = extraction_time
            
            if extraction_time < fastest_time:
                fastest_time = extraction_time
                comparison["fastest_model"] = model_name
            
            # Element count comparison
            num_elements = result.metrics.num_elements
            comparison["element_comparison"][model_name] = num_elements
            
            if num_elements > most_elements:
                most_elements = num_elements
                comparison["most_elements"] = model_name
            
            # Content length comparison
            content_length = result.metrics.character_count
            comparison["content_length_comparison"][model_name] = content_length
            
            if content_length > longest_content:
                longest_content = content_length
                comparison["longest_content"] = model_name
        
        return comparison
