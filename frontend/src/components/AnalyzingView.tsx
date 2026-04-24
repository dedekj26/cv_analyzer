import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

const STEPS = [
  "Mengekstrak teks dari dokumen",
  "Memvalidasi struktur & kepatuhan ATS",
  "Mengidentifikasi metrik dampak",
  "Menyusun rekomendasi prioritas",
];

const AnalyzingView = ({ file }: { file: File }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 py-16 md:px-10 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col items-center gap-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/[0.08] px-3 py-1.5">
          <div className="size-2 animate-pulse rounded-full bg-cyan" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan">
            Analisis Sedang Berjalan
          </span>
        </div>

        <h1 className="max-w-2xl text-center text-3xl font-bold tracking-tight text-white md:text-5xl">
          Memindai dokumen Anda dengan AI Gemini
        </h1>

        {/* Scanner card */}
        <div className="relative h-[420px] w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-card">
          <div className="scan-line absolute left-0 z-20 h-[2px] w-full animate-scan-vertical" />
          <div className="absolute inset-x-0 top-0 z-10 h-[40%] bg-gradient-scan" />

          <div className="absolute left-1/2 top-6 z-30 flex -translate-x-1/2 items-center gap-2 rounded-md border border-white/[0.08] bg-surface px-3 py-1.5 backdrop-blur-md">
            <FileText className="size-3.5 text-cyan" />
            <span className="max-w-[220px] truncate font-mono text-xs text-white">
              {file.name}
            </span>
          </div>

          <div className="pointer-events-none p-8 pt-20 opacity-30 grayscale">
            <div className="mb-4 space-y-2 border-b border-white/10 pb-3">
              <div className="h-4 w-2/5 rounded bg-white/40" />
              <div className="h-2 w-1/3 rounded bg-white/20" />
            </div>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-2 rounded bg-white/15"
                style={{ marginTop: 10, width: `${65 + ((i * 13) % 30)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Step list */}
        <div className="grid w-full max-w-xl grid-cols-1 gap-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={s}
                className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-all ${
                  active
                    ? "border-cyan/30 bg-cyan/[0.04]"
                    : done
                      ? "border-white/[0.06] bg-surface"
                      : "border-white/[0.04] bg-transparent opacity-50"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border font-mono text-[10px] ${
                    done
                      ? "border-success/40 bg-success/10 text-success"
                      : active
                        ? "border-cyan/40 bg-cyan/10 text-cyan animate-pulse-glow"
                        : "border-white/10 text-muted-foreground"
                  }`}
                >
                  {done ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm ${active ? "text-white" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
                {active && (
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-cyan">
                    Memproses
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          Estimasi: kurang dari 15 detik
        </p>
      </motion.div>
    </main>
  );
};

export default AnalyzingView;