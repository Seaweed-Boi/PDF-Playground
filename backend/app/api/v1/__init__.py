"""API v1 router"""
from fastapi import APIRouter
from app.api.v1.endpoints import extraction, models, health

router = APIRouter()

router.include_router(health.router, tags=["health"])
router.include_router(models.router, prefix="/models", tags=["models"])
router.include_router(extraction.router, prefix="/extract", tags=["extraction"])
