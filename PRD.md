# Product Requirements Document (PRD)

# AI-Powered CV Analyzer -> Penganalisis CV Berbasis AI

| Field            | Detail                        |
| ---------------- | ----------------------------- |
| **Product Name** | CV Analyzer (Penganalisis CV) |
| **Version**      | 1.0                           |
| **Date**         | 24 April 2026                 |
| **Status**       | Draf                          |
| **Author**       | Tim Produk                    |

---

## 1. Gambaran Umum Proyek (Project Overview)

**CV Analyzer** adalah aplikasi berbasis web yang memungkinkan pencari kerja untuk mengunggah resume (CV) mereka dan menerima analisis yang dihasilkan oleh AI, yang mencakup skor kualitas keseluruhan, identifikasi kekuatan, kelemahan, dan rekomendasi perbaikan yang dapat ditindaklanjuti. Aplikasi ini memanfaatkan model bahasa **Google Gemini** [6] untuk melakukan Pemrosesan Bahasa Alami (NLP) pada dokumen yang diunggah, memberikan umpan balik yang terstruktur dan mudah dipahami dalam hitungan detik.

Produk ini dirancang dengan mengutamakan kesederhanaan — antarmuka yang bersih dan intuitif yang dapat digunakan dengan mudah oleh siapa saja, terlepas dari keterampilan teknis yang dimiliki. Produk ini berfungsi sebagai alat bantu pribadi yang mandiri sekaligus sebagai fondasi untuk produk digital yang dapat diskalakan.

---

## 2. Latar Belakang

### 2.1 Konteks Pasar

Pasar kerja semakin kompetitif — rata-rata setiap lowongan pekerjaan korporat menerima sekitar 250 lamaran, dengan hanya 2–5% pelamar yang mendapatkan undangan wawancara [7]. Pencari kerja sering kali mengirimkan resume tanpa memahami seberapa baik dokumen mereka mengkomunikasikan kualifikasi mereka. Layanan tinjauan resume profesional memang ada tetapi mahal ($50–$300+) dan lambat (1–3 hari kerja) [8]. Alat bantu online gratis sering kali hanya bersifat dangkal, hanya memeriksa format atau jumlah kata kunci tanpa memahami konteks.

### 2.2 Peluang

Kemajuan dalam Large Language Models (LLMs) — khususnya model Gemini dari Google [6] — kini memungkinkan untuk melakukan analisis konten resume yang mendalam dan kontekstual dengan biaya rendah dan secara real-time. Hal ini menciptakan peluang untuk mendemokratisasi umpan balik resume berkualitas tinggi.

### 2.3 Visi

Memberikan umpan balik resume tingkat profesional instan yang didukung oleh AI kepada setiap pencari kerja — dapat diakses, terjangkau, dan dapat ditindaklanjuti.

---

## 3. Masalah & Poin Kelemahan Pengguna (User Pain Points)

| #   | Poin Kelemahan (Pain Point)                   | Deskripsi                                                                                                                    |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P1  | **Tidak ada penilaian diri yang objektif**    | Pencari kerja tidak dapat menilai kualitas resume mereka sendiri secara objektif — mereka kurang perspektif eksternal.       |
| P2  | **Kelemahan yang tidak jelas**                | Pengguna tidak tahu _apa tepatnya_ yang lemah dalam resume mereka (misalnya, deskripsi yang tidak jelas, tidak ada metrik).  |
| P3  | **Saran umum tidak membantu**                 | Sebagian besar alat gratis memberikan tips umum ("gunakan kata kerja tindakan") tanpa menganalisis konten aktual pengguna.   |
| P4  | **Tinjauan profesional itu mahal**            | Menyewa pelatih karier atau penulis resume membutuhkan biaya $50–$300+ per sesi dan memakan waktu berhari-hari [8].          |
| P5  | **Siklus umpan balik yang lambat**            | Menunggu umpan balik selama berhari-hari akan memperlambat proses lamaran kerja, padahal waktu sangat penting.               |
| P6  | **Alat yang canggih mengintimidasi pengguna** | Banyak alat yang ada memiliki UI yang rumit, mengharuskan pembuatan akun, atau mendorong pembelian sebelum memberikan nilai. |

