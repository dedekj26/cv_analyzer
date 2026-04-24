"""
CV Analyzer AI Service — FastAPI Entry Point.
"""

import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.models.schemas import Settings, AnalyzeResponse, HealthResponse
from app.parser.pdf_parser import extract_text_from_pdf
from app.parser.docx_parser import extract_text_from_docx
from app.analyzer.gemini import analyze_cv_with_gemini

settings = Settings()

app = FastAPI(
    title="CV Analyzer AI Service",
    description="Layanan AI untuk menganalisis CV menggunakan OpenAI ChatGPT",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"AI Service dimulai | Model: {settings.openai_model} | Env: {settings.app_env}")

PDF_MAGIC = b"%PDF"
DOCX_MAGIC = b"PK\x03\x04"


def detect_file_type(file_bytes: bytes) -> str:
    """Deteksi tipe file berdasarkan magic number."""
    if file_bytes[:4] == PDF_MAGIC:
        return "pdf"
    elif file_bytes[:4] == DOCX_MAGIC:
        return "docx"
    else:
        raise ValueError("Format file tidak didukung. Silakan unggah file PDF atau DOCX.")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Memeriksa kesehatan layanan AI."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        service="ai-service",
        openai_model=settings.openai_model,
        environment=settings.app_env,
    )


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_cv(file: UploadFile = File(...)):
    """Menerima file CV, ekstrak teks, analisis dengan Gemini."""
    total_start = time.time()

    # 1. Baca file
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail={"code": "FILE_READ_ERROR", "message": "Gagal membaca file."})

    # 2. Validasi kosong
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail={"code": "EMPTY_FILE", "message": "File kosong."})

    # 3. Validasi ukuran
    max_size = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(status_code=413, detail={"code": "FILE_TOO_LARGE", "message": f"File melebihi {settings.max_file_size_mb} MB."})

    # 4. Validasi tipe (magic number)
    try:
        file_type = detect_file_type(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=415, detail={"code": "INVALID_FILE_TYPE", "message": str(e)})

    logger.info(f"File: {file.filename} | Tipe: {file_type} | Ukuran: {len(file_bytes)/1024:.1f} KB")

    # 5. Ekstrak teks
    try:
        cv_text = extract_text_from_pdf(file_bytes) if file_type == "pdf" else extract_text_from_docx(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "UNREADABLE_FILE", "message": str(e)})

    logger.info(f"Teks diekstrak: {len(cv_text)} karakter")

    # 6. Analisis Gemini
    try:
        result = await analyze_cv_with_gemini(cv_text)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail={"code": "AI_SERVICE_ERROR", "message": str(e)})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail={"code": "INTERNAL_ERROR", "message": "Kesalahan internal."})

    total_elapsed = int((time.time() - total_start) * 1000)
    logger.info(f"Total waktu: {total_elapsed}ms")

    return AnalyzeResponse(**result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.app_port, reload=True)
