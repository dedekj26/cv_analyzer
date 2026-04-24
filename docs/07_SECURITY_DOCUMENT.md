# Dokumen Keamanan (Security Document)
# CV Analyzer v1.0

---

## 1. Ringkasan

Dokumen ini mendefinisikan kebijakan keamanan, model ancaman, kontrol proteksi, dan prosedur penanganan insiden untuk aplikasi CV Analyzer v1.0. Karena aplikasi ini memproses dokumen pribadi pengguna (CV/resume), perlindungan privasi data merupakan prioritas utama.

---

## 2. Prinsip Keamanan

| # | Prinsip | Penerapan |
|---|---|---|
| 1 | **Zero Trust** | Setiap request divalidasi, tidak ada asumsi kepercayaan |
| 2 | **Defense in Depth** | Validasi di setiap lapisan: frontend, backend, AI service |
| 3 | **Least Privilege** | Setiap komponen hanya memiliki akses minimum yang dibutuhkan |
| 4 | **Privacy by Design** | Data pengguna tidak pernah disimpan secara permanen |
| 5 | **Fail Secure** | Saat terjadi error, sistem gagal ke kondisi aman (bukan terbuka) |

---

## 3. Model Ancaman (Threat Model)

### 3.1. Aset yang Dilindungi

| Aset | Sensitivitas | Deskripsi |
|---|---|---|
| File CV pengguna | Tinggi | Berisi data pribadi (nama, alamat, riwayat kerja) |
| Teks CV yang diekstrak | Tinggi | Plain text dari konten CV |
| Gemini API Key | Kritis | Kunci akses ke layanan AI berbayar |
| Internal Service Key | Tinggi | Kunci komunikasi internal antar service |
| Database credentials | Kritis | Akses ke SQL Server |
| Hasil analisis | Sedang | Skor dan feedback (bukan PII secara langsung) |

### 3.2. Vektor Ancaman

| # | Ancaman | Sumber | Dampak | Kemungkinan | Risiko |
|---|---|---|---|---|---|
| T1 | Upload file berbahaya (malware, script) | Pengguna jahat | Kompromi server | Sedang | Tinggi |
| T2 | Kebocoran API key Gemini | Misconfiguration | Penyalahgunaan API, biaya tinggi | Sedang | Kritis |
| T3 | DDoS / rate abuse | Bot / attacker | Service down, biaya API tinggi | Tinggi | Tinggi |
| T4 | Pencurian data CV di transit | Man-in-the-Middle | Kebocoran data pribadi | Rendah | Tinggi |
| T5 | SQL Injection via log data | Pengguna jahat | Kompromi database | Rendah | Sedang |
| T6 | Path traversal via filename | Pengguna jahat | Akses file server | Rendah | Sedang |
| T7 | Prompt injection via CV content | Pengguna jahat | Manipulasi output AI | Sedang | Sedang |
| T8 | Akses tidak sah ke AI service | Attacker eksternal | Bypass gateway, akses langsung | Rendah | Tinggi |
| T9 | Data CV tersimpan di disk | Bug implementasi | Pelanggaran privasi | Rendah | Kritis |

---

## 4. Kontrol Keamanan

### 4.1. Keamanan File Upload

| Kontrol | Implementasi | Mitigasi Ancaman |
|---|---|---|
| **Validasi MIME Type** | Periksa `Content-Type` header pada request | T1 |
| **Validasi Magic Number** | Baca 4 byte pertama file: `%PDF` (PDF), `PK` (DOCX/ZIP) | T1 |
| **Batas Ukuran File** | Reject file > 5 MB di level middleware | T1, T3 |
| **Sanitasi Nama File** | Abaikan nama file asli, gunakan UUID internal | T6 |
| **Tanpa Penulisan Disk** | File dibaca langsung ke `bytes.Buffer`, tidak pernah ditulis ke disk | T9 |
| **Garbage Collection** | Buffer file langsung di-GC setelah respons dikirim | T9 |

