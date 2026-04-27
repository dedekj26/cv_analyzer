# 📄 CV Analyzer

Aplikasi analisis CV berbasis AI dengan arsitektur **microservices** yang terdiri dari tiga layanan utama:

| Layanan | Teknologi | Port |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | `5173` |
| **API Gateway** | Go (Fiber) | `3000` |
| **AI Service** | Python (FastAPI) | `8001` |
| **Database** | SQL Server (MSSQL) | `1433` |

---

## 🧰 Prasyarat

Pastikan sudah terinstall di lokal masing-masing:

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **Go** v1.24+ → [go.dev](https://go.dev/dl/)
- **Python** 3.10+ → [python.org](https://www.python.org/downloads/)
- **SQL Server** (Express / Developer) → [microsoft.com](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git**

---

## 🚀 Setup Awal

### 1. Clone Repository

```bash
git clone <repo-url>
cd cv_analyzer
```

---

## 🐍 AI Service (Python FastAPI)

### Masuk ke folder

```bash
cd ai_api
```

### Buat virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Setup environment

Salin file `.env.example` menjadi `.env`:

```bash
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux
```

Lalu edit `.env` dan isi nilai berikut:

```env
OPENAI_API_KEY=sk-...       # API Key dari OpenAI (atau Gemini key jika pakai Gemini)
OPENAI_MODEL=gpt-4o
APP_PORT=8001
APP_ENV=development
MAX_FILE_SIZE_MB=5
MAX_RETRIES=3
REQUEST_TIMEOUT=30
```

> ⚠️ **Penting:** Jangan commit file `.env` ke repository. Pastikan `.env` sudah ada di `.gitignore`.

### Jalankan server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Cek status: `http://localhost:8001/health`  
Dokumentasi API: `http://localhost:8001/docs`

---

## 🗄️ Database (SQL Server)

### Buat database

Buka **SQL Server Management Studio (SSMS)** atau tool sejenisnya, lalu jalankan:

```sql
CREATE DATABASE cv_optima;
```

> Nama database harus `cv_optima` sesuai dengan konfigurasi default di `.env`.

### Pilih metode autentikasi

**Opsi A — Windows Authentication (direkomendasikan untuk lokal):**

Di `.env` backend, kosongkan `DB_USERNAME` dan `DB_PASSWORD`:

```env
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=cv_optima
DB_USERNAME=
DB_PASSWORD=
```

**Opsi B — SQL Server Authentication:**

```env
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=cv_optima
DB_USERNAME=sa
DB_PASSWORD=YourPassword123
```

> Jika menggunakan named instance (misalnya `SQLEXPRESS`), isi `DB_HOST` seperti ini:
> ```
> DB_HOST=localhost\SQLEXPRESS
> ```

---

## ⚙️ API Gateway (Go Fiber)

### Masuk ke folder

```bash
cd backend/api-gateway
```

### Setup environment

Buat file `.env` di folder ini (atau edit jika sudah ada):

```env
PORT=3000

# Sesuaikan dengan konfigurasi SQL Server lokal kamu
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=cv_optima
DB_USERNAME=
DB_PASSWORD=

# URL AI Service (sesuai port yang dijalankan)
PYTHON_SERVICE_URL=http://localhost:8001
```

### Install dependencies & jalankan

```bash
go mod tidy
go run main.go
```

Cek status: `http://localhost:3000/api/v1/health`  
Dokumentasi API (Swagger): `http://localhost:3000/swagger/`

---

## 🌐 Frontend (React + Vite)

### Masuk ke folder

```bash
cd frontend
```

### Install dependencies

```bash
npm install
```

### Setup environment

Buat file `.env` di folder `frontend/` jika belum ada:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Jalankan dev server

```bash
npm run dev
```

Akses di browser: `http://localhost:5173`

---

## ✅ Urutan Menjalankan Semua Layanan

Jalankan **sesuai urutan** berikut (buka terminal berbeda untuk setiap layanan):

```
1. SQL Server        → pastikan sudah running (via Services atau SSMS)
2. AI Service        → cd ai_api && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
3. API Gateway       → cd backend/api-gateway && go run main.go
4. Frontend          → cd frontend && npm run dev
```

---

## 🗂️ Struktur Project

```
cv_analyzer/
├── ai_api/                  # Python AI Service (FastAPI)
│   ├── app/
│   │   ├── analyzer/        # Logika analisis AI (Gemini/OpenAI)
│   │   ├── parser/          # Parser PDF & DOCX
│   │   ├── models/          # Skema Pydantic
│   │   └── main.py          # Entry point FastAPI
│   ├── requirements.txt
│   └── .env.example
│
├── backend/
│   └── api-gateway/         # Go API Gateway (Fiber)
│       ├── database/        # Koneksi & migrasi SQL Server
│       ├── handlers/        # Handler HTTP
│       ├── models/          # Model data
│       ├── repository/      # Query database
│       └── main.go
│
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   └── package.json
│
├── docs/                    # Dokumentasi tambahan
├── PRD.md                   # Product Requirements Document
└── TRD.md                   # Technical Requirements Document
```

---

## 🔍 Troubleshooting

### AI Service gagal start
- Pastikan virtual environment sudah diaktifkan sebelum `pip install`
- Pastikan `OPENAI_API_KEY` sudah diisi di `.env`

### API Gateway gagal koneksi ke database
- Pastikan SQL Server sudah running
- Jika pakai Windows Auth, jalankan `go run main.go` dari user yang sama dengan SQL Server
- Jika pakai named instance (`SQLEXPRESS`), pastikan `DB_HOST=localhost\SQLEXPRESS`

### Frontend tidak bisa hit API
- Pastikan `VITE_API_BASE_URL` di `.env` frontend mengarah ke `http://localhost:3000`
- Pastikan API Gateway sudah running

### Port konflik
Jika port sudah dipakai, ubah sesuai kebutuhan:
- AI Service: ubah `APP_PORT` di `ai_api/.env` dan `PYTHON_SERVICE_URL` di `backend/api-gateway/.env`
- API Gateway: ubah `PORT` di `backend/api-gateway/.env` dan `VITE_API_BASE_URL` di `frontend/.env`
- Frontend: `npm run dev -- --port 3001` (misalnya)

---

## 📬 Kontak

Jika ada kendala setup, hubungi maintainer project atau buka issue di repository.