---

## 4. Solusi

| Poin Kelemahan | Solusi                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| P1             | Memberikan **skor kualitas CV keseluruhan** (0–100) sehingga pengguna memiliki tolok ukur yang jelas dan terukur.                       |
| P2             | Menghasilkan **daftar kelemahan terstruktur** dengan referensi spesifik ke bagian/konten dalam resume yang diunggah.                    |
| P3             | Memberikan **rekomendasi yang dipersonalisasi dan dapat ditindaklanjuti** berdasarkan konten aktual CV pengguna.                        |
| P4             | Menawarkan analisis yang didukung AI secara **gratis atau berbiaya rendah** yang menyaingi umpan balik tingkat profesional.             |
| P5             | Mengembalikan hasil analisis **dalam hitungan detik** setelah mengunggah dokumen.                                                       |
| P6             | Membangun **UI yang minimalis dan bersih** — unggah dan dapatkan hasil dalam dua langkah. Tidak perlu mendaftar untuk penggunaan dasar. |

---

## 5. Arsitektur Tingkat Tinggi (High-Level Architecture)

![Diagram Arsitektur Tingkat Tinggi](docs/images/architecture_diagram.png)

### Catatan Arsitektur

| Komponen          | Teknologi / Alat              | Tujuan                                                     | Ref  |
| ----------------- | ----------------------------- | ---------------------------------------------------------- | ---- |
| Frontend          | React + Vite + Tailwind CSS   | Antarmuka pengguna untuk unggahan dan tampilan hasil       | [9]  |
| Backend API       | Golang + SQL Server           | Menangani unggahan file, orkestrasi, dan respons           | [10] |
| Layanan AI        | Python (FastAPI)              | Pemrosesan AI, parsing dokumen, dan analisis NLP           | [11] |
| Parser Dokumen    | PyPDF2 / python-docx          | Mengekstrak teks biasa dari file PDF/DOCX                  | [12] |
| Mesin Prompt      | Modul kustom (Python)         | Menyusun prompt terstruktur untuk LLM                      | —    |
| Automation        | n8n                           | Orkestrasi workflow dan otomatisasi pipeline               | [13] |
| Layanan Eksternal | Gemini Flash API Key (Google) | Melakukan analisis NLP dan menghasilkan output terstruktur | [6]  |

---

## 6. Alur Pengguna (User Flow)

![Diagram Alur Pengguna](docs/images/user_flow_diagram.png)

---

## 7. Cakupan (Scope)

### 7.1 Dalam Cakupan (In Scope - v1.0)

| #   | Fitur                        | Deskripsi                                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| S1  | Unggah File                  | Unggah satu file CV dalam format PDF atau DOCX (maks. 5 MB)                                |
| S2  | Penguraian Dokumen (Parsing) | Mengekstrak konten teks dari file yang diunggah                                            |
| S3  | Analisis AI                  | Mengirim teks yang diekstrak ke API Gemini dan menerima analisis terstruktur               |
| S4  | Skor Keseluruhan             | Menampilkan skor kualitas keseluruhan dari 0 hingga 100                                    |
| S5  | Kekuatan                     | Menampilkan daftar kekuatan yang teridentifikasi di CV                                     |
| S6  | Kelemahan                    | Menampilkan daftar kelemahan yang teridentifikasi di CV                                    |
| S7  | Rekomendasi                  | Menampilkan saran perbaikan yang dapat ditindaklanjuti                                     |
| S8  | Tampilan Hasil               | Menampilkan semua hasil analisis pada satu halaman hasil yang bersih                       |
| S9  | Unggah Lainnya               | Mengizinkan pengguna untuk menganalisis CV baru tanpa menyegarkan halaman                  |
| S10 | Unduh Laporan                | Mengekspor hasil analisis sebagai laporan PDF yang dapat diunduh                           |
| S11 | Penanganan Kesalahan         | Penanganan yang baik terhadap file tidak valid, kesalahan API, dan kasus tepi (edge cases) |
| S12 | Desain Responsif             | Berfungsi pada browser desktop dan seluler                                                 |

