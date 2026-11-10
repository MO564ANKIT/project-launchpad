import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type Tone = "neon" | "volt" | "amber" | "rose" | "aqua";

const FILL: Record<Tone, string> = {
  neon: "bg-gradient-to-r from-neon-600 to-neon-400 shadow-glow-neon",
  volt: "bg-gradient-to-r from-volt-600 to-volt-300",
  amber: "bg-gradient-to-r from-amber-500 to-amber-300",
  rose: "bg-gradient-to-r from-rose-600 to-rose-300",
  aqua: "bg-gradient-to-r from-aqua-500 to-aqua-300",
};

interface ProgressBarProps {
  value: number;
  tone?: Tone;
  height?: "sm" | "md";
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  tone = "neon",
  height = "md",
  className,
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn(
        "relative w-full overflow-hidden rounded-sm border border-white/[0.06] bg-night-950/80",
        height === "sm" ? "h-2" : "h-3",
        className,
      )}
    >
      <motion.div
        className={cn("relative h-full rounded-sm", FILL[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2 bg-white/25"
        />
      </motion.div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_10%,rgba(11,8,20,0.55)_10%,rgba(11,8,20,0.55)_calc(10%+2px))]"
      />
    </div>
  );
}
