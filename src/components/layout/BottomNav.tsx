import { motion } from "framer-motion";
import {
  FlaskConical,
  LayoutDashboard,
  MessageCircle,
  PawPrint,
  PiggyBank,
  Receipt,
  Scroll,
  ShoppingBag,
  Vault,
  type LucideIcon,
} from "lucide-react";

export type PageId =
  "dashboard" | "expenses" | "goals" | "monsters" | "quests" | "lab" | "shop" | "vault" | "roast";

const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "expenses", label: "Spend", icon: Receipt },
  { id: "goals", label: "Save to Level", icon: PiggyBank },
  { id: "quests", label: "Quests", icon: Scroll },
  { id: "monsters", label: "Monsters", icon: PawPrint },
  { id: "lab", label: "Money Lab", icon: FlaskConical },
  { id: "shop", label: "Marketplace", icon: ShoppingBag },
  { id: "vault", label: "Vault", icon: Vault },
  { id: "roast", label: "Roast", icon: MessageCircle },
];

interface BottomNavProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
}

export function BottomNav({ page, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-fit -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-night-950/80 p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9),0_0_40px_-12px_rgba(139,92,246,0.45)] backdrop-blur-xl"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-volt-300/70 to-transparent"
      />
      <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const active = item.id === page;
          const Icon = item.icon;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
                className={`relative flex h-12 items-center justify-center gap-2 rounded-xl transition duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400 ${
                  active
                    ? "px-4 text-neon-300"
                    : "w-12 text-ink-400 hover:bg-white/[0.05] hover:text-ink-50"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dock-active"
                    className="absolute inset-0 rounded-xl border border-neon-400/50 bg-gradient-to-b from-neon-500/20 to-neon-500/5 shadow-[inset_0_0_16px_-4px_rgba(184,255,77,0.5)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  >
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-neon-400 shadow-glow-neon" />
                  </motion.span>
                )}
                <Icon className="relative h-5 w-5" aria-hidden="true" />
                {active && (
                  <span className="relative whitespace-nowrap font-display text-sm font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
