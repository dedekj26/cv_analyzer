"""
Prompt Engineering — Template prompt untuk analisis CV menggunakan Gemini.
Prompt dirancang agar Gemini mengembalikan output JSON terstruktur.
"""


def build_cv_analysis_prompt(cv_text: str) -> str:
    """
    Membangun prompt terstruktur untuk analisis CV.

    Prompt ini menginstruksikan Gemini untuk:
    1. Mengevaluasi kualitas CV secara keseluruhan (skor 0-100)
    2. Mengidentifikasi kekuatan spesifik
    3. Mengidentifikasi kelemahan spesifik
    4. Memberikan rekomendasi yang actionable

    Args:
        cv_text: Teks mentah yang diekstrak dari CV.

    Returns:
        Prompt lengkap yang siap dikirim ke Gemini API.
    """

    prompt = f"""Kamu adalah seorang **Konsultan Karier Senior** dan **Pakar Penulisan CV Profesional** 
dengan pengalaman lebih dari 15 tahun meninjau ribuan resume/CV untuk berbagai industri.

## TUGAS
Analisis CV/Resume berikut secara menyeluruh dan berikan evaluasi profesional.

## CV YANG DIANALISIS
---
{cv_text}
---

## INSTRUKSI ANALISIS

Evaluasi CV berdasarkan kriteria berikut:

1. **Struktur & Format** (20%): Apakah CV terorganisir dengan baik? Apakah ada hierarki yang jelas?
2. **Konten & Substansi** (30%): Apakah pengalaman kerja dideskripsikan dengan baik? Apakah ada pencapaian terukur?
3. **Relevansi & Keterampilan** (20%): Apakah keterampilan dan pengalaman relevan? Apakah ada bagian keterampilan?
4. **Bahasa & Penulisan** (15%): Apakah menggunakan kata kerja tindakan? Apakah deskripsi spesifik?
5. **Kelengkapan** (15%): Apakah ada ringkasan profesional, pendidikan, kontak, dll?

## ATURAN PENILAIAN SKOR
- **0-39**: "Kurang" — CV memiliki banyak masalah fundamental
- **40-59**: "Cukup" — CV memenuhi standar dasar tapi banyak yang bisa diperbaiki
- **60-79**: "Bagus" — CV solid dengan beberapa area yang bisa ditingkatkan
- **80-100**: "Sangat Bagus" — CV sangat profesional dan kompetitif

## ATURAN OUTPUT
- Berikan **3 hingga 7 poin** untuk masing-masing kekuatan, kelemahan, dan rekomendasi
- Setiap poin harus **spesifik** dan merujuk pada konten aktual CV (bukan saran generik)
- Rekomendasi harus **actionable** — pengguna harus tahu persis apa yang harus dilakukan
- Urutkan rekomendasi dari yang **paling berdampak** ke yang paling tidak berdampak

## FORMAT OUTPUT (JSON STRICT)
Kembalikan HANYA objek JSON berikut, tanpa teks tambahan, tanpa markdown code block:

{{
  "score": <angka 0-100>,
  "label": "<Kurang|Cukup|Bagus|Sangat Bagus>",
  "strengths": [
    "<kekuatan spesifik 1>",
    "<kekuatan spesifik 2>",
    "<kekuatan spesifik 3>"
  ],
  "weaknesses": [
    "<kelemahan spesifik 1>",
    "<kelemahan spesifik 2>",
    "<kelemahan spesifik 3>"
  ],
  "recommendations": [
    "<rekomendasi actionable 1>",
    "<rekomendasi actionable 2>",
    "<rekomendasi actionable 3>"
  ]
}}

PENTING: Kembalikan HANYA JSON murni. Tidak ada penjelasan tambahan, tidak ada markdown."""

    return prompt
