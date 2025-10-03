"""
Modal deployment configuration for PDF Extraction API
Updated: Removed Surya OCR dependency temporarily
"""
import modal
from pathlib import Path

# Create Modal app
app = modal.App("pdf-extraction-api")

# Define the image with all dependencies
# Let pip resolve compatible versions automatically
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("poppler-utils", "libgl1-mesa-glx", "libglib2.0-0")
    .pip_install(
        # Core API dependencies with pinned versions
        "fastapi==0.109.0",
        "python-multipart",
        "pydantic>=2.5",
        "pydantic-settings",
        "aiofiles",
        "slowapi",
        "loguru",
        "python-dotenv",
        # PDF processing - let pip resolve versions
        "pymupdf",
        "pdf2image",
        "Pillow",
        # ML frameworks - install these first
        "torch",
        "torchvision", 
        "transformers",
        "numpy",
        "opencv-python-headless",
        # PDF extraction models - install after base packages
        "surya-ocr",  # OCR with layout analysis
        "docling",
    )
    # Add the backend app code into the image LAST
    .add_local_dir("app", remote_path="/root/app")
)

# Create persistent volume for model caching
volume = modal.Volume.from_name("pdf-models-cache", create_if_missing=True)


@app.function(
    image=image,
    gpu="T4",  # Use T4 GPU for model inference
    timeout=600,  # 10 minutes timeout
    volumes={"/cache": volume},
)
@modal.asgi_app()
def fastapi_app():
    """
    Main FastAPI application endpoint
    """
    from app.main import app as fastapi_app
    return fastapi_app


@app.function(
    image=image,
    gpu="T4",
    timeout=600,
    volumes={"/cache": volume},
)
def process_pdf(pdf_bytes: bytes, model_name: str):
    """
    Serverless function for PDF processing
    """
    from app.services.processor import PDFProcessor
    
    processor = PDFProcessor()
    result = processor.process(pdf_bytes, model_name)
    return result


if __name__ == "__main__":
    # For local development
    app.serve()
