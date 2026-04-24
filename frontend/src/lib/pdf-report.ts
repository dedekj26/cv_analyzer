import { jsPDF } from "jspdf";
import type { AnalysisResult } from "./types";

const CYAN: [number, number, number] = [0, 229, 255];
const VOID: [number, number, number] = [5, 7, 10];
const ZINC_300: [number, number, number] = [212, 218, 226];
const ZINC_500: [number, number, number] = [138, 146, 166];
const SUCCESS: [number, number, number] = [34, 211, 145];
const WARNING: [number, number, number] = [250, 176, 30];

function scoreColor(score: number): [number, number, number] {
  if (score >= 70) return SUCCESS;
  if (score >= 40) return WARNING;
  return [239, 68, 68];
}

export function generatePdfReport(result: AnalysisResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;

  // Background
  doc.setFillColor(...VOID);
  doc.rect(0, 0, W, H, "F");

  // Header bar
  doc.setFillColor(10, 14, 23);
  doc.rect(0, 0, W, 64, "F");
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.5);
  doc.line(0, 64, W, 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("OptimaCV", M, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...ZINC_500);
  doc.text("LAPORAN ANALISIS CV", W - M, 32, { align: "right" });
  doc.setFontSize(8);
  doc.text(new Date(result.analyzedAt).toLocaleString("id-ID"), W - M, 46, { align: "right" });

  // File name
  let y = 96;
  doc.setFontSize(9);
  doc.setTextColor(...ZINC_500);
  doc.text("DOKUMEN", M, y);
  y += 14;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(result.fileName, M, y);

  // Score block
  y += 32;
  doc.setFillColor(10, 14, 23);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(1);
  doc.roundedRect(M, y, W - M * 2, 110, 8, 8, "FD");

  const [sr, sg, sb] = scoreColor(result.score);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(56);
  doc.setTextColor(sr, sg, sb);
  doc.text(String(result.score), M + 24, y + 78);
  doc.setFontSize(14);
  doc.setTextColor(...ZINC_500);
  doc.text("/100", M + 24 + doc.getTextWidth(String(result.score)) + 8, y + 78);

  doc.setFontSize(10);
  doc.setTextColor(...ZINC_500);
  doc.text("SKOR KUALITAS KESELURUHAN", M + 24, y + 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(sr, sg, sb);
  doc.text(result.label, W - M - 24, y + 56, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ZINC_500);
  doc.text("Diagnosis Sistem", W - M - 24, y + 72, { align: "right" });

  y += 142;

  const drawSection = (
    title: string,
    subtitle: string,
    items: string[],
    accent: [number, number, number],
    numbered = false,
  ) => {
    if (y > H - 120) {
      doc.addPage();
      doc.setFillColor(...VOID);
      doc.rect(0, 0, W, H, "F");
      y = 56;
    }
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(M, y, 3, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), M + 12, y + 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...ZINC_500);
    doc.text(subtitle, W - M, y + 11, { align: "right" });
    y += 24;

    doc.setFontSize(10);
    items.forEach((item, idx) => {
      const marker = numbered ? `${String(idx + 1).padStart(2, "0")}` : "—";
      const lines = doc.splitTextToSize(item, W - M * 2 - 28);
      const blockH = lines.length * 13 + 8;
      if (y + blockH > H - 56) {
        doc.addPage();
        doc.setFillColor(...VOID);
        doc.rect(0, 0, W, H, "F");
        y = 56;
      }
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(marker, M, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...ZINC_300);
      doc.text(lines, M + 28, y + 10);
      y += blockH;
    });
    y += 14;
  };

  drawSection("Kekuatan", `${result.strengths.length} terdeteksi`, result.strengths, SUCCESS);
  drawSection("Kelemahan", `${result.weaknesses.length} terdeteksi`, result.weaknesses, WARNING);
  drawSection(
    "Rekomendasi",
    `${result.recommendations.length} item — diurutkan berdasarkan dampak`,
    result.recommendations,
    CYAN,
    true,
  );

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...ZINC_500);
    doc.text(
      `OptimaCV · Penganalisis CV Berbasis AI · Halaman ${i} dari ${pageCount}`,
      W / 2,
      H - 24,
      { align: "center" },
    );
  }

  const stamp = new Date(result.analyzedAt).toISOString().slice(0, 10);
  doc.save(`Laporan_Analisis_CV_${stamp}.pdf`);
}