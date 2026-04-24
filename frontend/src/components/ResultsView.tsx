import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Download, FileText, Lightbulb, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { downloadReport } from "@/lib/api-client";
import ScoreGauge from "./ScoreGauge";
import InsightSection from "./InsightSection";

interface ResultsViewProps {
  result: AnalysisResult;
  onUploadAnother: () => void;
}

const ResultsView = ({ result, onUploadAnother }: ResultsViewProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport(result);
    } catch (e) {
      console.error("PDF download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 md:py-14">
      {/* Top meta bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-card p-4 md:flex-row md:items-center md:p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-surface text-cyan">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dokumen Dianalisis
            </p>
            <p className="truncate text-sm font-medium text-white">{result.fileName}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {downloading ? "Membuat PDF..." : "Unduh Laporan PDF"}
          </button>
          <button
            onClick={onUploadAnother}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-surface-hover"
          >
            <RefreshCw className="size-4" />
            Analisis CV Lain
          </button>
        </div>
      </motion.div>

      {/* Score panel */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-8 md:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 size-[400px] rounded-full bg-gradient-radial opacity-60" />
        <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <ScoreGauge score={result.score} label={result.label} />
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
                Diagnosis Sistem
              </p>
              <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                {headline(result)}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
                {summary(result)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniMetric
                label="Kekuatan"
                value={result.strengths.length}
                accent="success"
              />
              <MiniMetric
                label="Kelemahan"
                value={result.weaknesses.length}
                accent="warning"
              />
              <MiniMetric
                label="Saran"
                value={result.recommendations.length}
                accent="cyan"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Insights grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InsightSection
          title="Kekuatan Terdeteksi"
          subtitle="Pertahankan dan tonjolkan elemen-elemen ini"
          items={result.strengths}
          icon={CheckCircle2}
          accent="success"
        />
        <InsightSection
          title="Kelemahan Terdeteksi"
          subtitle="Area dengan potensi peningkatan tertinggi"
          items={result.weaknesses}
          icon={TriangleAlert}
          accent="warning"
        />
      </div>

      <div className="mt-6">
        <InsightSection
          title="Rekomendasi"
          subtitle="Diurutkan dari paling berdampak ke paling tidak berdampak"
          items={result.recommendations}
          icon={Lightbulb}
          accent="cyan"
          numbered
        />
      </div>

      {/* CTA bottom */}
      <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-6 md:flex-row md:p-8">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan">
            Iterasi Berikutnya
          </p>
          <h3 className="mt-2 text-lg font-bold text-white md:text-xl">
            Sudah memperbaiki CV Anda? Pindai ulang untuk melihat peningkatan.
          </h3>
        </div>
        <button
          onClick={onUploadAnother}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan px-5 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
        >
          Pindai CV Baru
          <ArrowUpRight className="size-4" />
        </button>
      </div>
    </main>
  );
};

const MiniMetric = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "warning" | "cyan";
}) => {
  const colorMap = {
    success: "text-success border-success/20 bg-success/[0.06]",
    warning: "text-warning border-warning/20 bg-warning/[0.06]",
    cyan: "text-cyan border-cyan/20 bg-cyan/[0.06]",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[accent]}`}>
      <div className="font-mono text-3xl font-bold tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
};

function headline(r: AnalysisResult) {
  if (r.score >= 70) return "CV Anda menunjukkan posisi kompetitif yang kuat.";
  if (r.score >= 40) return "Fondasi yang baik — beberapa penajaman akan meningkatkan dampak.";
  return "CV Anda memerlukan perbaikan signifikan untuk lolos saringan awal.";
}

function summary(r: AnalysisResult) {
  const t = r.strengths.length + r.weaknesses.length;
  return `Sistem mengevaluasi ${t} sinyal kualitas dan menghasilkan ${r.recommendations.length} rekomendasi yang diprioritaskan berdasarkan dampak terhadap peluang wawancara.`;
}

export default ResultsView;