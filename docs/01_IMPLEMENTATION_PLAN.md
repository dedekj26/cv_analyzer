# Rencana Implementasi (Implementation Plan)
# CV Analyzer v1.0

---

## 1. Gambaran Umum

Dokumen ini menjabarkan rencana implementasi lengkap untuk CV Analyzer v1.0, dipecah berdasarkan timeline 4 hari kerja (~32 jam) sesuai PRD. Setiap fase memiliki daftar tugas, kriteria selesai, dan dependensi yang jelas.

---

## 2. Prasyarat Sebelum Memulai

| # | Item | Detail |
|---|---|---|
| 1 | Repository GitHub | Buat repo `cv_analyzer` dengan branch `main` dan `develop` |
| 2 | Akses API | Dapatkan Google Gemini API Key dari [Google AI Studio](https://aistudio.google.com) |
| 3 | Environment Lokal | Install Go 1.22+, Python 3.11+, Node.js 20+, SQL Server (atau Docker) |
| 4 | Docker | Install Docker Desktop untuk kontainerisasi lokal |
| 5 | Editor | VS Code dengan ekstensi Go, Python, React |

---

## 3. Struktur Proyek

```
cv_analyzer/
├── backend/                    # Golang API Server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # Entry point
│   ├── internal/
│   │   ├── handler/            # HTTP handlers
│   │   │   ├── analyze.go
│   │   │   ├── report.go
│   │   │   └── health.go
│   │   ├── middleware/         # CORS, rate limit, logging
│   │   │   ├── cors.go
│   │   │   ├── ratelimit.go
│   │   │   └── logger.go
│   │   ├── model/              # Data models
│   │   │   └── analysis.go
│   │   ├── repository/         # Database access
│   │   │   └── analysis_log.go
│   │   ├── service/            # Business logic
│   │   │   ├── ai_client.go    # HTTP client ke Python service
│   │   │   └── report.go       # PDF generation
│   │   └── config/
│   │       └── config.go       # Environment config
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── ai-service/                 # Python AI Service
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── parser/
│   │   │   ├── pdf_parser.py
│   │   │   └── docx_parser.py
│   │   ├── analyzer/
│   │   │   ├── prompt.py       # Prompt engineering
│   │   │   └── gemini.py       # Gemini API client
│   │   └── models/
│   │       └── schemas.py      # Pydantic models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ScoreDisplay.jsx
│   │   │   ├── StrengthsList.jsx
│   │   │   ├── WeaknessesList.jsx
│   │   │   ├── RecommendationsList.jsx
│   │   │   ├── FileDropzone.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios/fetch wrapper
│   │   ├── hooks/
│   │   │   └── useAnalysis.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── migrations/
│       └── 001_initial.sql
├── docker-compose.yml
├── .env.example
├── PRD.md
├── TRD.md
└── docs/
```

---

## 4. Rencana Harian

### Hari 1 — Fondasi Backend

#### Pagi (08:00–12:00): Setup Proyek + Database

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 1.1 | Inisialisasi repo GitHub + branch strategy | Repo dengan `main`, `develop`, `.gitignore` | 30m |
| 1.2 | Setup Go module (`go mod init`) | `go.mod` dengan dependensi awal | 15m |
| 1.3 | Setup Docker Compose (Go + SQL Server + Python) | `docker-compose.yml` berjalan | 45m |
| 1.4 | Buat migration SQL Server | Tabel `AnalysisLogs` + `ApiUsageLogs` siap | 30m |
| 1.5 | Implementasi config loader (env vars) | `config.go` membaca `.env` | 30m |
| 1.6 | Setup middleware (CORS, logger, rate limiter) | Middleware chain berfungsi | 45m |
| 1.7 | Implementasi health check endpoint | `GET /api/v1/health` → 200 OK | 15m |

**Kriteria Selesai:** `docker-compose up` menjalankan Go server + SQL Server, health check merespons.

#### Siang (13:00–17:00): Backend API Core

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 1.8 | Implementasi file upload handler | `POST /api/v1/analyze` menerima file | 60m |
| 1.9 | Validasi file (tipe MIME, ukuran, magic number) | Reject non-PDF/DOCX dan >5MB | 45m |
| 1.10 | Implementasi model & repository layer | CRUD ke `AnalysisLogs` | 45m |
| 1.11 | Implementasi AI client service (HTTP ke Python) | Struct + interface siap | 30m |
| 1.12 | Unit test untuk handler & validation | Coverage minimal 70% | 60m |

**Kriteria Selesai:** Upload endpoint menerima file valid, menolak file invalid, mencatat log ke DB.

**Mapping User Stories:** US-1.1 (AC-1 sampai AC-6), US-1.2 (AC-1 sampai AC-4)

---

### Hari 2 — Layanan AI + Integrasi

#### Pagi (08:00–12:00): Python AI Service

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 2.1 | Setup FastAPI project + Pydantic schemas | `main.py` berjalan di port 8001 | 30m |
| 2.2 | Implementasi PDF parser (PyPDF2) | Ekstrak teks dari PDF di memori | 45m |
| 2.3 | Implementasi DOCX parser (python-docx) | Ekstrak teks dari DOCX di memori | 30m |
| 2.4 | Desain prompt engineering untuk Gemini | Template prompt yang menghasilkan JSON terstruktur | 60m |
| 2.5 | Implementasi Gemini API client | Kirim prompt, terima JSON, validasi skema | 45m |
| 2.6 | Error handling + exponential backoff | Retry logic untuk rate limit / timeout | 30m |

**Kriteria Selesai:** Endpoint Python menerima file buffer, mengembalikan JSON analisis valid.

#### Siang (13:00–17:00): Integrasi BE ↔ AI

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 2.7 | Koneksi Golang → Python via HTTP | Go memanggil Python, menerima respons | 45m |
| 2.8 | Error propagation (Python error → Go → client) | Error messages yang jelas di setiap layer | 30m |
| 2.9 | Logging transaksi ke SQL Server | Setiap analisis tercatat dengan status + timing | 30m |
| 2.10 | API usage logging (token count, cost) | `ApiUsageLogs` terisi dari respons Gemini | 30m |
| 2.11 | Testing end-to-end (upload → analisis → respons) | curl/Postman test suite lengkap | 60m |
| 2.12 | Timeout handling (30 detik maks) | Request dibatalkan jika melebihi batas | 30m |

**Kriteria Selesai:** Full pipeline berfungsi: upload PDF → parse → Gemini → JSON response.

**Mapping User Stories:** US-2.1 (semua AC), US-4.1, US-4.2

---

### Hari 3 — Frontend + Integrasi Full Stack

#### Pagi (08:00–12:00): React UI

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 3.1 | Setup Vite + React + Tailwind CSS | `npm run dev` berjalan | 20m |
| 3.2 | Implementasi LandingPage | Halaman utama dengan CTA "Analisis CV Saya" | 30m |
| 3.3 | Implementasi FileDropzone (drag & drop) | Zona unggah dengan validasi client-side | 45m |
| 3.4 | Implementasi UploadPage | Halaman unggah dengan status feedback | 30m |
| 3.5 | Implementasi ResultsPage | Layout halaman hasil | 30m |
| 3.6 | Implementasi ScoreDisplay | Skor besar + warna + label | 30m |
| 3.7 | Implementasi StrengthsList + WeaknessesList + RecommendationsList | 3 komponen daftar | 45m |

**Kriteria Selesai:** Semua halaman terender dengan data mock, responsif di desktop & mobile.

#### Siang (13:00–17:00): Integrasi FE ↔ BE

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 3.8 | Implementasi API service layer (fetch/axios) | `api.js` dengan fungsi `analyzeCV()` | 30m |
| 3.9 | Implementasi custom hook `useAnalysis` | State management untuk upload + hasil | 30m |
| 3.10 | Koneksi UploadPage → Backend API | Upload file nyata → terima hasil | 45m |
| 3.11 | Loading spinner + progress indicator | Animasi saat menunggu analisis | 20m |
| 3.12 | Error handling di frontend | Tampilkan pesan error inline + tombol "Coba Lagi" | 30m |
| 3.13 | Tombol "Unggah CV Lain" (reset state) | Kembali ke halaman unggah tanpa reload | 20m |
| 3.14 | Setup n8n workflow (opsional) | Workflow automation dasar | 45m |

**Kriteria Selesai:** Full flow berfungsi dari browser: unggah → loading → hasil.

**Mapping User Stories:** US-2.2 sampai US-2.5, US-3.2

---

### Hari 4 — PDF Report + Polish + Deploy

#### Pagi (08:00–12:00): Fitur Tambahan

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 4.1 | Implementasi PDF report generation (server-side) | `POST /api/v1/report/generate` → PDF | 60m |
| 4.2 | Tombol "Unduh Laporan" di frontend | Klik → download PDF | 30m |
| 4.3 | Responsive design testing & fix | Tampilan baik di 320px – 1920px | 45m |
| 4.4 | Aksesibilitas dasar (ARIA labels, keyboard nav) | WCAG 2.1 AA untuk alur utama | 30m |
| 4.5 | Edge case handling | File kosong, file corrupt, teks terlalu pendek | 45m |

**Mapping User Stories:** US-3.1

#### Siang (13:00–17:00): QA + Deploy

| # | Tugas | Output | Durasi |
|---|---|---|---|
| 4.6 | Testing end-to-end (manual + automated) | Semua happy path + error path teruji | 60m |
| 4.7 | Performance check (target <30 detik) | Semua analisis selesai dalam batas waktu | 30m |
| 4.8 | Build Docker images (production) | 3 image siap deploy | 30m |
| 4.9 | Deploy ke staging / production | Aplikasi live dan dapat diakses | 45m |
| 4.10 | Smoke test di production | Verifikasi semua endpoint berfungsi | 15m |
| 4.11 | Final review + dokumentasi | README.md updated, docs lengkap | 30m |

**Kriteria Selesai:** Aplikasi v1.0 live, semua fitur berfungsi, semua user stories terpenuhi.

---

## 5. Matriks Ketergantungan

```
Hari 1 (Backend)  →  Hari 2 (AI Service)  →  Hari 3 (Frontend)  →  Hari 4 (Polish)
     ↓                     ↓                       ↓
  SQL Server          Gemini API             Backend API
  Docker Compose      Python Service         AI Service
```

| Tugas | Bergantung Pada |
|---|---|
| AI Service (Hari 2) | Gemini API Key tersedia |
| Integrasi BE↔AI (Hari 2 siang) | Backend API (Hari 1) + AI Service (Hari 2 pagi) |
| Frontend integrasi (Hari 3 siang) | Backend API selesai (Hari 1-2) |
| PDF Report (Hari 4) | Analisis pipeline selesai (Hari 1-3) |

---

## 6. Checklist User Story Coverage

| User Story | Hari | Status |
|---|---|---|
| US-1.1: Unggah File CV | Hari 1 | ⬜ |
| US-1.2: Validasi File | Hari 1 | ⬜ |
| US-2.1: Analisis Konten CV | Hari 2 | ⬜ |
| US-2.2: Skor Keseluruhan | Hari 3 | ⬜ |
| US-2.3: Kekuatan | Hari 3 | ⬜ |
| US-2.4: Kelemahan | Hari 3 | ⬜ |
| US-2.5: Rekomendasi | Hari 3 | ⬜ |
| US-3.1: Unduh Laporan | Hari 4 | ⬜ |
| US-3.2: Analisis CV Lain | Hari 3 | ⬜ |
| US-4.1: Kegagalan Analisis | Hari 2-3 | ⬜ |
| US-4.2: Masalah Jaringan | Hari 2-3 | ⬜ |

---

*Akhir Dokumen*
