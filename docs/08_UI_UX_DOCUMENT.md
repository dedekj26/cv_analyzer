# Dokumen UI/UX
# CV Analyzer v1.0

---

## 1. Filosofi Desain

CV Analyzer dirancang untuk membuat analisis CV yang didukung AI terasa **mudah, cepat, dan tidak mengintimidasi**. Setiap keputusan desain diambil untuk mengurangi gesekan dan mempercepat waktu menuju nilai (time-to-value).

| Prinsip | Penjelasan |
|---|---|
| **Dua Langkah Menuju Hasil** | Unggah → Lihat Hasil. Tidak lebih. |
| **Tanpa Pendaftaran** | Nilai diberikan lebih dulu, bukan di balik tembok registrasi |
| **Hierarki yang Tegas** | Satu fokus per layar, elemen utama selalu menonjol |
| **Bahasa Manusiawi** | Hindari jargon teknis, gunakan bahasa sehari-hari |
| **Umpan Balik Instan** | Setiap aksi pengguna mendapat respons visual segera |

---

## 2. Sistem Desain (Design System)

### 2.1. Palet Warna

| Peran | Warna | Hex | Penggunaan |
|---|---|---|---|
| Primary | Biru Indigo | `#4F46E5` | CTA button, link, aksen utama |
| Primary Hover | Biru Indigo Gelap | `#4338CA` | Hover state tombol utama |
| Success | Hijau Emerald | `#10B981` | Skor tinggi, bagian kekuatan |
| Warning | Amber | `#F59E0B` | Skor sedang |
| Danger | Merah Rose | `#EF4444` | Skor rendah, bagian kelemahan, error |
| Info | Biru Sky | `#3B82F6` | Bagian rekomendasi |
| Background | Abu Sangat Terang | `#F9FAFB` | Background utama halaman |
| Surface | Putih | `#FFFFFF` | Card, container |
| Text Primary | Abu Gelap | `#111827` | Heading, body text utama |
| Text Secondary | Abu Medium | `#6B7280` | Subtitle, keterangan |
| Border | Abu Terang | `#E5E7EB` | Garis pembatas, border card |
| Dropzone Hover | Biru Terang | `#EEF2FF` | Background saat drag-over |

### 2.2. Tipografi

| Elemen | Font | Ukuran | Berat | Warna |
|---|---|---|---|---|
| H1 (Hero heading) | Inter | 36px / 2.25rem | 800 (ExtraBold) | `#111827` |
| H2 (Section heading) | Inter | 24px / 1.5rem | 700 (Bold) | `#111827` |
| H3 (Card heading) | Inter | 18px / 1.125rem | 600 (SemiBold) | `#111827` |
| Body | Inter | 16px / 1rem | 400 (Regular) | `#374151` |
| Small/Caption | Inter | 14px / 0.875rem | 400 (Regular) | `#6B7280` |
| Skor (angka besar) | Inter | 72px / 4.5rem | 800 (ExtraBold) | Sesuai kategori |
| Label skor | Inter | 20px / 1.25rem | 600 (SemiBold) | `#6B7280` |
| Button text | Inter | 16px / 1rem | 600 (SemiBold) | `#FFFFFF` |

### 2.3. Spacing & Layout

| Token | Nilai | Penggunaan |
|---|---|---|
| `space-xs` | 4px | Gap internal minimal |
| `space-sm` | 8px | Padding ikon, gap kecil |
| `space-md` | 16px | Padding card internal |
| `space-lg` | 24px | Gap antar section |
| `space-xl` | 32px | Padding container utama |
| `space-2xl` | 48px | Gap antar halaman section |
| `max-width` | 720px | Lebar maksimal konten utama |
| `border-radius` | 12px | Sudut rounded card/button |
| `border-radius-lg` | 16px | Sudut rounded card besar |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | Shadow card ringan |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` | Shadow card utama |

### 2.4. Komponen UI

#### Tombol (Buttons)

| Varian | Background | Text | Border | Penggunaan |
|---|---|---|---|---|
| Primary | `#4F46E5` | Putih | — | CTA utama (Analisis, Unggah) |
| Secondary | Putih | `#4F46E5` | `1px solid #4F46E5` | Aksi sekunder (Kembali) |
| Danger | `#EF4444` | Putih | — | Aksi destruktif (jika ada) |
| Ghost | Transparan | `#6B7280` | — | Link-style button |
| Disabled | `#E5E7EB` | `#9CA3AF` | — | Tombol tidak aktif |

**States:** Hover (gelap 10%), Active (gelap 20%), Focus (ring 3px `#818CF8`), Disabled (opacity 50%)

#### Card

