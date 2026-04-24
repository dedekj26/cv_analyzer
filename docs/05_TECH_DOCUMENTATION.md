# Dokumentasi Teknis Lengkap (Technical Documentation)
# CV Analyzer v1.0

---

## 1. Gambaran Sistem

CV Analyzer adalah aplikasi web 3-tier yang terdiri dari:

| Layer | Teknologi | Port | Fungsi |
|---|---|---|---|
| Frontend | React + Vite + Tailwind | 3000 | Antarmuka pengguna |
| Backend API | Golang (Gin) | 8080 | Orkestrasi, validasi, logging |
| AI Service | Python (FastAPI) | 8001 | Parsing dokumen, analisis AI |
| Database | SQL Server | 1433 | Logging & analitik |
| External | Gemini Flash API | — | Model bahasa untuk evaluasi CV |

---

## 2. Panduan Menjalankan Lokal

### 2.1. Prasyarat

- Go 1.22+
- Python 3.11+
- Node.js 20+
- Docker Desktop
- Google Gemini API Key

### 2.2. Clone & Setup

```bash
git clone https://github.com/dedekj26/cv_analyzer.git
cd cv_analyzer
cp .env.example .env
# Edit .env dan masukkan GEMINI_API_KEY
```

### 2.3. Jalankan dengan Docker Compose

```bash
docker-compose up --build
```

Akses:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1/health
- AI Service: http://localhost:8001/health

### 2.4. Jalankan Manual (Development)

```bash
# Terminal 1 — SQL Server
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest

# Terminal 2 — Backend
cd backend && go run cmd/server/main.go

# Terminal 3 — AI Service
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --port 8001

# Terminal 4 — Frontend
cd frontend && npm install && npm run dev
```

---

## 3. Konvensi Kode

### 3.1. Golang

| Aspek | Konvensi |
|---|---|
| Penamaan | camelCase (internal), PascalCase (exported) |
| Error handling | Selalu return error, jangan panic |
| Logging | `zerolog` dengan structured JSON |
| Testing | File `_test.go` di setiap package |
| Linting | `golangci-lint` |

### 3.2. Python

| Aspek | Konvensi |
|---|---|
| Penamaan | snake_case untuk fungsi/variabel, PascalCase untuk class |
| Type hints | Wajib pada semua parameter dan return |
| Validasi | Pydantic models untuk semua I/O |
| Linting | `ruff` + `mypy` |

### 3.3. React

| Aspek | Konvensi |
|---|---|
| Komponen | Functional components + hooks (tidak ada class components) |
| Penamaan file | PascalCase.jsx untuk komponen |
| State | Custom hooks untuk logic, Context untuk global state |
| Styling | Tailwind CSS utility classes |

---

## 4. Alur Data End-to-End

```
PENGGUNA                FRONTEND              BACKEND (Go)           AI SERVICE (Py)        GEMINI API
   |                       |                      |                       |                      |
   |-- Pilih file -------->|                      |                       |                      |
   |                       |-- Validasi lokal --->|                       |                      |
   |                       |   (tipe, ukuran)     |                       |                      |
   |                       |                      |                       |                      |
   |                       |-- POST /analyze ---->|                       |                      |
   |                       |   (multipart/form)   |                       |                      |
   |                       |                      |-- Validasi server -->|                       |
   |                       |                      |   (MIME, magic num)   |                       |
   |                       |                      |                       |                      |
   |                       |                      |-- POST /analyze ----->|                      |
   |                       |                      |   (forward file)      |                      |
   |                       |                      |                       |-- Ekstrak teks       |
   |                       |                      |                       |   (PyPDF2/docx)      |
   |                       |                      |                       |                      |
   |                       |                      |                       |-- generate_content ->|
   |                       |                      |                       |   (prompt + teks CV) |
   |                       |                      |                       |                      |
   |                       |                      |                       |<-- JSON result ------|
   |                       |                      |                       |                      |
   |                       |                      |<-- JSON result -------|                      |
   |                       |                      |                       |                      |
   |                       |                      |-- Log ke SQL Server  |                      |
   |                       |                      |   (async, goroutine)  |                      |
   |                       |                      |                       |                      |
   |                       |<-- JSON response ----|                       |                      |
   |                       |                      |                       |                      |
   |<-- Tampilkan hasil ---|                      |                       |                      |
   |                       |                      |                       |                      |
```

---

## 5. Penanganan Error

### 5.1. Error Flow

| Sumber Error | Ditangani Di | Aksi |
|---|---|---|
| File tipe salah | FE (validasi) + BE (validasi) | Pesan inline, tidak kirim ke server |
| File terlalu besar | FE (validasi) + BE (validasi) | Pesan inline sebelum upload |
| File kosong/corrupt | BE → Python parser | Return 400 + pesan spesifik |
| Gemini API error | Python service | Retry 3x dengan exponential backoff |
| Gemini rate limit | Python service | Retry setelah delay, max 3x |
| Timeout (>30 detik) | Go context.WithTimeout | Return 504 + pesan timeout |
| SQL Server down | Go repository | Log ke stderr, jangan gagalkan analisis |
| Network error (FE) | Axios interceptor | Pesan "Periksa koneksi internet" |

