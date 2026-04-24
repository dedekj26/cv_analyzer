"""
Pydantic schemas untuk input/output AI Service.
Mendefinisikan struktur data yang digunakan di seluruh layanan.
"""

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Optional


# ============================================================
# Konfigurasi Aplikasi (dari .env)
# ============================================================

class Settings(BaseSettings):
    """Konfigurasi aplikasi yang dibaca dari environment variables / .env"""
    openai_api_key: str = Field(..., description="OpenAI API Key")
    openai_model: str = Field(default="gpt-4o", description="Model OpenAI yang digunakan")
    app_port: int = Field(default=8001, description="Port aplikasi")
    app_env: str = Field(default="development", description="Environment (development/production)")
    max_file_size_mb: int = Field(default=5, description="Ukuran file maksimal dalam MB")
    max_retries: int = Field(default=3, description="Jumlah retry maksimal untuk OpenAI API")
    request_timeout: int = Field(default=30, description="Timeout request dalam detik")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# ============================================================
# Schema Respons Analisis CV
# ============================================================

class CVAnalysisResult(BaseModel):
    """Hasil analisis CV dari OpenAI API"""
    score: int = Field(..., ge=0, le=100, description="Skor kualitas CV (0-100)")
    label: str = Field(..., description="Label kategori: Perlu Perbaikan/Cukup/Bagus/Luar Biasa")
    strengths: list[str] = Field(..., min_length=1, max_length=10, description="Daftar kekuatan CV")
    weaknesses: list[str] = Field(..., min_length=1, max_length=10, description="Daftar kelemahan CV")
    recommendations: list[str] = Field(..., min_length=1, max_length=10, description="Daftar rekomendasi perbaikan")


class APIUsageMetadata(BaseModel):
    """Metadata penggunaan API OpenAI"""
    model: str = Field(..., description="Model OpenAI yang digunakan")
    prompt_tokens: Optional[int] = Field(default=None, description="Jumlah token prompt")
    completion_tokens: Optional[int] = Field(default=None, description="Jumlah token completion")
    total_tokens: Optional[int] = Field(default=None, description="Total token yang digunakan")
    processing_time_ms: int = Field(..., description="Waktu pemrosesan dalam milidetik")


class AnalyzeResponse(BaseModel):
    """Respons lengkap dari endpoint /analyze"""
    score: int
    label: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    metadata: APIUsageMetadata


class HealthResponse(BaseModel):
    """Respons dari endpoint /health"""
    status: str = "ok"
    version: str = "1.0.0"
    service: str = "ai-service"
    openai_model: str
    environment: str


class ErrorResponse(BaseModel):
    """Respons error standar"""
    status: str = "error"
    error: dict = Field(..., description="Detail error dengan code dan message")
