"""
File utilities for handling uploads and validation
"""
from fastapi import UploadFile, HTTPException
from pathlib import Path
import aiofiles
import os

from app.config import settings


async def validate_pdf(file: UploadFile) -> None:
    """
    Validate uploaded PDF file
    
    Args:
        file: Uploaded file object
        
    Raises:
        ValueError: If file is invalid
    """
    # Check file extension
    if not file.filename:
        raise ValueError("No filename provided")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext != ".pdf":
        raise ValueError(f"Invalid file type: {file_ext}. Only PDF files are allowed.")
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_FILE_SIZE:
        max_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
        raise ValueError(f"File too large. Maximum size is {max_mb}MB")
    
    if file_size == 0:
        raise ValueError("File is empty")


async def save_upload_file(file: UploadFile, task_id: str) -> str:
    """
    Save uploaded file to disk
    
    Args:
        file: Uploaded file object
        task_id: Unique task identifier
        
    Returns:
        Path to saved file
    """
    # Create upload directory for this task
    upload_dir = Path(settings.UPLOAD_DIR) / task_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return str(file_path)


def cleanup_task_files(task_id: str) -> None:
    """
    Clean up temporary files for a task
    
    Args:
        task_id: Task identifier
    """
    import shutil
    
    # Remove upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / task_id
    if upload_dir.exists():
        shutil.rmtree(upload_dir)
    
    # Optionally remove results (keep for now)
    # results_dir = Path(settings.RESULTS_DIR) / task_id
    # if results_dir.exists():
    #     shutil.rmtree(results_dir)
