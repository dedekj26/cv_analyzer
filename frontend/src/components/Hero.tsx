import { motion } from "framer-motion";
import UploadZone from "./UploadZone";

interface HeroProps {
  onFile: (file: File) => void;
  error?: string;
}

const Hero = ({ onFile, error }: HeroProps) => (
  <main className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-12 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-20">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col gap-8"
    >
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan/20 bg-cyan/[0.08] px-3 py-1.5">
        <div className="size-2 animate-pulse rounded-full bg-cyan shadow-[0_0_10px_hsl(var(--cyan-glow))]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan">
          Mesin Analisis Gemini Aktif
        </span>
      </div>

      <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-[64px]">
        Presisi AI Tingkat Lanjut.{" "}
        <span className="text-muted-foreground">Satu Pindai.</span>
      </h1>

      <p className="max-w-[52ch] text-pretty text-lg leading-relaxed text-muted-foreground">
        Jalankan profil profesional Anda melalui lensa analisis kami. Sistem
        mengidentifikasi celah kompetensi, memvalidasi metrik dampak, dan
        menyusun ulang narasi Anda dalam hitungan detik.
      </p>

      <UploadZone onFile={onFile} error={error} />

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
        <Stat value="99.8%" label="Akurasi Parsing" />
        <div className="hidden h-10 w-px bg-white/[0.08] sm:block" />
        <Stat value="<15s" label="Waktu Analisis" />
        <div className="hidden h-10 w-px bg-white/[0.08] sm:block" />
        <Stat value="0" label="Data Disimpan" />
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative hidden h-[600px] w-full items-center justify-center lg:flex"
    >
      <ScannerPreview />
    </motion.div>
  </main>
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col">
    <span className="font-mono text-2xl font-bold tabular-nums text-white">
      {value}
    </span>
    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  </div>
);

const ScannerPreview = () => (
  <div className="relative flex h-[580px] w-[420px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-card shadow-card">
    {/* Scan line */}
    <div className="scan-line absolute left-0 z-20 h-[2px] w-full animate-scan-vertical" />
    <div className="absolute inset-x-0 top-0 z-10 h-[40%] bg-gradient-scan" />

    {/* Faux CV content */}
    <div className="pointer-events-none p-8 opacity-30 grayscale">
      <div className="mb-6 space-y-2 border-b border-white/10 pb-4">
        <div className="h-4 w-2/5 rounded bg-white/40" />
        <div className="h-2 w-1/3 rounded bg-white/20" />
      </div>
      <div className="space-y-3">
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="h-2 w-[92%] rounded bg-white/15" />
        <div className="h-2 w-[80%] rounded bg-white/15" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-3 w-1/4 rounded bg-white/30" />
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="h-2 w-[90%] rounded bg-white/15" />
        <div className="h-2 w-[85%] rounded bg-white/15" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-3 w-1/4 rounded bg-white/30" />
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="h-2 w-[70%] rounded bg-white/15" />
      </div>
    </div>

    {/* Floating UI overlays */}
    <div className="absolute right-5 top-5 z-30">
      <div className="glass flex items-center gap-3 rounded-lg p-3 shadow-xl">
        <div className="flex size-10 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10">
          <span className="font-mono font-bold tabular-nums text-cyan">84</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Skor ATS Instan
          </span>
          <span className="text-sm font-semibold text-white">Kesesuaian Tinggi</span>
        </div>
      </div>
    </div>

    <div className="absolute left-[-24px] top-[38%] z-30 w-[280px] rounded-lg border border-cyan/30 bg-card/90 p-4 shadow-glow-soft backdrop-blur-xl">
      <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan">
        <span className="size-1.5 rounded-full bg-cyan" />
        Anomali Terdeteksi
      </span>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        Format tanggal pada blok &lsquo;Pengalaman Kerja&rsquo; tidak konsisten.
        Disarankan format <span className="font-mono text-cyan">MM/YYYY</span>.
      </p>
    </div>

    <div className="absolute bottom-12 right-[-20px] z-30 w-[260px] rounded-lg border border-white/[0.08] bg-card/90 p-4 backdrop-blur-xl">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
        Ekstraksi Kata Kunci
      </span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {["Manajemen Produk", "Analisis Data", "Strategi GTM", "SQL"].map((k, i) => (
          <span
            key={k}
            className={`rounded border px-2 py-1 font-mono text-[10px] ${
              i === 1
                ? "border-cyan/30 bg-cyan/10 text-cyan"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default Hero;