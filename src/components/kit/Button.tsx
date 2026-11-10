import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "volt" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-neon-500 text-night-950 font-bold uppercase tracking-wider font-display shadow-[0_4px_0_0_var(--color-neon-600),0_0_24px_-4px_rgba(184,255,77,0.45)] hover:bg-neon-400 hover:shadow-[0_4px_0_0_var(--color-neon-600),0_0_32px_-4px_rgba(200,255,115,0.7)] active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-neon-600)] after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/4 after:bg-white/40 after:blur-md after:animate-shine",
  volt: "relative overflow-hidden bg-volt-400 text-night-950 font-bold uppercase tracking-wider font-display shadow-[0_4px_0_0_var(--color-volt-600),0_0_28px_-4px_rgba(139,92,246,0.55)] hover:bg-volt-300 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-volt-600)]",
  ghost:
    "border border-white/10 bg-white/[0.04] text-ink-50 hover:border-volt-400/50 hover:bg-volt-500/10",
  danger: "border border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
  subtle: "text-ink-200 hover:bg-white/5 hover:text-ink-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-6 text-base rounded-xl gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
});