### 7.2 Di Luar Cakupan (Out of Scope - v1.0)

| Fitur                          | Alasan                                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| Autentikasi pengguna / akun    | Menjaga v1 agar tidak memiliki hambatan — tidak perlu mendaftar      |
| Riwayat / penyimpanan CV       | Membutuhkan akun pengguna dan database — ditunda ke v2               |
| Pencocokan deskripsi pekerjaan | Menambah kerumitan — direncanakan untuk iterasi berikutnya           |
| Dukungan CV multi-bahasa       | Hanya bahasa Inggris pada v1 untuk menyederhanakan penyusunan prompt |
| Pembuat template CV            | Domain produk berbeda — di luar cakupan                              |
| Simulasi ATS                   | Fitur kompleks — ditunda ke v2                                       |
| Pembayaran / langganan         | Belum dibutuhkan sampai kecocokan produk-pasar tervalidasi           |

---

## 8. Cerita Pengguna (User Stories)

### Epik 1: Unggah CV

#### US-1.1: Unggah File CV

> **Sebagai** pencari kerja,
> **Saya ingin** mengunggah file CV saya dari perangkat saya,
> **Sehingga** sistem dapat menganalisis konten resume saya.

**Kriteria Penerimaan (Acceptance Criteria):**

| #    | Kriteria                                                                                         | Jenis      |
| ---- | ------------------------------------------------------------------------------------------------ | ---------- |
| AC-1 | Pengguna dapat memilih file melalui dialog pemilih file atau seret-dan-lepas (drag-and-drop)     | Fungsional |
| AC-2 | Sistem hanya menerima format file PDF dan DOCX                                                   | Fungsional |
| AC-3 | Sistem menolak file yang melebihi 5 MB dengan pesan kesalahan yang jelas                         | Fungsional |
| AC-4 | Sistem menolak format file yang tidak didukung dengan pesan: "Silakan unggah file PDF atau DOCX" | Fungsional |
| AC-5 | Tombol unggah terlihat jelas dan diberi label pada halaman                                       | UX         |
| AC-6 | Zona seret-dan-lepas diindikasikan secara visual dengan batas putus-putus dan ikon               | UX         |

---

#### US-1.2: Umpan Balik Validasi File

> **Sebagai** pengguna,
> **Saya ingin** melihat umpan balik langsung jika file saya tidak valid,
> **Sehingga** saya dapat memperbaiki masalah dan mengunggah file yang benar.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                    | Jenis      |
| ---- | ------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Pesan kesalahan muncul dalam 1 detik setelah pemilihan file jika file tidak valid           | Fungsional |
| AC-2 | Pesan kesalahan ditampilkan sebaris (bukan sebagai pop-up/peringatan browser)               | UX         |
| AC-3 | Pesan kesalahan dengan jelas menyatakan alasan penolakan (format, ukuran, atau file kosong) | UX         |
| AC-4 | Pengguna dapat mencoba mengunggah kembali tanpa berpindah dari halaman                      | Fungsional |

---

### Epik 2: Analisis CV

#### US-2.1: Analisis Konten CV

> **Sebagai** pencari kerja,
> **Saya ingin** sistem menganalisis konten CV saya menggunakan AI,
> **Sehingga** saya menerima umpan balik yang objektif tentang kualitas resume saya.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                    | Jenis      |
| ---- | ------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Sistem mengekstrak teks dari file PDF atau DOCX yang diunggah                               | Fungsional |
| AC-2 | Teks yang diekstrak dikirim ke API Gemini untuk dianalisis                                  | Fungsional |
| AC-3 | Analisis selesai dan hasil ditampilkan dalam waktu 30 detik                                 | Kinerja    |
| AC-4 | Indikator pemuatan/kemajuan (loading/progress) ditampilkan saat analisis sedang berlangsung | UX         |
| AC-5 | Pengguna tidak dapat mengunggah file lain saat analisis sedang berlangsung                  | Fungsional |

