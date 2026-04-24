# Rencana Pengujian QA (QA Test Plan)
# CV Analyzer v1.0

---

## 1. Gambaran Umum

Dokumen ini mendefinisikan strategi, cakupan, skenario, dan kriteria pengujian untuk memastikan kualitas aplikasi CV Analyzer v1.0 sebelum rilis publik. Pengujian mencakup seluruh alur pengguna — dari unggah file hingga unduh laporan — serta aspek non-fungsional seperti performa, keamanan, dan responsivitas.

---

## 2. Cakupan Pengujian

### 2.1. Dalam Cakupan

| Area | Deskripsi |
|---|---|
| Unggah file | Validasi format, ukuran, drag-and-drop, file picker |
| Analisis AI | Pipeline end-to-end: upload → parse → Gemini → respons |
| Tampilan hasil | Skor, kekuatan, kelemahan, rekomendasi |
| Unduh laporan | Pembuatan dan pengunduhan PDF |
| Penanganan error | File tidak valid, timeout, error API, jaringan |
| Responsivitas | Desktop, tablet, mobile (320px–1920px) |
| Aksesibilitas | Keyboard nav, screen reader, kontras warna |
| Performa | Waktu respons < 30 detik |
| Keamanan | File berbahaya, rate limiting, API key exposure |
| Lintas browser | Chrome, Firefox, Safari, Edge (2 versi terbaru) |

### 2.2. Di Luar Cakupan

- Load testing skala besar (>100 concurrent users)
- Pengujian multi-bahasa (v1 hanya mendukung bahasa Inggris)
- Pengujian autentikasi (tidak ada di v1)

---

## 3. Kriteria Masuk & Keluar

### Kriteria Masuk (Entry Criteria)

- Semua fitur S1–S12 dari PRD sudah diimplementasikan
- Environment staging tersedia dan berjalan
- Semua dependensi (SQL Server, Gemini API) terhubung
- Unit test backend dan AI service sudah lulus (coverage ≥ 70%)

### Kriteria Keluar (Exit Criteria)

- Semua test case prioritas Kritis dan Tinggi **lulus 100%**
- Semua test case prioritas Sedang **lulus ≥ 95%**
- Tidak ada bug Kritis atau Tinggi yang belum terselesaikan
- Performa memenuhi NFR (analisis < 30 detik)
- Laporan pengujian sudah ditinjau dan disetujui

---

## 4. Skenario Pengujian

### TC-1: Unggah File (US-1.1, US-1.2)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-1.1 | Unggah PDF valid | Unggah file PDF 2 MB | Sistem menerima file, mulai analisis | Kritis |
| TC-1.2 | Unggah DOCX valid | Unggah file DOCX 1 MB | Sistem menerima file, mulai analisis | Kritis |
| TC-1.3 | Unggah via drag-and-drop | Seret file ke zona unggah | File diterima, zona berubah warna | Tinggi |
| TC-1.4 | Unggah via file picker | Klik zona, pilih file dari dialog | File diterima | Tinggi |
| TC-1.5 | Tolak file > 5 MB | Unggah PDF 6 MB | Pesan error: "Ukuran file melebihi batas maksimal 5 MB" | Kritis |
| TC-1.6 | Tolak format JPG | Unggah file gambar JPG | Pesan error: "Silakan unggah file dalam format PDF atau DOCX" | Kritis |
| TC-1.7 | Tolak format TXT | Unggah file .txt | Pesan error format tidak didukung | Tinggi |
| TC-1.8 | Tolak file EXE | Unggah file .exe | Pesan error format tidak didukung | Kritis |
| TC-1.9 | Tolak file kosong | Unggah PDF 0 bytes | Pesan error: "File yang diunggah kosong" | Tinggi |
| TC-1.10 | Tolak file corrupt | Unggah PDF yang rusak/corrupt | Pesan error: file tidak dapat dibaca | Tinggi |
| TC-1.11 | Pesan error inline | Unggah file invalid | Error muncul dalam < 1 detik, bukan popup browser | Tinggi |
| TC-1.12 | Retry tanpa pindah halaman | Setelah error, unggah file lain | Bisa unggah ulang tanpa navigasi | Sedang |
| TC-1.13 | File PDF yang dilindungi password | Unggah PDF terenkripsi | Pesan error yang jelas | Sedang |
| TC-1.14 | File PDF scan (gambar, bukan teks) | Unggah PDF berbasis gambar | Pesan error: teks tidak cukup | Sedang |
| TC-1.15 | Batas tepat 5 MB | Unggah file tepat 5 MB | File diterima (boundary test) | Sedang |

