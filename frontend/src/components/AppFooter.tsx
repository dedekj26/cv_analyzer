const AppFooter = () => (
  <footer className="relative z-10 mx-auto mt-16 w-full max-w-[1440px] border-t border-white/[0.06] px-6 py-8 md:px-10">
    <div className="flex flex-col items-start justify-between gap-4 text-xs font-mono text-muted-foreground md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <div className="size-1.5 animate-pulse rounded-full bg-success" />
        <span>SISTEM OPERASIONAL · v1.0</span>
      </div>
      <div className="flex flex-wrap gap-6">
        <span>API Latency: ~2.4s</span>
        <span>Akurasi Parsing: 99.8%</span>
        <span>© 2026 OptimaCV</span>
      </div>
    </div>
  </footer>
);

export default AppFooter;