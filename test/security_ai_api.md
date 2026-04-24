# Laporan Validasi Keamanan AI API
**Tanggal Validasi:** 24 April 2026
**Target:** AI API Service Project (`/ai_api`)
**Referensi:** `docs/07_SECURITY_DOCUMENT.md`

Berdasarkan pengecekan langsung pada folder `ai_api` (FastAPI/Python) dan pencocokan dengan dokumen `docs/07_SECURITY_DOCUMENT.md`, service AI saat ini **sudah sangat baik dalam hal penanganan file di memori, tetapi memiliki kerentanan signifikan terkait kontrol akses dan sanitasi prompt.**

Berikut adalah rincian hasil validasi keamanan AI API:

## ✅ Yang Sudah Memenuhi Standar (Good)

### 1. Keamanan Data & Privasi (In-Memory Processing)
- **Status:** ✅ Terpenuhi
- **Keterangan:** Sesuai dengan Bagian 4.1 & 4.4 (Tanpa Penyimpanan Disk & DB).
- **Bukti:** Pada `app/main.py`, proses penerimaan file langsung dibaca ke dalam memori (`await file.read()`), lalu diekstrak dan dibuang. File dan teks CV tidak pernah ditulis ke media penyimpanan fisik (disk) maupun disematkan ke database.

### 2. Output Validation (Pertahanan Prompt Injection)
- **Status:** ✅ Terpenuhi
- **Keterangan:** Sesuai dengan Bagian 4.6 (Validasi JSON output dengan Pydantic).
- **Bukti:** Pada `app/analyzer/gemini.py`, respons raw dari LLM dibersihkan dan divalidasi ketat menggunakan schema Pydantic `CVAnalysisResult(**parsed)` sebelum diolah lebih lanjut.

### 3. Kunci & Rahasia Tidak Tersimpan di Git
- **Status:** ✅ Terpenuhi
- **Keterangan:** Sesuai dengan Bagian 4.3 & Checklist 5.
- **Bukti:** Konfigurasi rahasia dibaca via `Settings` (pydantic-settings), dan file `.env` telah secara eksplisit dimasukkan ke dalam file `.gitignore` root repositori sehingga aman dari accidental commit.

---

## ❌ Yang Masih Kurang & Perlu Diperbaiki (Needs Improvement)

### 1. No Auth Bypass / Internal Service Key
- **Status:** ❌ Belum ada
- **Keterangan:** Mengacu pada Bagian 4.2 & Checklist 10.
- **Masalah:** Dokumen menyebutkan AI Service hanya boleh menerima request dengan header `X-Internal-Key` dari backend utama. Namun di `app/main.py`, endpoint `/analyze` dibiarkan terbuka untuk publik tanpa ada otentikasi/middleware validasi header rahasia (CORS bahkan di set ke `allow_origins=["*"]`).

### 2. Sanitasi Teks & Batasan Karakter (Prompt Injection)
- **Status:** ❌ Belum ada
- **Keterangan:** Mengacu pada Bagian 4.6 (Pertahanan Prompt Injection) & Checklist 13.
- **Masalah:** Dokumen mewajibkan adanya sanitasi untuk menghapus karakter kontrol, serta pemotongan batas maksimal 10.000 karakter pada teks CV. Saat ini teks dari parser (PDF/DOCX) langsung dimasukkan ke template prompt di `app/analyzer/prompt.py` tanpa dibersihkan atau dibatasi panjangnya.

### 3. Konfigurasi LLM (Gemini vs OpenAI)
- **Status:** ⚠️ Catatan Ketidaksesuaian
- **Keterangan:** Mengacu pada Threat Model 3.1 & Checklist 3.
- **Masalah:** Dokumen berulang kali menyebutkan perlindungan untuk `GEMINI_API_KEY` dan Gemini LLM. Namun, implementasi `ai_api` saat ini menggunakan *client library* `openai` (`AsyncOpenAI`) dan model OpenAI (`openai_api_key`). Jika memang beralih ke OpenAI, maka `07_SECURITY_DOCUMENT.md` perlu direvisi agar relevan.

### 4. Docker Security (Non-root user)
- **Status:** ❌ Belum dievaluasi (File belum ada)
- **Keterangan:** Mengacu pada Bagian 5 & Checklist 11.
- **Masalah:** Belum terdapat file `Dockerfile` pada `ai_api` untuk menerapkan praktik keamanan container sebagai *non-root user*.

## Rekomendasi Tindakan
Untuk memenuhi status **"Secure Release"** sesuai PRD/Security Document, sangat disarankan untuk melakukan perbaikan di AI API:
1. **Security:** Menambahkan middleware atau FastAPI `Depends` pada endpoint `/analyze` untuk memvalidasi ketersediaan dan kecocokan header `X-Internal-Key` dengan environment variable `INTERNAL_SERVICE_KEY`.
2. **Security:** Menambahkan fungsi sanitasi regex dan pembatasan panjang `text[:10000]` di `app/main.py` sebelum teks dikirimkan ke `analyze_cv_with_gemini`.
3. **Dokumentasi:** Memperbarui `07_SECURITY_DOCUMENT.md` untuk mengganti "Gemini" menjadi "OpenAI", atau sebaliknya mengubah implementasi Python agar benar-benar menggunakan SDK `google-generativeai` (Gemini).
4. **Security:** Mengubah kebijakan CORS di `main.py` menjadi spesifik jika service ini murni hanya akan dipanggil oleh backend Go secara internal.