### TC-2: Analisis AI (US-2.1)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-2.1 | Analisis CV lengkap (PDF) | Unggah CV profesional yang lengkap | Hasil analisis ditampilkan < 30 detik | Kritis |
| TC-2.2 | Analisis CV lengkap (DOCX) | Unggah CV dalam format DOCX | Hasil analisis ditampilkan < 30 detik | Kritis |
| TC-2.3 | Loading indicator | Mulai analisis | Spinner/progress indicator tampil selama proses | Tinggi |
| TC-2.4 | Blokir upload ganda | Klik upload saat analisis berjalan | Tombol upload disabled/tidak bisa diklik | Tinggi |
| TC-2.5 | CV minimal (1 halaman) | Unggah CV pendek 1 halaman | Analisis berhasil dengan hasil relevan | Sedang |
| TC-2.6 | CV panjang (5+ halaman) | Unggah CV 5 halaman | Analisis berhasil dalam batas waktu | Sedang |
| TC-2.7 | CV dengan format rumit | Unggah CV dengan tabel, kolom, header | Teks diekstrak dan dianalisis | Sedang |

### TC-3: Tampilan Hasil (US-2.2 – US-2.5)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-3.1 | Tampilan skor | Lihat halaman hasil | Skor besar, terpusat, font menonjol | Kritis |
| TC-3.2 | Warna skor merah (0–39) | Analisis CV kualitas rendah | Skor berwarna merah, label "Perlu Perbaikan" | Tinggi |
| TC-3.3 | Warna skor kuning (40–69) | Analisis CV kualitas sedang | Skor berwarna kuning, label "Cukup"/"Bagus" | Tinggi |
| TC-3.4 | Warna skor hijau (70–100) | Analisis CV kualitas tinggi | Skor berwarna hijau, label "Bagus"/"Luar Biasa" | Tinggi |
| TC-3.5 | Daftar kekuatan | Lihat bagian kekuatan | 3–7 item berpoin, observasi spesifik, aksen hijau | Kritis |
| TC-3.6 | Daftar kelemahan | Lihat bagian kelemahan | 3–7 item berpoin, masalah spesifik, aksen oranye/merah | Kritis |
| TC-3.7 | Daftar rekomendasi | Lihat bagian rekomendasi | 3–7 item bernomor, actionable, aksen biru | Kritis |
| TC-3.8 | Urutan rekomendasi | Periksa urutan rekomendasi | Diurutkan dari dampak tertinggi ke terendah | Sedang |

### TC-4: Manajemen Hasil (US-3.1, US-3.2)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-4.1 | Unduh laporan PDF | Klik "Unduh Laporan" | File PDF terunduh ke perangkat | Kritis |
| TC-4.2 | Konten PDF lengkap | Buka PDF yang diunduh | Berisi skor, kekuatan, kelemahan, rekomendasi | Kritis |
| TC-4.3 | Format PDF rapi | Periksa tata letak PDF | Terbaca, terformat rapi, tidak terpotong | Tinggi |
| TC-4.4 | Nama file PDF | Periksa nama file unduhan | Pola: `Laporan_Analisis_CV_YYYY-MM-DD.pdf` | Sedang |
| TC-4.5 | Tombol "Unggah CV Lain" | Klik tombol setelah melihat hasil | Kembali ke halaman unggah, state direset | Kritis |
| TC-4.6 | Reset state | Setelah klik "Unggah CV Lain" | Hasil sebelumnya hilang, siap menerima file baru | Tinggi |
| TC-4.7 | Tanpa page reload | Navigasi dari hasil ke unggah | Transisi mulus tanpa refresh halaman | Sedang |

### TC-5: Penanganan Error (US-4.1, US-4.2)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-5.1 | Error Gemini API | Simulasi Gemini down | Pesan ramah, bukan error mentah. Tombol "Coba Lagi" | Kritis |
| TC-5.2 | Timeout 30 detik | Simulasi respons lambat | Pesan timeout yang jelas. Tombol "Coba Lagi" | Kritis |
| TC-5.3 | File tidak terbaca | Unggah file dengan konten kosong | Pesan: "Tidak dapat mengekstrak teks" | Tinggi |
| TC-5.4 | Python service down | Matikan AI service | Pesan: layanan sedang tidak tersedia | Tinggi |
| TC-5.5 | Koneksi internet putus | Matikan jaringan saat upload | Pesan: "Periksa koneksi internet Anda" | Tinggi |
| TC-5.6 | Retry tanpa pilih ulang file | Klik "Coba Lagi" setelah error | Analisis diulang dengan file yang sama | Sedang |
| TC-5.7 | Server log error | Trigger error, periksa server log | Error asli tercatat di log server (bukan di client) | Sedang |

