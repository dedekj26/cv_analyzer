import type { AnalysisResult, AnalysisLabel } from "./types";

const MOCK_VARIANTS: Omit<AnalysisResult, "fileName" | "analyzedAt">[] = [
  {
    score: 72,
    label: "Bagus",
    strengths: [
      "Riwayat kerja kronologis yang jelas dengan jabatan pekerjaan yang relevan",
      "Penggunaan kata kerja tindakan yang efektif dalam deskripsi pengalaman",
      "Bagian pendidikan terstruktur dengan baik dengan detail yang relevan",
      "Format dokumen rapi dan mudah dipindai oleh ATS",
    ],
    weaknesses: [
      "Poin-poin kurang memiliki pencapaian dan metrik yang dapat diukur",
      "Tidak ada ringkasan profesional di bagian atas dokumen",
      "Bagian keterampilan tidak ditempatkan secara menonjol",
      "Beberapa deskripsi pekerjaan terlalu umum dan tidak spesifik",
    ],
    recommendations: [
      "Tambahkan angka dan persentase spesifik ke deskripsi pencapaian Anda (mis., \"Meningkatkan penjualan sebesar 25%\")",
      "Sertakan 2–3 kalimat ringkasan profesional di bagian atas CV yang menyoroti kualifikasi utama Anda",
      "Buat bagian keterampilan khusus yang mencantumkan keterampilan teknis dan soft skill",
      "Pastikan format yang konsisten di semua bagian (ukuran font, gaya poin, perataan tanggal)",
      "Gunakan kata kunci dari deskripsi pekerjaan target untuk meningkatkan kompatibilitas ATS",
    ],
  },
  {
    score: 58,
    label: "Perlu Perbaikan",
    strengths: [
      "Informasi kontak lengkap dan mudah ditemukan",
      "Latar belakang pendidikan yang relevan dengan industri target",
      "Pengalaman magang yang menunjukkan inisiatif",
    ],
    weaknesses: [
      "Skor kepadatan kata kunci sangat rendah untuk peran yang diincar",
      "Tidak ada metrik kuantitatif sama sekali pada bagian pengalaman",
      "Format tanggal tidak konsisten antar bagian",
      "Bagian \"Tujuan Karir\" terlalu generik dan klise",
      "Tata letak satu kolom membuang-buang ruang halaman",
    ],
    recommendations: [
      "Ganti \"Tujuan Karir\" dengan ringkasan profesional yang menyoroti dampak terukur",
      "Tambahkan minimal 1 metrik per poin pengalaman (misalnya angka, persentase, atau skala tim)",
      "Standarkan format tanggal ke MM/YYYY di seluruh dokumen",
      "Pertimbangkan tata letak dua kolom untuk memaksimalkan ruang halaman pertama",
      "Sertakan bagian \"Proyek\" untuk menampilkan kemampuan teknis Anda",
    ],
  },
  {
    score: 86,
    label: "Luar Biasa",
    strengths: [
      "Ringkasan profesional yang ringkas dan berdampak di bagian atas",
      "Setiap poin pengalaman memiliki metrik yang dapat diukur",
      "Pemilihan kata kerja tindakan yang variatif dan kuat",
      "Bagian keterampilan terorganisasi dengan baik dan relevan",
      "Kepadatan kata kunci optimal untuk industri target",
    ],
    weaknesses: [
      "Bagian sertifikasi dapat ditambahkan untuk memperkuat kredibilitas",
      "Beberapa singkatan industri tidak dijelaskan untuk pembaca non-spesialis",
    ],
    recommendations: [
      "Tambahkan bagian \"Sertifikasi & Penghargaan\" jika tersedia",
      "Pertimbangkan menambahkan tautan portfolio atau LinkedIn yang aktif",
      "Definisikan singkatan industri pada penggunaan pertama untuk memperluas audiens",
    ],
  },
];

function labelFor(score: number): AnalysisLabel {
  if (score >= 70) return "Luar Biasa";
  if (score >= 40) return "Bagus";
  return "Perlu Perbaikan";
}

/**
 * Mock analyzer simulating the Gemini Flash backend.
 * Returns a deterministic-ish result based on file name hash so users
 * see different results when re-uploading.
 * NOTE: In production this should call /api/analyze on the Golang backend.
 */
export function analyzeCV(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const delay = 2400 + Math.random() * 1800;
    setTimeout(() => {
      // Tiny chance of simulated failure to demo error state
      if (file.name.toLowerCase().includes("fail")) {
        reject(new Error("Layanan AI sedang sibuk. Silakan coba lagi."));
        return;
      }
      const hash = Array.from(file.name).reduce((a, c) => a + c.charCodeAt(0), 0);
      const variant = MOCK_VARIANTS[hash % MOCK_VARIANTS.length];
      // small jitter on score (+/- 4) keeping in label band
      const jitter = (hash % 9) - 4;
      const score = Math.max(0, Math.min(100, variant.score + jitter));
      resolve({
        ...variant,
        score,
        label: labelFor(score),
        fileName: file.name,
        analyzedAt: new Date().toISOString(),
      });
    }, delay);
  });
}