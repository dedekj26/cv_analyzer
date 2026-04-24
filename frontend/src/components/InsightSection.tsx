import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface InsightSectionProps {
  title: string;
  subtitle: string;
  items: string[];
  icon: LucideIcon;
  accent: "success" | "warning" | "cyan";
  numbered?: boolean;
}

const accentMap = {
  success: {
    text: "text-success",
    border: "border-success/30",
    bg: "bg-success/[0.06]",
    dot: "bg-success",
    rule: "bg-success",
  },
  warning: {
    text: "text-warning",
    border: "border-warning/30",
    bg: "bg-warning/[0.06]",
    dot: "bg-warning",
    rule: "bg-warning",
  },
  cyan: {
    text: "text-cyan",
    border: "border-cyan/30",
    bg: "bg-cyan/[0.06]",
    dot: "bg-cyan",
    rule: "bg-cyan",
  },
} as const;

const InsightSection = ({
  title,
  subtitle,
  items,
  icon: Icon,
  accent,
  numbered = false,
}: InsightSectionProps) => {
  const a = accentMap[accent];
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-card p-6 md:p-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-6 w-1 rounded-full ${a.rule}`} />
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div
          className={`flex size-9 items-center justify-center rounded-lg border ${a.border} ${a.bg} ${a.text}`}
        >
          <Icon className="size-4" />
        </div>
      </header>

      <ul className="space-y-3">
        {items.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="flex items-start gap-4 rounded-lg border border-white/[0.04] bg-surface-raised p-4"
          >
            <span
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${a.text} ${a.bg} border ${a.border}`}
            >
              {numbered ? String(idx + 1).padStart(2, "0") : "—"}
            </span>
            <p className="text-sm leading-relaxed text-foreground">{item}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default InsightSection;