---

#### US-2.2: Lihat Skor Keseluruhan

> **Sebagai** pencari kerja,
> **Saya ingin** melihat skor kualitas keseluruhan untuk CV saya,
> **Sehingga** saya memiliki gambaran yang cepat dan terukur tentang kualitas resume saya.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                          | Jenis      |
| ---- | --------------------------------------------------------------------------------- | ---------- |
| AC-1 | Skor ditampilkan sebagai angka dari 0 hingga 100                                  | Fungsional |
| AC-2 | Skor secara visual menonjol (font besar, di tengah) pada halaman hasil            | UX         |
| AC-3 | Skor menyertakan indikator warna: merah (0–39), kuning (40–69), hijau (70–100)    | UX         |
| AC-4 | Label singkat menyertai skor (misalnya, "Perlu Perbaikan", "Bagus", "Luar Biasa") | UX         |

---

#### US-2.3: Lihat Kekuatan

> **Sebagai** pencari kerja,
> **Saya ingin** melihat daftar kekuatan yang teridentifikasi dalam CV saya,
> **Sehingga** saya tahu apa yang telah saya lakukan dengan baik dan harus dipertahankan.

**Kriteria Penerimaan:**

| #    | Kriteria                                                               | Jenis      |
| ---- | ---------------------------------------------------------------------- | ---------- |
| AC-1 | Kekuatan ditampilkan sebagai daftar berpoin (bulleted) dengan 3–7 item | Fungsional |
| AC-2 | Setiap item kekuatan adalah observasi spesifik (bukan saran umum)      | Kualitas   |
| AC-3 | Bagian kekuatan diberi label dengan jelas dengan aksen hijau atau ikon | UX         |

---

#### US-2.4: Lihat Kelemahan

> **Sebagai** pencari kerja,
> **Saya ingin** melihat daftar kelemahan yang ditemukan dalam CV saya,
> **Sehingga** saya tahu persis apa yang harus diperbaiki.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                       | Jenis      |
| ---- | ------------------------------------------------------------------------------ | ---------- |
| AC-1 | Kelemahan ditampilkan sebagai daftar berpoin dengan 3–7 item                   | Fungsional |
| AC-2 | Setiap item kelemahan merujuk pada masalah spesifik dalam konten CV            | Kualitas   |
| AC-3 | Bagian kelemahan diberi label dengan jelas dengan aksen merah/oranye atau ikon | UX         |

---

#### US-2.5: Lihat Rekomendasi

> **Sebagai** pencari kerja,
> **Saya ingin** menerima rekomendasi yang dapat ditindaklanjuti untuk memperbaiki CV saya,
> **Sehingga** saya dapat membuat perubahan nyata untuk memperkuat resume saya.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                                             | Jenis      |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Rekomendasi ditampilkan sebagai daftar bernomor dengan 3–7 item                                                      | Fungsional |
| AC-2 | Setiap rekomendasi spesifik dan dapat ditindaklanjuti (mis., "Tambahkan metrik ke poin-poin Manajer Penjualan Anda") | Kualitas   |
| AC-3 | Rekomendasi diurutkan berdasarkan prioritas dari yang paling berdampak hingga yang paling tidak berdampak            | Kualitas   |
| AC-4 | Bagian rekomendasi diberi label dengan jelas dengan aksen biru atau ikon                                             | UX         |

---

### Epik 3: Manajemen Hasil

#### US-3.1: Unduh Laporan Analisis

> **Sebagai** pencari kerja,
> **Saya ingin** mengunduh hasil analisis saya sebagai PDF,
> **Sehingga** saya dapat menyimpannya dan menjadikannya referensi secara luring (offline) saat memperbaiki CV saya.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                        | Jenis      |
| ---- | ----------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Tombol "Unduh Laporan" terlihat di halaman hasil                                                | Fungsional |
| AC-2 | Mengklik tombol akan menghasilkan dan mengunduh file PDF                                        | Fungsional |
| AC-3 | PDF berisi: skor, kekuatan, kelemahan, dan rekomendasi                                          | Fungsional |
| AC-4 | PDF diformat dengan rapi dan dapat dibaca                                                       | Kualitas   |
| AC-5 | File diberi nama dengan pola yang mudah dikenali (misalnya, Laporan_Analisis_CV_2026-04-24.pdf) | UX         |