```
┌─────────────────────────────────┐
│  [Icon]  Judul Card             │  ← Header dengan ikon + warna aksen
│─────────────────────────────────│
│                                 │
│  • Item 1                       │  ← Konten (list items)
│  • Item 2                       │
│  • Item 3                       │
│                                 │
└─────────────────────────────────┘
```

- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border-radius: `12px`
- Padding: `24px`
- Shadow: `shadow-sm`
- Header strip warna: 4px top border sesuai kategori

#### Error Alert

```
┌─ ⚠️ ──────────────────────────────┐
│                                    │
│  Pesan kesalahan yang jelas di     │
│  sini, menjelaskan apa yang salah. │
│                                    │
│  [ Coba Lagi ]                     │
│                                    │
└────────────────────────────────────┘
```

- Background: `#FEF2F2`
- Border: `1px solid #FECACA`
- Text: `#991B1B`
- Border-radius: `8px`

---

## 3. Spesifikasi Halaman

### 3.1. Halaman Utama (Landing Page)

**Tujuan:** Menjelaskan nilai produk dan mendorong pengguna untuk memulai analisis.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│          ┌──────────────────────────────┐             │
│          │                              │             │
│          │      🔍  CV Analyzer         │             │
│          │                              │             │
│          │  Dapatkan umpan balik AI     │             │
│          │  instan untuk resume Anda    │             │
│          │                              │             │
│          │  Unggah CV Anda dan terima   │             │
│          │  analisis profesional dalam  │             │
│          │  hitungan detik — gratis.    │             │
│          │                              │             │
│          │  ┌──────────────────────┐    │             │
│          │  │  Analisis CV Saya →  │    │             │
│          │  └──────────────────────┘    │             │
│          │                              │             │
│          │  ✓ Tanpa pendaftaran         │             │
│          │  ✓ Hasil dalam 15 detik      │             │
│          │  ✓ 100% gratis               │             │
│          │                              │             │
│          └──────────────────────────────┘             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| Background | Gradien halus: `#F9FAFB` → `#EEF2FF` |
| Hero Card | Putih, `shadow-md`, `border-radius-lg`, centered, max-width 480px |
| Logo/Heading | "CV Analyzer" — H1, 36px, ExtraBold |
| Subtitle | Deskripsi 2 baris, 16px, `#6B7280` |
| CTA Button | Primary button full-width dalam card, height 48px |
| Trust signals | 3 bullet points dengan ikon centang hijau |
| Navigasi | Tidak ada — single focus page |

**Interaksi:**
- CTA button → navigasi ke `/upload`
- Hover pada CTA: warna gelap + shadow naik
- Entrance animation: fade-in 300ms dari bawah

---

### 3.2. Halaman Unggah (Upload Page)

**Tujuan:** Menerima file CV dari pengguna dengan cara termudah.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   ← Kembali                                         │
│                                                      │
│          ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐             │
│          │                              │             │
│          │        ☁️ (ikon upload)       │             │
│          │                              │             │
│          │  Seret dan lepas CV Anda     │             │
│          │  di sini                     │             │
│          │                              │             │
│          │  atau klik untuk menelusuri  │             │
│          │                              │             │
│          │  PDF atau DOCX, maks 5 MB   │             │
│          └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘             │
│                                                      │
│          ┌─ Error (jika ada) ──────────┐             │
│          │ ⚠️ Pesan kesalahan         │             │
│          └─────────────────────────────┘             │
│                                                      │
│          Nama file: resume_2026.pdf ✓                │
│                                                      │
│          ┌───────────┐  ┌─────────────┐             │
│          │  Kembali   │  │   Unggah →  │             │
│          └───────────┘  └─────────────┘             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| Dropzone | Border: `2px dashed #D1D5DB`, padding 48px, border-radius 12px |
| Dropzone (drag-over) | Border: `2px dashed #4F46E5`, background `#EEF2FF` |
| Dropzone (file selected) | Border: `2px solid #10B981`, background `#ECFDF5` |
| Upload icon | Cloud-upload, 48px, `#9CA3AF` (normal), `#4F46E5` (drag) |
| Teks utama | "Seret dan lepas CV Anda di sini" — 18px, SemiBold |
| Teks sekunder | "atau klik untuk menelusuri" — 14px, Regular, `#6B7280` |
| Teks format | "PDF atau DOCX, maks 5 MB" — 12px, Regular, `#9CA3AF` |
| Error alert | Muncul di bawah dropzone, inline, `role="alert"` |
| File info | Nama file + ikon centang hijau setelah file dipilih |
| Tombol Kembali | Secondary button |
| Tombol Unggah | Primary button, disabled sampai file valid dipilih |

**Interaksi & Animasi:**
- Drag enter: border animasi ke biru, background fade ke `#EEF2FF` (200ms)
- Drag leave: kembali ke normal (200ms)
- File selected: centang hijau fade-in, nama file slide-in
- Error: alert slide-down 300ms, `role="alert"` untuk screen reader
- Klik dropzone: buka native file picker
- Tombol "Unggah" disabled (abu) sampai file valid terpilih