### 5.2. Retry Strategy (Python → Gemini)

```python
import time

MAX_RETRIES = 3
BASE_DELAY = 1  # detik

for attempt in range(MAX_RETRIES):
    try:
        result = model.generate_content(prompt)
        break
    except Exception as e:
        if attempt == MAX_RETRIES - 1:
            raise
        delay = BASE_DELAY * (2 ** attempt)  # 1s, 2s, 4s
        time.sleep(delay)
```

---

## 6. Keamanan

### 6.1. Validasi File (Magic Number)

```go
// Verifikasi magic number, bukan hanya Content-Type header
var (
    pdfMagic  = []byte{0x25, 0x50, 0x44, 0x46} // %PDF
    docxMagic = []byte{0x50, 0x4B, 0x03, 0x04} // PK (ZIP)
)

func validateMagicNumber(data []byte) (string, bool) {
    if bytes.HasPrefix(data, pdfMagic) {
        return "pdf", true
    }
    if bytes.HasPrefix(data, docxMagic) {
        return "docx", true
    }
    return "", false
}
```

### 6.2. Rate Limiting

```go
// Menggunakan golang.org/x/time/rate
limiter := rate.NewLimiter(rate.Every(6*time.Second), 1) // ~10 req/menit
```

### 6.3. CORS

```go
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}
```

---

## 7. Testing

### 7.1. Backend (Go)

```bash
cd backend
go test ./... -v -cover
```

| Tipe Test | Cakupan |
|---|---|
| Unit Test | Handler validation, model parsing, repository mocks |
| Integration Test | Full HTTP request/response cycle |
| Target Coverage | Minimal 70% |

### 7.2. AI Service (Python)

```bash
cd ai-service
pytest tests/ -v --cov=app
```

| Tipe Test | Cakupan |
|---|---|
| Unit Test | Parser (PDF/DOCX), prompt builder, schema validation |
| Mock Test | Gemini API response mocking |

### 7.3. Frontend (React)

```bash
cd frontend
npm test
```

---

## 8. Deployment

### 8.1. Build Docker Images

```bash
# Backend
docker build -t cv-analyzer-backend ./backend

# AI Service
docker build -t cv-analyzer-ai ./ai-service

# Frontend
docker build -t cv-analyzer-frontend ./frontend
```

### 8.2. Environment Production

```env
APP_ENV=production
APP_PORT=8080
DB_HOST=<managed-sql-server-host>
AI_SERVICE_URL=http://ai-service:8001
GEMINI_API_KEY=<production-key>
INTERNAL_SERVICE_KEY=<generated-uuid>
```

### 8.3. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Go tests
        run: cd backend && go test ./...
      - name: Python tests
        run: cd ai-service && pip install -r requirements.txt && pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & push images
        run: |
          docker build -t cv-analyzer-backend ./backend
          docker build -t cv-analyzer-ai ./ai-service
      - name: Deploy to Cloud Run
        run: echo "Deploy commands here"
```

---

## 9. Monitoring

### Metrik yang Dikumpulkan

| Metrik | Sumber | Alert Threshold |
|---|---|---|
| Request latency (p95) | Golang middleware | > 10 detik |
| Error rate | Golang middleware | > 5% dalam 5 menit |
| Gemini API latency | Python service | > 20 detik |
| Gemini API errors | Python service | > 3 errors dalam 5 menit |
| DB connection pool | Golang repository | < 2 available connections |
| Memory usage | Docker stats | > 80% limit |

### Health Check Monitoring

```bash
# Cron job setiap 5 menit
curl -sf http://localhost:8080/api/v1/health || echo "ALERT: Backend down"
curl -sf http://localhost:8001/health || echo "ALERT: AI Service down"
```

---

## 10. Daftar Dokumen Terkait

| # | Dokumen | Lokasi | Deskripsi |
|---|---|---|---|
| 1 | PRD | `PRD.md` | Kebutuhan produk dan user stories |
| 2 | TRD | `TRD.md` | Arsitektur teknis dan infrastruktur |
| 3 | Rencana Implementasi | `docs/01_IMPLEMENTATION_PLAN.md` | Breakdown tugas 4 hari |
| 4 | Dokumentasi API | `docs/02_API_DOCUMENTATION.md` | Spesifikasi semua endpoint |
| 5 | Integrasi Backend | `docs/03_BE_INTEGRATION.md` | Golang + Python + SQL Server |
| 6 | Integrasi Frontend | `docs/04_FE_INTEGRATION.md` | React + API integration |
| 7 | Dokumentasi Teknis | `docs/05_TECH_DOCUMENTATION.md` | Dokumen ini |
| 8 | QA Test Plan | `docs/06_QA_TEST_PLAN.md` | 61 test case, traceability matrix |
| 9 | Dokumen Keamanan | `docs/07_SECURITY_DOCUMENT.md` | Threat model, kontrol keamanan, checklist |
| 10 | UI/UX Document | `docs/08_UI_UX_DOCUMENT.md` | Design system, wireframes, aksesibilitas |

---

*Akhir Dokumen*
