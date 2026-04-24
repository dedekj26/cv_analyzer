# Dokumen Integrasi Backend (BE Integration Document)
# CV Analyzer v1.0

---

## 1. Arsitektur Backend

Backend terdiri dari dua layanan yang berkomunikasi via HTTP internal:

```
[Client Browser] → [Golang API :8080] → [Python AI Service :8001] → [Gemini API]
                         ↓
                   [SQL Server :1433]
```

---

## 2. Golang API Server

### 2.1. Dependensi (go.mod)

```go
module github.com/dedekj26/cv_analyzer/backend

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/google/uuid v1.6.0
    github.com/joho/godotenv v1.5.1
    github.com/rs/zerolog v1.32.0
    github.com/jung-kurt/gofpdf v1.16.2
    github.com/denisenkom/go-mssqldb v0.12.3
    golang.org/x/time v0.5.0          // rate limiter
)
```

### 2.2. Konfigurasi Environment

```env
# .env.example
APP_PORT=8080
APP_ENV=development

# Database
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_NAME=cv_analyzer

# AI Service
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_TIMEOUT=30s
INTERNAL_SERVICE_KEY=your-internal-key

# Rate Limiting
RATE_LIMIT_RPM=10
```

### 2.3. Model Data

```go
// internal/model/analysis.go

package model

import (
    "time"
    "github.com/google/uuid"
)

type AnalysisRequest struct {
    File []byte `json:"file"`
}

type AnalysisResponse struct {
    Status          string       `json:"status"`
    Data            *AnalysisData `json:"data,omitempty"`
    Error           *ErrorDetail  `json:"error,omitempty"`
    ProcessingTimeMs int64       `json:"processing_time_ms"`
}

type AnalysisData struct {
    Score           int      `json:"score"`
    Label           string   `json:"label"`
    Strengths       []string `json:"strengths"`
    Weaknesses      []string `json:"weaknesses"`
    Recommendations []string `json:"recommendations"`
}

type ErrorDetail struct {
    Code    string `json:"code"`
    Message string `json:"message"`
}

type AnalysisLog struct {
    LogID           uuid.UUID `db:"LogID"`
    Timestamp       time.Time `db:"Timestamp"`
    FileSizeKB      int       `db:"FileSizeKB"`
    FileType        string    `db:"FileType"`
    ProcessingTimeMs int      `db:"ProcessingTimeMs"`
    OverallScore    *int      `db:"OverallScore"`
    Status          string    `db:"Status"`
    ErrorMessage    *string   `db:"ErrorMessage"`
}

type ApiUsageLog struct {
    LogID           uuid.UUID `db:"LogID"`
    AnalysisLogID   uuid.UUID `db:"AnalysisLogID"`
    Model           string    `db:"Model"`
    PromptTokens    int       `db:"PromptTokens"`
    CompletionTokens int     `db:"CompletionTokens"`
    TotalTokens     int       `db:"TotalTokens"`
    CostUSD         float64   `db:"CostUSD"`
}
```

### 2.4. Handler — Analisis CV

```go
// internal/handler/analyze.go

package handler

import (
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
)

const (
    MaxFileSize    = 5 << 20 // 5 MB
    AllowedPDF     = "application/pdf"
    AllowedDOCX    = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)

func (h *Handler) AnalyzeCV(c *gin.Context) {
    start := time.Now()

    // 1. Ambil file dari request
    file, header, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, errorResponse("FILE_REQUIRED", "File CV wajib diunggah."))
        return
    }
    defer file.Close()

    // 2. Validasi ukuran
    if header.Size > MaxFileSize {
        c.JSON(http.StatusRequestEntityTooLarge, errorResponse("FILE_TOO_LARGE",
            "Ukuran file melebihi batas maksimal 5 MB."))
        return
    }

    // 3. Validasi tipe MIME
    contentType := header.Header.Get("Content-Type")
    if contentType != AllowedPDF && contentType != AllowedDOCX {
        c.JSON(http.StatusUnsupportedMediaType, errorResponse("INVALID_FILE_TYPE",
            "Silakan unggah file dalam format PDF atau DOCX."))
        return
    }

    // 4. Baca file ke buffer (tanpa tulis ke disk)
    buf := new(bytes.Buffer)
    if _, err := io.Copy(buf, file); err != nil {
        c.JSON(http.StatusInternalServerError, errorResponse("INTERNAL_ERROR",
            "Gagal membaca file."))
        return
    }

    // 5. Kirim ke AI Service
    result, metadata, err := h.aiClient.Analyze(c.Request.Context(), buf.Bytes(), contentType)
    if err != nil {
        // Log error, return user-friendly message
        h.handleAIError(c, err)
        return
    }

    // 6. Catat ke database
    elapsed := time.Since(start).Milliseconds()
    go h.repo.LogAnalysis(/* ... */)
    go h.repo.LogApiUsage(/* ... */)

    // 7. Kirim respons
    c.JSON(http.StatusOK, gin.H{
        "status":            "success",
        "data":              result,
        "processing_time_ms": elapsed,
    })
}
```

