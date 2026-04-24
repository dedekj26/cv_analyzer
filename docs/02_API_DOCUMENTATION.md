# Dokumentasi API (API Documentation)
# CV Analyzer v1.0

---

## 1. Informasi Umum

| Item | Detail |
|---|---|
| Base URL | `https://api.cvanalyzer.id/api/v1` (production) |
| Base URL (lokal) | `http://localhost:8080/api/v1` |
| Format Respons | JSON |
| Autentikasi | Tidak diperlukan (v1.0) |
| Rate Limit | 10 request per menit per IP |
| Ukuran File Maks | 5 MB |
| Format File | PDF, DOCX |

---

## 2. Kode Status HTTP

| Kode | Deskripsi | Kapan Digunakan |
|---|---|---|
| `200` | OK | Request berhasil diproses |
| `400` | Bad Request | File tidak valid, format salah, atau file kosong |
| `413` | Payload Too Large | Ukuran file melebihi 5 MB |
| `415` | Unsupported Media Type | Format file bukan PDF/DOCX |
| `429` | Too Many Requests | Rate limit terlampaui |
| `500` | Internal Server Error | Kesalahan server yang tidak terduga |
| `502` | Bad Gateway | Layanan AI Python tidak tersedia |
| `504` | Gateway Timeout | Analisis melebihi batas waktu 30 detik |

---

## 3. Format Respons Standar

### Respons Sukses
```json
{
  "status": "success",
  "data": { ... },
  "processing_time_ms": 4250
}
```

### Respons Error
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Silakan unggah file dalam format PDF atau DOCX."
  }
}
```

---

## 4. Daftar Endpoint

### 4.1. Health Check

Memeriksa kesehatan server dan konektivitas ke layanan dependen.

```
GET /api/v1/health
```

**Parameter:** Tidak ada

**Respons (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "services": {
    "database": "connected",
    "ai_service": "connected"
  }
}
```

---

### 4.2. Analisis CV

Mengunggah dan menganalisis file CV menggunakan AI.

```
POST /api/v1/analyze
```

**Headers:**
| Header | Nilai |
|---|---|
| Content-Type | `multipart/form-data` |

**Body (form-data):**
| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `file` | Binary | Ya | File CV dalam format PDF atau DOCX (maks. 5 MB) |

**Validasi:**
| Aturan | Kode Error | Pesan |
|---|---|---|
| File wajib ada | `FILE_REQUIRED` | "File CV wajib diunggah." |
| Hanya PDF/DOCX | `INVALID_FILE_TYPE` | "Silakan unggah file dalam format PDF atau DOCX." |
| Maks. 5 MB | `FILE_TOO_LARGE` | "Ukuran file melebihi batas maksimal 5 MB." |
| File tidak kosong | `EMPTY_FILE` | "File yang diunggah kosong. Silakan unggah file yang valid." |
| Teks dapat diekstrak | `UNREADABLE_FILE` | "Tidak dapat mengekstrak teks dari file. Pastikan file tidak terkunci atau rusak." |

**Respons Sukses (200 OK):**
```json
{
  "status": "success",
  "data": {
    "score": 72,
    "label": "Bagus",
    "strengths": [
      "Riwayat kerja kronologis yang jelas dengan jabatan pekerjaan yang relevan",
      "Penggunaan kata kerja tindakan yang efektif dalam deskripsi pengalaman",
      "Bagian pendidikan terstruktur dengan baik dengan detail yang relevan"
    ],
    "weaknesses": [
      "Poin-poin kurang memiliki pencapaian dan metrik yang dapat diukur",
      "Tidak ada ringkasan profesional atau pernyataan tujuan di bagian atas",
      "Bagian keterampilan tidak ada atau tidak ditempatkan secara menonjol"
    ],
    "recommendations": [
      "Tambahkan angka dan persentase spesifik ke deskripsi pencapaian Anda",
      "Sertakan 2-3 kalimat ringkasan profesional di bagian atas CV Anda",
      "Buat bagian keterampilan khusus yang mencantumkan keterampilan teknis dan soft skill",
      "Pastikan format yang konsisten di semua bagian"
    ]
  },
  "processing_time_ms": 4250
}
```

