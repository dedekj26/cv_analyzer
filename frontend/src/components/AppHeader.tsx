import { Shield } from "lucide-react";

interface AppHeaderProps {
  onReset?: () => void;
}

const AppHeader = ({ onReset }: AppHeaderProps) => (
  <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-white/[0.06] px-6 py-5 md:px-10 md:py-6">
    <button
      onClick={onReset}
      className="group flex items-center gap-3"
      aria-label="OptimaCV — kembali ke beranda"
    >
      <div className="flex size-8 items-center justify-center rounded-md border border-white/[0.08] bg-surface">
        <div className="size-3 rounded-sm bg-cyan shadow-[0_0_10px_hsl(var(--cyan-glow))] transition-transform group-hover:scale-110" />
      </div>
      <span className="font-bold tracking-tight text-white">
        Optima<span className="text-cyan">CV</span>
      </span>
    </button>

    <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
      <a href="#cara-kerja" className="transition-colors hover:text-white">
        Cara Kerja
      </a>
      <a href="#metrik" className="transition-colors hover:text-white">
        Metrik Penilaian
      </a>
      <a href="#privasi" className="transition-colors hover:text-white">
        Keamanan Data
      </a>
    </nav>

    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface px-3 py-1.5 text-xs font-mono text-muted-foreground">
      <Shield className="size-3.5 text-cyan" />
      <span className="hidden sm:inline">Diproses di memori</span>
      <span className="sm:hidden">Aman</span>
    </div>
  </header>
);

export default AppHeader;