### 2.5. Handler — Generate Report PDF

```go
// internal/handler/report.go

func (h *Handler) GenerateReport(c *gin.Context) {
    var data model.AnalysisData
    if err := c.ShouldBindJSON(&data); err != nil {
        c.JSON(http.StatusBadRequest, errorResponse("INVALID_JSON", "Format data tidak valid."))
        return
    }

    // Validasi
    if data.Score < 0 || data.Score > 100 {
        c.JSON(http.StatusBadRequest, errorResponse("INVALID_SCORE",
            "Skor harus berupa angka antara 0-100."))
        return
    }

    // Generate PDF
    pdfBytes, err := h.reportService.GeneratePDF(&data)
    if err != nil {
        c.JSON(http.StatusInternalServerError, errorResponse("INTERNAL_ERROR",
            "Gagal membuat laporan PDF."))
        return
    }

    filename := fmt.Sprintf("Laporan_Analisis_CV_%s.pdf", time.Now().Format("2006-01-02"))
    c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
    c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
```

### 2.6. Router Setup

```go
// cmd/server/main.go

func setupRouter(h *handler.Handler, mw *middleware.Middleware) *gin.Engine {
    r := gin.New()
    r.Use(mw.Logger())
    r.Use(mw.CORS())
    r.Use(mw.RateLimit())

    v1 := r.Group("/api/v1")
    {
        v1.GET("/health", h.HealthCheck)
        v1.POST("/analyze", h.AnalyzeCV)
        v1.POST("/report/generate", h.GenerateReport)
    }

    return r
}
```

### 2.7. AI Client Service

```go
// internal/service/ai_client.go

type AIClient struct {
    baseURL    string
    httpClient *http.Client
    internalKey string
}

func (c *AIClient) Analyze(ctx context.Context, fileData []byte, contentType string) (*model.AnalysisData, *model.AIMetadata, error) {
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()

    // Buat multipart request
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("file", "upload")
    part.Write(fileData)
    writer.Close()

    req, _ := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/analyze", body)
    req.Header.Set("Content-Type", writer.FormDataContentType())
    req.Header.Set("X-Internal-Key", c.internalKey)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        if ctx.Err() == context.DeadlineExceeded {
            return nil, nil, ErrTimeout
        }
        return nil, nil, fmt.Errorf("ai service unavailable: %w", err)
    }
    defer resp.Body.Close()

    var result struct {
        model.AnalysisData
        Metadata model.AIMetadata `json:"metadata"`
    }
    json.NewDecoder(resp.Body).Decode(&result)

    return &result.AnalysisData, &result.Metadata, nil
}
```

---

## 3. Python AI Service

### 3.1. Dependensi (requirements.txt)

```
fastapi==0.110.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
PyPDF2==3.0.1
python-docx==1.1.0
google-generativeai==0.5.0
pydantic==2.6.0
```

### 3.2. Skema Data (Pydantic)

```python
# app/models/schemas.py

from pydantic import BaseModel, Field

class AnalysisResult(BaseModel):
    score: int = Field(ge=0, le=100)
    label: str
    strengths: list[str] = Field(min_length=3, max_length=7)
    weaknesses: list[str] = Field(min_length=3, max_length=7)
    recommendations: list[str] = Field(min_length=3, max_length=7)

class AIMetadata(BaseModel):
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    processing_time_ms: int

class FullResponse(BaseModel):
    score: int
    label: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    metadata: AIMetadata
```