### TC-6: Performa (NFR-1 – NFR-8)

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-6.1 | Waktu analisis | Unggah 10 CV berbeda | Rata-rata < 15 detik, maks < 30 detik | Kritis |
| TC-6.2 | Upload 5 MB file | Unggah file tepat 5 MB | Upload berhasil dalam waktu wajar | Tinggi |
| TC-6.3 | Rate limit | Kirim 15 request dalam 1 menit | Request ke-11+ mendapat 429 | Tinggi |
| TC-6.4 | Health check response | GET /health | Respons < 200ms | Sedang |

### TC-7: Responsivitas & Lintas Browser

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-7.1 | Desktop (1920px) | Buka di layar desktop | Layout terpusat, spacing optimal | Tinggi |
| TC-7.2 | Tablet (768px) | Buka di viewport tablet | Layout responsif, tombol mudah diklik | Tinggi |
| TC-7.3 | Mobile (375px) | Buka di viewport mobile | Satu kolom, tombol full-width, bisa scroll | Kritis |
| TC-7.4 | Mobile (320px) | Buka di viewport terkecil | Tidak ada overflow horizontal, semua terbaca | Tinggi |
| TC-7.5 | Chrome (terbaru) | Jalankan semua TC di Chrome | Semua fitur berfungsi | Kritis |
| TC-7.6 | Firefox (terbaru) | Jalankan semua TC di Firefox | Semua fitur berfungsi | Tinggi |
| TC-7.7 | Safari (terbaru) | Jalankan semua TC di Safari | Semua fitur berfungsi | Tinggi |
| TC-7.8 | Edge (terbaru) | Jalankan semua TC di Edge | Semua fitur berfungsi | Sedang |

### TC-8: Aksesibilitas

| ID | Skenario | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TC-8.1 | Navigasi keyboard | Tab melalui seluruh halaman | Semua elemen interaktif dapat dijangkau | Tinggi |
| TC-8.2 | Focus indicator | Tab ke tombol/link | Outline fokus terlihat jelas | Tinggi |
| TC-8.3 | Screen reader | Gunakan NVDA/VoiceOver | Label dan peran elemen dibacakan dengan benar | Sedang |
| TC-8.4 | Kontras warna | Audit dengan Lighthouse | Rasio kontras ≥ 4.5:1 (WCAG AA) | Tinggi |
| TC-8.5 | Error announcement | Trigger error | Screen reader mengumumkan error otomatis (role="alert") | Sedang |

---

## 5. Matriks Pemetaan Test Case ↔ User Story

| User Story | Test Cases | Jumlah |
|---|---|---|
| US-1.1 (Unggah CV) | TC-1.1 – TC-1.4 | 4 |
| US-1.2 (Validasi File) | TC-1.5 – TC-1.15 | 11 |
| US-2.1 (Analisis CV) | TC-2.1 – TC-2.7 | 7 |
| US-2.2 (Skor) | TC-3.1 – TC-3.4 | 4 |
| US-2.3 (Kekuatan) | TC-3.5 | 1 |
| US-2.4 (Kelemahan) | TC-3.6 | 1 |
| US-2.5 (Rekomendasi) | TC-3.7 – TC-3.8 | 2 |
| US-3.1 (Unduh Laporan) | TC-4.1 – TC-4.4 | 4 |
| US-3.2 (CV Lainnya) | TC-4.5 – TC-4.7 | 3 |
| US-4.1 (Error Analisis) | TC-5.1 – TC-5.4, TC-5.7 | 5 |
| US-4.2 (Error Jaringan) | TC-5.5 – TC-5.6 | 2 |
| NFR (Non-Fungsional) | TC-6.x, TC-7.x, TC-8.x | 17 |
| **Total** | | **61** |

---

## 6. Lingkungan Pengujian

| Item | Detail |
|---|---|
| OS | Windows 11, macOS Sonoma |
| Browser | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Perangkat Mobile | iPhone 15 (Safari), Pixel 8 (Chrome) atau emulator |
| Backend | Docker Compose (Go + Python + SQL Server) |
| API Testing | Postman / cURL |
| A11y Testing | Lighthouse, axe DevTools, NVDA |
| Perf Testing | Browser DevTools Network tab, server-side timing |

---

## 7. Template Laporan Bug

```markdown
### [BUG-XXX] Judul Bug

**Prioritas:** Kritis / Tinggi / Sedang / Rendah
**Status:** Open / In Progress / Fixed / Verified
**Test Case:** TC-X.X
**User Story:** US-X.X

**Langkah Reproduksi:**
1. ...
2. ...

**Hasil Aktual:** ...
**Hasil yang Diharapkan:** ...
**Screenshot/Video:** (lampirkan)
**Environment:** Browser, OS, viewport size
```

---

*Akhir Dokumen*