---

### 3.3. Halaman Loading / Analisis

**Tujuan:** Memberikan feedback visual bahwa sistem sedang memproses.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│              ⟳ (spinner animasi)                     │
│                                                      │
│          Menganalisis CV Anda...                     │
│                                                      │
│          Ini biasanya membutuhkan                    │
│          waktu 10-15 detik                           │
│                                                      │
│          ████████████░░░░░░ 65%                      │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| Spinner | CSS animation, `border-4 border-indigo-200`, `border-t-indigo-600`, rotate 1s |
| Teks utama | "Menganalisis CV Anda..." — 20px, SemiBold |
| Teks estimasi | "Ini biasanya membutuhkan waktu 10-15 detik" — 14px, `#6B7280` |
| Progress bar | Indeterminate/pseudo-progress, gradien biru |
| Tombol upload | Disabled selama analisis (US-2.1 AC-5) |

---

### 3.4. Halaman Hasil (Results Page)

**Tujuan:** Menampilkan hasil analisis dengan hierarki visual yang jelas, skor sebagai elemen hero.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Hasil Analisis CV Anda                             │
│                                                      │
│          ┌──────────────────────────┐                │
│          │                          │                │
│          │          72              │  ← Skor besar  │
│          │         Bagus            │  ← Label       │
│          │                          │                │
│          └──────────────────────────┘                │
│                                                      │
│   ┌─ ✅ Kekuatan ──────────────────────────┐         │
│   │  • Riwayat kerja kronologis yang jelas │         │
│   │  • Penggunaan kata kerja tindakan...   │         │
│   │  • Bagian pendidikan terstruktur...    │         │
│   └────────────────────────────────────────┘         │
│                                                      │
│   ┌─ ⚠️ Kelemahan ─────────────────────────┐         │
│   │  • Kurang pencapaian yang dapat diukur │         │
│   │  • Tidak ada ringkasan profesional     │         │
│   │  • Bagian keterampilan tidak ada       │         │
│   └────────────────────────────────────────┘         │
│                                                      │
│   ┌─ 💡 Rekomendasi ──────────────────────┐         │
│   │  1. Tambahkan angka dan persentase...  │         │
│   │  2. Sertakan ringkasan profesional...  │         │
│   │  3. Buat bagian keterampilan khusus... │         │
│   └────────────────────────────────────────┘         │
│                                                      │
│   ┌─────────────┐  ┌──────────────────┐             │
│   │ Unduh PDF ↓ │  │ Unggah CV Lain → │             │
│   └─────────────┘  └──────────────────┘             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| **Skor Badge** | Lingkaran 160px, font 72px ExtraBold, warna sesuai kategori |
| Warna skor 0–39 | Background `#FEF2F2`, angka `#EF4444`, label "Perlu Perbaikan" |
| Warna skor 40–59 | Background `#FFFBEB`, angka `#F59E0B`, label "Cukup" |
| Warna skor 60–79 | Background `#ECFDF5`, angka `#10B981`, label "Bagus" |
| Warna skor 80–100 | Background `#ECFDF5`, angka `#059669`, label "Luar Biasa" |
| **Card Kekuatan** | Top border: `4px solid #10B981`, ikon ✅ |
| **Card Kelemahan** | Top border: `4px solid #F59E0B`, ikon ⚠️ |
| **Card Rekomendasi** | Top border: `4px solid #3B82F6`, ikon 💡 |
| List items | Padding 8px per item, font 15px |
| Tombol Unduh | Secondary button dengan ikon download |
| Tombol Unggah Lain | Primary button |

**Animasi Masuk (Entrance):**
1. Skor: count-up animation 0 → 72 selama 1 detik
2. Label: fade-in setelah skor selesai (delay 1s)
3. Card Kekuatan: slide-up + fade-in (delay 1.2s)
4. Card Kelemahan: slide-up + fade-in (delay 1.4s)
5. Card Rekomendasi: slide-up + fade-in (delay 1.6s)
6. Tombol: fade-in (delay 1.8s)

---

## 4. Responsivitas

### Breakpoint & Adaptasi

| Breakpoint | Layout | Perubahan |
|---|---|---|
| **≥ 1024px** (Desktop) | Konten terpusat `max-width: 720px` | Spacing optimal, hover effects aktif |
| **640px – 1023px** (Tablet) | Konten `max-width: 640px`, padding 24px | Sedikit lebih sempit |
| **320px – 639px** (Mobile) | Full width, padding 16px | Tombol full-width, skor 56px, card stack vertikal |

### Adaptasi Per Komponen

