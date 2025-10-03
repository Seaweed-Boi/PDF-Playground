"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "PDF Extraction API"
    VERSION: str = "1.0.0"
    
    # File Upload
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf"]
    UPLOAD_DIR: str = "./uploads"
    RESULTS_DIR: str = "./results"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "*",  # Allow all origins for now - UPDATE THIS for production!
    ]
    
    # Model Configuration
    MODEL_CACHE_DIR: str = "/cache/models"
    SUPPORTED_MODELS: List[str] = ["docling", "mineru"]  # surya temporarily disabled
    
    # Processing
    MAX_PAGES: int = 100
    DEFAULT_DPI: int = 200
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Initialize settings
settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
os.makedirs(settings.MODEL_CACHE_DIR, exist_ok=True)