---

#### US-3.2: Analisis CV Lainnya

> **Sebagai** pengguna,
> **Saya ingin** mengunggah dan menganalisis CV lain setelah melihat hasil,
> **Sehingga** saya dapat membandingkan versi resume saya yang berbeda atau membantu orang lain.

**Kriteria Penerimaan:**

| #    | Kriteria                                                 | Jenis      |
| ---- | -------------------------------------------------------- | ---------- |
| AC-1 | Tombol "Unggah CV Lain" terlihat di halaman hasil        | Fungsional |
| AC-2 | Mengklik tombol akan mengarahkan kembali ke layar unggah | Fungsional |
| AC-3 | Hasil sebelumnya dibersihkan dari tampilan               | Fungsional |
| AC-4 | Tidak perlu memuat ulang halaman (transisi mulus)        | UX         |

---

### Epik 4: Penanganan Kesalahan (Error Handling)

#### US-4.1: Menangani Kegagalan Analisis

> **Sebagai** pengguna,
> **Saya ingin** melihat pesan kesalahan yang jelas jika analisis gagal,
> **Sehingga** saya mengerti apa yang salah dan bisa mencoba lagi.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                            | Jenis      |
| ---- | --------------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Jika API Gemini mengembalikan kesalahan, pengguna melihat pesan yang ramah (bukan kesalahan mentah) | Fungsional |
| AC-2 | Pesan kesalahan menyertakan tombol "Coba Lagi"                                                      | UX         |
| AC-3 | Sistem mencatat kesalahan sebenarnya untuk debugging (sisi server)                                  | Teknis     |
| AC-4 | Jika konten file tidak dapat dibaca/kosong, pengguna diberi tahu untuk mengunggah file lain         | Fungsional |

---

#### US-4.2: Menangani Masalah Jaringan

> **Sebagai** pengguna,
> **Saya ingin** aplikasi menangani koneksi jaringan yang lambat atau gagal dengan baik,
> **Sehingga** saya tidak kehilangan progres saya atau melihat kesalahan yang membingungkan.

**Kriteria Penerimaan:**

| #    | Kriteria                                                                                                   | Jenis      |
| ---- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| AC-1 | Jika permintaan unggah kehabisan waktu (timeout) setelah 60 detik, tampilkan pesan kesalahan batas waktu   | Fungsional |
| AC-2 | Jika permintaan analisis kehabisan waktu (timeout) setelah 60 detik, tampilkan pesan kesalahan batas waktu | Fungsional |
| AC-3 | Pengguna dapat mencoba lagi tanpa memilih ulang file                                                       | UX         |

---

## 9. Persyaratan Non-Fungsional (Non-Functional Requirements)

| #     | Persyaratan        | Target                                                                         |
| ----- | ------------------ | ------------------------------------------------------------------------------ |
| NFR-1 | Waktu Respons      | Hasil analisis dikembalikan dalam waktu 30 detik                               |
| NFR-2 | Batas Ukuran File  | Ukuran unggahan maksimal: 5 MB                                                 |
| NFR-3 | Dukungan Browser   | Chrome, Firefox, Safari, Edge (2 versi terbaru)                                |
| NFR-4 | Responsif Seluler  | Dapat digunakan sepenuhnya di layar dengan lebar >= 320px                      |
| NFR-5 | Aksesibilitas      | Kepatuhan WCAG 2.1 Level AA untuk alur inti                                    |
| NFR-6 | Privasi Data       | File yang diunggah tidak disimpan setelah analisis; diproses hanya di memori   |
| NFR-7 | Keamanan Kunci API | Kunci API Gemini hanya disimpan di sisi server; tidak pernah diekspos ke klien |
| NFR-8 | Ketersediaan       | Target uptime 99% untuk MVP                                                    |

