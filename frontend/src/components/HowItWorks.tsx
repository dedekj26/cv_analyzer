import { FileUp, Sparkles, FileDown } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: FileUp,
    title: "Unggah CV",
    desc: "PDF atau DOCX hingga 5MB. Diproses sepenuhnya di memori — tidak ada penyimpanan disk.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Pemindaian AI",
    desc: "Gemini Flash menganalisis struktur, metrik, kata kunci, dan dampak narasi Anda.",
  },
  {
    n: "03",
    icon: FileDown,
    title: "Terima Laporan",
    desc: "Skor 0–100, kekuatan, kelemahan, dan rekomendasi siap diunduh sebagai PDF.",
  },
];

const HowItWorks = () => (
  <section
    id="cara-kerja"
    className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-20 md:px-10"
  >
    <div className="mb-12 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
          Alur Kerja
        </p>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
          Tiga langkah dari unggahan ke wawasan.
        </h2>
      </div>
      <p className="max-w-md text-pretty text-muted-foreground">
        Tanpa pendaftaran, tanpa pembayaran, tanpa menunggu. Dari unggah hingga
        laporan PDF dalam waktu kurang dari satu menit.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {STEPS.map(({ n, icon: Icon, title, desc }) => (
        <div
          key={n}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-6 transition-colors hover:border-cyan/30"
        >
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-gradient-radial opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-start justify-between">
            <span className="font-mono text-5xl font-bold leading-none text-white/[0.06]">
              {n}
            </span>
            <div className="flex size-10 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/[0.06] text-cyan">
              <Icon className="size-5" />
            </div>
          </div>
          <h3 className="relative mt-8 text-lg font-bold text-white">{title}</h3>
          <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
            {desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;