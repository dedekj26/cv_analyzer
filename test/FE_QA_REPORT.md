# Laporan Hasil Pengujian QA Frontend
**Tanggal:** 24 April 2026  
**Cakupan:** Frontend Web App (`d:\cv_analyzer\frontend`)  
**Referensi:** `docs/08_UI_UX_DOCUMENT.md`  
**Status Keseluruhan:** ❌ **GAGAL (FAILED)**

---

## Ringkasan Eksekutif

Pengujian *End-to-End* dan analisis kode statis telah dilakukan pada komponen frontend aplikasi CV Analyzer. Hasilnya menunjukkan deviasi (penyimpangan) yang sangat signifikan antara kode yang diimplementasikan dengan spesifikasi pada Dokumen UI/UX yang telah disetujui. Terdapat banyak ID otomasi yang hilang dan perubahan desain secara keseluruhan.

## Matriks Temuan QA (QA Defect Matrix)

| # | Kategori | Ekspektasi (Sesuai UI/UX Doc) | Aktual (Di Kode Frontend) | Status | Keparahan |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | **Sistem Desain (Tema)** | Halaman Landing menggunakan *Dark Navy*, sedangkan Halaman Upload & Hasil menggunakan *Light Background* (`#F9FAFB`) dengan teks gelap. | Seluruh komponen aplikasi menggunakan **Tema Gelap (Dark Mode)** secara *hardcoded* (`text-white`, `bg-card` gelap, `border-white/[0.06]`). | ❌ FAILED | Tinggi |
| **2** | **ID Otomasi (Upload)** | Elemen wajib memiliki ID: `#dropzone`, `#file-input`, `#btn-back`, `#btn-upload`, `#error-message`. | Tidak ada satupun ID tersebut di `UploadZone.tsx`. Input menggunakan `ref` internal. | ❌ FAILED | Kritis (Blocker) |
| **3** | **ID Otomasi (Hasil)** | Elemen wajib memiliki ID: `#score-display`, `#btn-download`, `#btn-upload-another`, dll. | Tidak ada ID yang disematkan di `ResultsView.tsx` dan `ScoreGauge.tsx`. | ❌ FAILED | Kritis (Blocker) |
| **4** | **Alur Pengguna (Landing)** | Harus ada tombol CTA besar **"Analisis CV Saya"** yang menavigasi pengguna ke halaman unggah. | Tidak ada tombol navigasi. `Hero.tsx` langsung menyematkan (embed) komponen `UploadZone`. | ❌ FAILED | Sedang |
| **5** | **Alur Pengguna (Upload)** | Terdapat 2 tombol: "Kembali" (batal) dan "Unggah" (manual). | Menggunakan mekanisme **Auto-Upload**. Begitu file dipilih/di-drop, langsung terkirim. Tidak ada tombol konfirmasi. | ❌ FAILED | Sedang |
| **6** | **Aksesibilitas (A11y)** | Area Dropzone wajib memiliki atribut `aria-label="Area unggah file CV"`. | Label dropzone di `UploadZone.tsx` tidak memiliki atribut `aria-label`. | ❌ FAILED | Rendah |
| **7** | **Aksesibilitas (Error)** | Pesan kesalahan menggunakan `role="alert"` (live region) untuk *screen reader*. | Atribut `role="alert"` **sudah diimplementasikan** dengan baik pada pesan error di baris 111 `UploadZone.tsx`. | ✅ PASSED | - |

---

## Rekomendasi & Tindakan (Action Items)

Mengingat UI saat ini (dengan efek *Framer Motion* dan *Dark Mode*) memiliki nilai estetika yang tinggi meskipun tidak sesuai dengan dokumen awal, tim pengembangan harus memutuskan salah satu dari dua langkah berikut:

1. **Opsi A (Refactor Kode):** Mengubah kode `React` agar 100% patuh pada dokumen UI/UX saat ini (Mengubah ke *Light Mode*, menambahkan tombol manual, menyematkan ID QA).
2. **Opsi B (Revisi Dokumen):** Mempertahankan kode UI yang sudah bagus ini, namun kita **wajib merevisi dokumen** `08_UI_UX_DOCUMENT.md` agar mencerminkan desain *Dark Mode* dan alur *Auto-Upload*, serta menyisipkan perbaikan ID QA (Point 2, 3, dan 6) ke dalam kode yang ada saat ini.

---
*Laporan di-generate oleh Sistem QA Otomatis.*
