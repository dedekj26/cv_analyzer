import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
}

const ScoreGauge = ({ score, label }: ScoreGaugeProps) => {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const circumferenceStr = `${circumference}`;
  const target = Math.max(0, Math.min(100, score));

  const motionScore = useMotionValue(0);
  const offset = useTransform(motionScore, (v) => circumference - (v / 100) * circumference);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionScore, target, { duration: 1.4, ease: "easeOut" });
    const unsub = motionScore.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [target, motionScore]);

  const color =
    target >= 70
      ? "hsl(var(--success))"
      : target >= 40
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  return (
    <div id="score-display" className="relative flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-raised))"
          strokeWidth="10"
        />
        <motion.circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-6xl font-bold tabular-nums tracking-tighter"
          style={{ color }}
        >
          {display}
        </span>
        <span className="-mt-1 font-mono text-xs text-muted-foreground">/ 100</span>
        <span
          className="mt-2 rounded-full border px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{ color, borderColor: color, background: `${color}15` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;