**Skema Respons `data`:**
| Field | Tipe | Deskripsi |
|---|---|---|
| `score` | Integer (0-100) | Skor kualitas CV keseluruhan |
| `label` | String | Label kategori: "Perlu Perbaikan" (0-39), "Cukup" (40-59), "Bagus" (60-79), "Luar Biasa" (80-100) |
| `strengths` | Array of String | 3-7 kekuatan spesifik yang teridentifikasi |
| `weaknesses` | Array of String | 3-7 kelemahan spesifik yang teridentifikasi |
| `recommendations` | Array of String | 3-7 rekomendasi yang dapat ditindaklanjuti, diurutkan berdasarkan dampak |

**Contoh Error (400):**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Silakan unggah file dalam format PDF atau DOCX."
  }
}
```

**Contoh Error (504):**
```json
{
  "status": "error",
  "error": {
    "code": "ANALYSIS_TIMEOUT",
    "message": "Analisis memerlukan waktu terlalu lama. Silakan coba lagi."
  }
}
```

---

### 4.3. Generate Laporan PDF

Membuat laporan PDF dari hasil analisis CV.

```
POST /api/v1/report/generate
```

**Headers:**
| Header | Nilai |
|---|---|
| Content-Type | `application/json` |

**Body (JSON):**
```json
{
  "score": 72,
  "label": "Bagus",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."]
}
```

**Validasi:**
| Aturan | Kode Error | Pesan |
|---|---|---|
| Body wajib valid JSON | `INVALID_JSON` | "Format data tidak valid." |
| Score wajib 0-100 | `INVALID_SCORE` | "Skor harus berupa angka antara 0-100." |
| Arrays tidak boleh kosong | `EMPTY_ANALYSIS` | "Data analisis tidak boleh kosong." |

**Respons Sukses (200 OK):**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Laporan_Analisis_CV_2026-04-24.pdf"`
- **Body:** Binary stream (file PDF)

---

## 5. Internal API (Golang → Python)

> Endpoint ini hanya diakses secara internal oleh server Golang. Tidak terekspos ke internet.

### 5.1. Parse & Analyze

```
POST http://ai-service:8001/analyze
```

**Headers:**
| Header | Nilai |
|---|---|
| Content-Type | `multipart/form-data` |
| X-Internal-Key | `${INTERNAL_SERVICE_KEY}` |

**Body:** File binary (diteruskan dari client upload)

**Respons (200 OK):**
```json
{
  "score": 72,
  "label": "Bagus",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."],
  "metadata": {
    "model": "gemini-1.5-flash",
    "prompt_tokens": 1250,
    "completion_tokens": 850,
    "total_tokens": 2100,
    "processing_time_ms": 3800
  }
}
```

---

## 6. Kode Error Lengkap

| Kode Error | HTTP Status | Deskripsi |
|---|---|---|
| `FILE_REQUIRED` | 400 | Tidak ada file yang diunggah |
| `INVALID_FILE_TYPE` | 415 | Format file bukan PDF/DOCX |
| `FILE_TOO_LARGE` | 413 | File melebihi 5 MB |
| `EMPTY_FILE` | 400 | File kosong (0 bytes) |
| `UNREADABLE_FILE` | 400 | Teks tidak dapat diekstrak |
| `INVALID_JSON` | 400 | Body request bukan JSON valid |
| `INVALID_SCORE` | 400 | Skor di luar rentang 0-100 |
| `EMPTY_ANALYSIS` | 400 | Data analisis kosong |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `AI_SERVICE_ERROR` | 502 | Layanan AI tidak tersedia |
| `ANALYSIS_TIMEOUT` | 504 | Analisis melebihi 30 detik |
| `INTERNAL_ERROR` | 500 | Kesalahan internal server |

---

## 7. Contoh Penggunaan (cURL)

### Analisis CV
```bash
curl -X POST http://localhost:8080/api/v1/analyze \
  -F "file=@/path/to/resume.pdf"
```

### Generate Laporan PDF
```bash
curl -X POST http://localhost:8080/api/v1/report/generate \
  -H "Content-Type: application/json" \
  -d '{"score":72,"label":"Bagus","strengths":["..."],"weaknesses":["..."],"recommendations":["..."]}' \
  --output laporan.pdf
```

### Health Check
```bash
curl http://localhost:8080/api/v1/health
```

---

*Akhir Dokumen*