---

## 10. Prinsip Desain UI/UX

| Prinsip                         | Panduan                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Utamakan Kesederhanaan          | Maksimal 2 langkah untuk mendapatkan hasil: unggah lalu lihat hasil                    |
| Tanpa Tembok Pendaftaran        | Pengguna dapat menganalisis CV tanpa membuat akun                                      |
| Hierarki Visual yang Jelas      | Skor adalah elemen utama; kekuatan, kelemahan, dan rekomendasi mengikutinya di bawah   |
| Bahasa yang Ramah               | Hindari jargon; gunakan bahasa sehari-hari yang dipahami pengguna non-teknis           |
| Ramah Seluler (Mobile-Friendly) | Tombol yang ramah sentuhan, font yang dapat dibaca, tidak ada pengguliran horizontal   |
| Beban Kognitif Minimal          | Satu tindakan utama per layar; tidak ada bilah sisi atau menu navigasi yang berantakan |

### Konsep Wireframe (3 Layar)

```
HALAMAN UTAMA (LANDING PAGE)
+------------------------------+
|                              |
|    Penganalisis CV           |
|    Dapatkan umpan balik AI   |
|    instan untuk resume Anda  |
|                              |
|   +----------------------+   |
|   |  [ Analisis CV Saya] --+ |
|   +----------------------+   |
+------------------------------+

HALAMAN UNGGAH (UPLOAD PAGE)
+------------------------------+
|                              |
|   + - - - - - - - - - - +   |
|   | Seret dan lepas CV   |   |
|   | Anda di sini, atau   |   |
|   | klik untuk menelusuri|   |
|   |                      |   |
|   | PDF atau DOCX, maks 5MB| |
|   + - - - - - - - - - - +   |
|                              |
|   [ Kembali ]  [ Unggah ]    |
+------------------------------+

HALAMAN HASIL (RESULTS PAGE)
+------------------------------+
|                              |
|          Skor: 72            |
|          "Bagus"             |
|                              |
|  Kekuatan                    |
|  * Pengalaman kerja yang jelas|
|  * Kata kerja tindakan kuat  |
|                              |
|  Kelemahan                   |
|  * Kurangnya pencapaian yang |
|    dapat diukur              |
|  * Tidak ada bagian ringkasan|
|                              |
|  Rekomendasi                 |
|  1. Tambahkan metrik ke poin |
|  2. Sertakan ringkasan       |
|     profesional di bagian atas|
|                              |
|  [Unduh]    [Unggah Lainnya] |
+------------------------------+
```

---

## 11. Skenario Penggunaan (Use Case Scenarios)

### Skenario 1 — Pengguna Pertama Kali (First Time User)

| Langkah | Aksi Pengguna                             | Respons Sistem                                                 |
| ------- | ----------------------------------------- | -------------------------------------------------------------- |
| 1       | Pengguna membuka halaman web CV Analyzer  | Menampilkan halaman utama dengan tombol "Analisis CV Saya"     |
| 2       | Pengguna mengunggah file CV (PDF/DOCX)    | Sistem menerima file, mengekstrak teks, mengirim ke API Gemini |
| 3       | Pengguna melihat hasil analisis           | Menampilkan skor, kekuatan, kelemahan, dan rekomendasi         |
| 4       | Pengguna mengunduh laporan PDF (opsional) | Sistem menghasilkan dan mengunduh file PDF                     |

> **Hasil:** Pengguna mendapatkan umpan balik objektif tentang kualitas CV-nya dalam hitungan detik, tanpa perlu mendaftar.

### Skenario 2 — Perbaikan CV Iteratif (Improve CV)