### 3.3. Document Parser

```python
# app/parser/pdf_parser.py

import io
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Ekstrak teks dari PDF di memori tanpa tulis ke disk."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()
```

```python
# app/parser/docx_parser.py

import io
from docx import Document

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Ekstrak teks dari DOCX di memori tanpa tulis ke disk."""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)
```

### 3.4. Prompt Engineering

```python
# app/analyzer/prompt.py

ANALYSIS_PROMPT = """Kamu adalah konsultan karier profesional yang ahli dalam meninjau CV/Resume.

Analisis CV berikut dan berikan evaluasi dalam format JSON yang tepat.

ATURAN:
1. Score: berikan skor 0-100 berdasarkan kualitas keseluruhan
2. Label: "Perlu Perbaikan" (0-39), "Cukup" (40-59), "Bagus" (60-79), "Luar Biasa" (80-100)
3. Strengths: identifikasi 3-7 kekuatan SPESIFIK (bukan saran umum)
4. Weaknesses: identifikasi 3-7 kelemahan SPESIFIK dengan merujuk bagian CV
5. Recommendations: berikan 3-7 rekomendasi ACTIONABLE, urutkan dari dampak tertinggi

Berikan respons HANYA dalam format JSON berikut, tanpa teks tambahan:
{
  "score": <integer 0-100>,
  "label": "<string>",
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "recommendations": ["<string>", ...]
}

CV YANG DIANALISIS:
---
{cv_text}
---
"""
```

### 3.5. Gemini Client

```python
# app/analyzer/gemini.py

import google.generativeai as genai
import json, time

class GeminiAnalyzer:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def analyze(self, cv_text: str) -> dict:
        prompt = ANALYSIS_PROMPT.format(cv_text=cv_text)

        start = time.time()
        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,
            )
        )
        elapsed_ms = int((time.time() - start) * 1000)

        result = json.loads(response.text)

        # Tambahkan metadata
        result["metadata"] = {
            "model": "gemini-1.5-flash",
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "completion_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count,
            "processing_time_ms": elapsed_ms
        }

        return result
```

### 3.6. FastAPI Main

```python
# app/main.py

from fastapi import FastAPI, UploadFile, File, Header, HTTPException
import os

app = FastAPI(title="CV Analyzer AI Service", version="1.0.0")
analyzer = GeminiAnalyzer(api_key=os.getenv("GEMINI_API_KEY"))
INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY")

@app.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    x_internal_key: str = Header(...)
):
    # Validasi internal key
    if x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Baca file ke memori
    file_bytes = await file.read()

    # Deteksi tipe dan ekstrak teks
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(file_bytes)
    else:
        text = extract_text_from_docx(file_bytes)

    if not text or len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="File tidak mengandung teks yang cukup.")

    # Analisis dengan Gemini
    result = analyzer.analyze(text)
    return result

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## 4. Integrasi Database (SQL Server)

### 4.1. Connection String

```
sqlserver://sa:YourStrong!Passw0rd@localhost:1433?database=cv_analyzer
```

### 4.2. Repository Pattern

```go
// internal/repository/analysis_log.go

func (r *Repository) LogAnalysis(log *model.AnalysisLog) error {
    query := `INSERT INTO AnalysisLogs
        (LogID, FileSizeKB, FileType, ProcessingTimeMs, OverallScore, Status, ErrorMessage)
        VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)`

    _, err := r.db.Exec(query,
        log.LogID, log.FileSizeKB, log.FileType,
        log.ProcessingTimeMs, log.OverallScore,
        log.Status, log.ErrorMessage)
    return err
}
```

---

## 5. Docker Compose

```yaml
# docker-compose.yml

version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - APP_PORT=8080
      - DB_HOST=sqlserver
      - DB_PORT=1433
      - AI_SERVICE_URL=http://ai-service:8001
    depends_on:
      - sqlserver
      - ai-service

  ai-service:
    build: ./ai-service
    ports:
      - "8001:8001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - INTERNAL_SERVICE_KEY=${INTERNAL_SERVICE_KEY}

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    ports:
      - "1433:1433"
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong!Passw0rd
    volumes:
      - sqlserver_data:/var/opt/mssql

volumes:
  sqlserver_data:
```

---

*Akhir Dokumen*