```go
// Validasi Magic Number
func validateFile(data []byte) (string, error) {
    if len(data) < 4 {
        return "", errors.New("file terlalu kecil")
    }
    // PDF: %PDF (0x25 0x50 0x44 0x46)
    if bytes.HasPrefix(data, []byte{0x25, 0x50, 0x44, 0x46}) {
        return "pdf", nil
    }
    // DOCX: PK (ZIP header: 0x50 0x4B 0x03 0x04)
    if bytes.HasPrefix(data, []byte{0x50, 0x4B, 0x03, 0x04}) {
        return "docx", nil
    }
    return "", errors.New("format file tidak didukung")
}
```

### 4.2. Keamanan API

| Kontrol | Implementasi | Mitigasi Ancaman |
|---|---|---|
| **Rate Limiting** | 10 request/menit per IP menggunakan `golang.org/x/time/rate` | T3 |
| **CORS** | Hanya mengizinkan origin frontend yang dikenal | T8 |
| **Request Timeout** | 30 detik timeout pada context untuk analisis | T3 |
| **No Auth Bypass** | AI service hanya menerima request dengan `X-Internal-Key` | T8 |
| **Input Size Limit** | `MaxBytesReader` pada request body | T3 |

```go
// Rate Limiter Middleware
func RateLimitMiddleware() gin.HandlerFunc {
    // Map per IP
    visitors := make(map[string]*rate.Limiter)
    var mu sync.Mutex

    return func(c *gin.Context) {
        ip := c.ClientIP()
        mu.Lock()
        limiter, exists := visitors[ip]
        if !exists {
            limiter = rate.NewLimiter(rate.Every(6*time.Second), 1) // ~10/menit
            visitors[ip] = limiter
        }
        mu.Unlock()

        if !limiter.Allow() {
            c.JSON(429, gin.H{
                "status": "error",
                "error": gin.H{
                    "code":    "RATE_LIMITED",
                    "message": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
                },
            })
            c.Abort()
            return
        }
        c.Next()
    }
}
```

### 4.3. Keamanan Kunci & Rahasia

| Kontrol | Implementasi | Mitigasi Ancaman |
|---|---|---|
| **Server-Side Only** | `GEMINI_API_KEY` hanya ada di environment backend Python | T2 |
| **Secrets Manager** | Production: AWS Secrets Manager / GCP Secret Manager | T2 |
| **Tidak di Source Code** | `.env` masuk `.gitignore`, `.env.example` tanpa nilai asli | T2 |
| **Internal Key** | Komunikasi Go→Python dilindungi `INTERNAL_SERVICE_KEY` | T8 |
| **Rotasi Key** | Rekomendasi rotasi setiap 90 hari | T2 |

```env
# .env.example (tanpa nilai sensitif)
GEMINI_API_KEY=
INTERNAL_SERVICE_KEY=
DB_PASSWORD=
```

### 4.4. Keamanan Data & Privasi

| Kontrol | Implementasi | Mitigasi Ancaman |
|---|---|---|
| **Tanpa Penyimpanan File** | CV diproses di memori, tidak ditulis ke disk atau DB | T9 |
| **Tanpa Penyimpanan Teks** | Teks hasil ekstraksi tidak disimpan di DB | T9 |
| **Log Anonim** | Hanya ukuran file, tipe, skor, dan status yang di-log | T9 |
| **HTTPS/TLS** | Semua komunikasi client↔server melalui TLS 1.2+ | T4 |
| **VPC Internal** | Komunikasi Go↔Python melalui jaringan privat | T8 |

**Apa yang DISIMPAN di database:**
- Ukuran file (KB)
- Tipe file (PDF/DOCX)
- Waktu pemrosesan (ms)
- Skor keseluruhan
- Status (SUCCESS/FAILED)
- Pesan error (jika gagal)

**Apa yang TIDAK PERNAH disimpan:**
- ❌ Nama file asli pengguna
- ❌ Konten file (binary)
- ❌ Teks yang diekstrak
- ❌ Nama / data pribadi pengguna
- ❌ Alamat IP pengguna
- ❌ Detail kekuatan / kelemahan / rekomendasi

### 4.5. Keamanan Frontend