| Langkah | Aksi Pengguna                                           | Respons Sistem                                          |
| ------- | ------------------------------------------------------- | ------------------------------------------------------- |
| 1       | Pengguna mengunggah CV pertama kali                     | Sistem menampilkan skor **60/100** — "Perlu Perbaikan"  |
| 2       | Pengguna membaca kelemahan dan rekomendasi              | Sistem menunjukkan area spesifik yang perlu diperbaiki  |
| 3       | Pengguna memperbaiki CV berdasarkan rekomendasi         | _(Di luar sistem — pengguna mengedit dokumen CV)_       |
| 4       | Pengguna mengunggah CV yang sudah diperbaiki            | Sistem menampilkan skor baru **78/100** — "Bagus"       |
| 5       | Pengguna membandingkan hasil dengan analisis sebelumnya | Pengguna melihat peningkatan skor dan area yang membaik |

> **Hasil:** Pengguna menggunakan CV Analyzer sebagai alat iteratif untuk terus memperbaiki kualitas CV hingga mencapai skor optimal.

---

## 12. Metrik Keberhasilan (Success Metrics)

| Metrik                          | Target (v1.0 3 Bulan Pertama)      | Referensi |
| ------------------------------- | ---------------------------------- | --------- |
| CV yang dianalisis per bulan    | 500+                               | [1]       |
| Waktu analisis rata-rata        | Kurang dari 15 detik               | [2]       |
| Kepuasan pengguna (umpan balik) | 4.0+ / 5.0                         | [3]       |
| Tingkat kesalahan               | Kurang dari 5% dari upaya unggah   | [4]       |
| Tingkat unduhan laporan         | Lebih dari 30% dari hasil analisis | [5]       |

**Justifikasi Target:**

- **500+ CV/bulan** — Berdasarkan metodologi Lean Startup, MVP tahap awal menargetkan 100–1.000 pengguna aktif per bulan untuk validasi product-market fit [1].
- **< 15 detik** — Gemini Flash API memiliki rata-rata latensi 2–10 detik untuk prompt analisis teks menengah [2], ditambah overhead parsing dokumen dan jaringan.
- **4.0+/5.0** — Rata-rata CSAT industri SaaS B2B berada di 78% (~3.9/5). Skor di atas 80% dianggap excellent [3].
- **< 5% error rate** — Sesuai prinsip Google SRE, layanan non-kritis menargetkan SLO 99%–99.9%, yang berarti error budget 0.1%–1%. Untuk MVP, target 5% sudah konservatif [4].
- **> 30% unduh laporan** — Rata-rata core feature adoption rate SaaS adalah ~24.5% (median 16.5%). Target 30% ambisius namun realistis untuk fitur bernilai tinggi [5].

---

## 13. Rencana Rilis (Release Plan) — Timeline 4 Hari

| Hari | Fase       | Tonggak Pencapaian (Milestone)                                          | Garis Waktu         |
| ---- | ---------- | ----------------------------------------------------------------------- | ------------------- |
| 1    | Fase 1     | Setup Proyek + Inisialisasi Repository + Konfigurasi Database SQL Server | Pagi (08:00–12:00)  |
| 1    | Fase 2     | Backend API (Golang) — Endpoint upload, parsing, dan respons            | Siang (13:00–17:00) |
| 2    | Fase 3     | Layanan AI (Python/FastAPI) + Integrasi Gemini Flash API + Prompt Eng   | Pagi (08:00–12:00)  |
| 2    | Fase 4     | Koneksi Backend ↔ Layanan AI + Testing API End-to-End                   | Siang (13:00–17:00) |
| 3    | Fase 5     | UI Frontend (React + Vite) — Halaman Unggah + Halaman Hasil             | Pagi (08:00–12:00)  |
| 3    | Fase 6     | Integrasi Frontend ↔ Backend + Automation Workflow (n8n)                | Siang (13:00–17:00) |
| 4    | Fase 7     | Fitur Unduh Laporan PDF + Penanganan Kesalahan + Responsif              | Pagi (08:00–12:00)  |
| 4    | Peluncuran | Pengujian End-to-End + Perbaikan Bug + Final Review + Deploy (v1.0)     | Siang (13:00–17:00) |