| Komponen | Desktop | Mobile |
|---|---|---|
| Skor angka | 72px | 56px |
| Card padding | 24px | 16px |
| Button | `width: auto`, side-by-side | `width: 100%`, stacked |
| Dropzone | padding 48px | padding 24px |
| H1 | 36px | 28px |
| Body text | 16px | 15px |

---

## 5. Animasi & Mikrointeraksi

| Trigger | Animasi | Durasi | Easing |
|---|---|---|---|
| Page load | Fade-in dari bawah | 300ms | ease-out |
| Button hover | Background gelap 10%, shadow naik | 200ms | ease |
| Button click | Scale 0.97 lalu kembali | 150ms | ease-in-out |
| Drag enter dropzone | Border → biru, bg → `#EEF2FF` | 200ms | ease |
| File dipilih | Centang hijau fade-in | 300ms | ease |
| Error muncul | Slide-down + fade-in | 300ms | ease-out |
| Skor muncul | Count-up 0 → N | 1000ms | ease-out |
| Card hasil muncul | Slide-up + fade-in (staggered 200ms) | 400ms | ease-out |
| Loading spinner | Rotate continuous | 1000ms | linear |

---

## 6. Aksesibilitas (WCAG 2.1 Level AA)

### 6.1. Persyaratan

| # | Persyaratan | Implementasi |
|---|---|---|
| 1 | **Kontras warna ≥ 4.5:1** | Text `#111827` pada `#F9FAFB` = rasio 15.4:1 ✓ |
| 2 | **Keyboard navigable** | Semua elemen interaktif dapat dijangkau via Tab |
| 3 | **Focus visible** | Ring `3px solid #818CF8` pada elemen yang difokuskan |
| 4 | **ARIA labels** | `aria-label` pada dropzone, tombol tanpa teks, dsb. |
| 5 | **Role alerts** | Error messages menggunakan `role="alert"` (live region) |
| 6 | **Semantic HTML** | `<main>`, `<section>`, `<h1>`–`<h3>`, `<button>`, `<ul>` |
| 7 | **Alt text** | Semua ikon dekoratif `aria-hidden="true"` |
| 8 | **Ukuran target sentuh** | Minimum 44x44px untuk tombol dan area klik mobile |
| 9 | **Skip to content** | Link tersembunyi untuk keyboard users (opsional v1) |
| 10 | **Reduced motion** | Hormati `prefers-reduced-motion` — skip animasi |

### 6.2. Contoh ARIA

```html
<!-- Dropzone -->
<div role="button" aria-label="Area unggah file CV" tabindex="0">

<!-- Error -->
<div role="alert" aria-live="assertive">
  Ukuran file melebihi batas maksimal 5 MB.
</div>

<!-- Skor -->
<div role="status" aria-label="Skor kualitas CV: 72 dari 100, kategori Bagus">

<!-- Loading -->
<div role="status" aria-label="Sedang menganalisis CV Anda">
  <span class="sr-only">Memproses, mohon tunggu...</span>
</div>
```

---

## 7. Spesifikasi Laporan PDF

| Elemen | Spesifikasi |
|---|---|
| Ukuran halaman | A4 (210mm × 297mm) |
| Margin | 20mm semua sisi |
| Font | Helvetica (built-in PDF) |
| Header | "Laporan Analisis CV" + tanggal + logo text |
| Skor | Angka besar 36pt, warna sesuai kategori |
| Bagian | Kekuatan, Kelemahan, Rekomendasi dengan header berwarna |
| Footer | "Dibuat oleh CV Analyzer — cvanalyzer.id" + nomor halaman |
| Nama file | `Laporan_Analisis_CV_YYYY-MM-DD.pdf` |

---

## 8. Daftar ID Elemen untuk Testing

Setiap elemen interaktif memiliki ID unik untuk memudahkan QA automation:

| ID | Elemen | Halaman |
|---|---|---|
| `#cta-analyze` | Tombol "Analisis CV Saya" | Landing |
| `#dropzone` | Area drag-and-drop | Upload |
| `#file-input` | Input file tersembunyi | Upload |
| `#btn-back` | Tombol Kembali | Upload |
| `#btn-upload` | Tombol Unggah | Upload |
| `#error-message` | Container pesan error | Upload |
| `#score-display` | Skor angka besar | Results |
| `#score-label` | Label kategori skor | Results |
| `#strengths-list` | Daftar kekuatan | Results |
| `#weaknesses-list` | Daftar kelemahan | Results |
| `#recommendations-list` | Daftar rekomendasi | Results |
| `#btn-download` | Tombol Unduh Laporan | Results |
| `#btn-upload-another` | Tombol Unggah CV Lain | Results |
| `#loading-spinner` | Indikator loading | Loading |

---

*Akhir Dokumen*