| Kontrol | Implementasi |
|---|---|
| **Validasi Client-Side** | Tipe dan ukuran file divalidasi sebelum upload |
| **No Eval** | Tidak menggunakan `eval()` atau `innerHTML` dari data server |
| **CSP Header** | Content Security Policy untuk mencegah XSS |
| **SRI** | Subresource Integrity untuk CDN assets |

### 4.6. Pertahanan Prompt Injection

| Kontrol | Implementasi | Mitigasi Ancaman |
|---|---|---|
| **Sanitasi Teks** | Hapus karakter kontrol dan escape sequences dari teks CV | T7 |
| **Batasi Panjang** | Potong teks CV menjadi maks. 10.000 karakter | T7 |
| **System Prompt** | Gunakan system instruction yang kuat untuk membatasi output | T7 |
| **Output Validation** | Validasi JSON output Gemini dengan Pydantic schema | T7 |

```python
def sanitize_cv_text(text: str) -> str:
    """Bersihkan teks CV dari karakter berbahaya."""
    # Hapus karakter kontrol (kecuali newline dan tab)
    import re
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Batasi panjang
    if len(text) > 10000:
        text = text[:10000]
    return text.strip()
```

---

## 5. Keamanan Infrastruktur

| Layer | Kontrol |
|---|---|
| **Network** | Hanya port 80/443 yang terbuka ke publik; AI service di VPC internal |
| **Docker** | Jalankan container sebagai non-root user |
| **Database** | SQL Server hanya dapat diakses dari VPC internal |
| **Firewall** | WAF (Cloudflare atau setara) untuk filter traffic |
| **Monitoring** | Alert pada anomali: spike request, error rate tinggi |

### Dockerfile Security Best Practices

```dockerfile
# Contoh: Backend Golang
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:3.19
RUN adduser -D -s /bin/sh appuser
USER appuser
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
```

---

## 6. Checklist Keamanan Sebelum Rilis

| # | Item | Status |
|---|---|---|
| 1 | File CV tidak pernah ditulis ke disk | ⬜ |
| 2 | Teks CV tidak disimpan di database | ⬜ |
| 3 | Gemini API Key tidak terekspos ke frontend | ⬜ |
| 4 | Gemini API Key tidak ada di source code | ⬜ |
| 5 | `.env` masuk `.gitignore` | ⬜ |
| 6 | Magic number validation aktif | ⬜ |
| 7 | Rate limiting aktif (10 req/menit/IP) | ⬜ |
| 8 | CORS hanya mengizinkan origin yang dikenal | ⬜ |
| 9 | HTTPS/TLS aktif di production | ⬜ |
| 10 | Internal service key diset | ⬜ |
| 11 | Docker container berjalan sebagai non-root | ⬜ |
| 12 | SQL Server tidak terekspos ke internet | ⬜ |
| 13 | Prompt injection sanitization aktif | ⬜ |
| 14 | Error messages tidak membocorkan detail internal | ⬜ |
| 15 | Dependency scan (go vet, pip audit) dilakukan | ⬜ |

---

## 7. Prosedur Penanganan Insiden

### 7.1. Klasifikasi

| Level | Deskripsi | Contoh | Response Time |
|---|---|---|---|
| P0 - Kritis | Kebocoran data pengguna | CV tersimpan di disk, API key terekspos | < 1 jam |
| P1 - Tinggi | Layanan down atau penyalahgunaan | DDoS, Gemini API abuse | < 4 jam |
| P2 - Sedang | Bug keamanan tanpa eksploitasi aktif | Rate limit bypass, CORS misconfiguration | < 24 jam |
| P3 - Rendah | Potensi risiko, belum tereksploitasi | Dependency vulnerability | < 1 minggu |

### 7.2. Langkah Penanganan

1. **Deteksi** — Alert dari monitoring atau laporan pengguna
2. **Isolasi** — Matikan service yang terdampak jika perlu
3. **Investigasi** — Periksa log, identifikasi root cause
4. **Perbaikan** — Deploy patch, rotasi credentials jika perlu
5. **Pemulihan** — Pastikan service berjalan normal
6. **Post-Mortem** — Dokumentasi insiden, lesson learned, preventive action

---

*Akhir Dokumen*