> **Catatan:** Timeline ini mengasumsikan 4 hari kerja (~8 jam/hari, total ~32 jam kerja). Setiap hari memiliki fokus yang jelas untuk memastikan progres terukur dan kualitas hasil akhir.

---

## Lampiran A: Struktur Respons API (Harapan)

```json
{
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
    "Tambahkan angka dan persentase spesifik ke deskripsi pencapaian Anda (misalnya, Meningkatkan penjualan sebesar 25%)",
    "Sertakan 2-3 kalimat ringkasan profesional di bagian atas CV Anda yang menyoroti kualifikasi utama Anda",
    "Buat bagian keterampilan khusus yang mencantumkan keterampilan teknis dan soft skill yang relevan dengan peran target Anda",
    "Pastikan format yang konsisten di semua bagian (ukuran font, gaya poin, perataan tanggal)"
  ]
}
```

---

## Lampiran B: Glosarium

| Istilah | Definisi                                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| CV      | Curriculum Vitae — dokumen yang merangkum kualifikasi seseorang                                                             |
| NLP     | Natural Language Processing (Pemrosesan Bahasa Alami) — Teknik AI untuk memahami teks                                       |
| LLM     | Large Language Model — Model AI yang dilatih dengan data teks (mis., Gemini)                                                |
| ATS     | Applicant Tracking System (Sistem Pelacakan Pelamar) — perangkat lunak yang digunakan oleh pemberi kerja untuk menyaring CV |
| API     | Application Programming Interface — cara sistem untuk berkomunikasi                                                         |

---

## Daftar Referensi

[1] E. Ries, _The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses_. New York, NY, USA: Crown Business, 2011. [Online]. Available: https://theleanstartup.com

[2] Artificial Analysis, "LLM Leaderboard & Comparison — Gemini Flash Benchmarks," _artificialanalysis.ai_, 2024. [Online]. Available: https://artificialanalysis.ai/leaderboards/quality

[3] SurveySparrow, "CSAT Benchmarks by Industry: What's a Good CSAT Score in 2024?," _surveysparrow.com_, 2024. [Online]. Available: https://surveysparrow.com/blog/csat-benchmarks/

[4] B. Beyer, C. Jones, J. Petoff, and N. R. Murphy, _Site Reliability Engineering: How Google Runs Production Systems_. Sebastopol, CA, USA: O'Reilly Media, 2016. [Online]. Available: https://sre.google/sre-book/table-of-contents/

[5] Userpilot, "Feature Adoption Rate: Benchmarks & How to Improve It," _userpilot.com_, 2024. [Online]. Available: https://userpilot.com/blog/feature-adoption-rate/

[6] Google, "Gemini API Documentation — Google AI for Developers," _ai.google.dev_, 2024. [Online]. Available: https://ai.google.dev/docs

[7] Forbes Human Resources Council, "The State of Job Market Competition and AI in Hiring," _forbes.com_, 2024. [Online]. Available: https://www.forbes.com/sites/forbeshumanresourcescouncil/

[8] Scale.jobs, "How Much Does a Professional Resume Writer Cost?," _scale.jobs_, 2024. [Online]. Available: https://www.scale.jobs/blog/professional-resume-writer-cost

[9] Vite Contributors, "Vite — Next Generation Frontend Tooling," _vitejs.dev_, 2024. [Online]. Available: https://vitejs.dev/guide/

[10] Go Team, "The Go Programming Language — Documentation," _go.dev_, 2024. [Online]. Available: https://go.dev/doc/

[11] S. Ramírez, "FastAPI — Modern, Fast Web Framework for Building APIs with Python," _fastapi.tiangolo.com_, 2024. [Online]. Available: https://fastapi.tiangolo.com

[12] M. Fenniak _et al._, "PyPDF2 — A Pure-Python PDF Library," _pypdf2.readthedocs.io_, 2024. [Online]. Available: https://pypdf2.readthedocs.io/en/latest/

[13] n8n GmbH, "n8n Documentation — Workflow Automation Platform," _docs.n8n.io_, 2024. [Online]. Available: https://docs.n8n.io/

---

_Akhir Dokumen_
