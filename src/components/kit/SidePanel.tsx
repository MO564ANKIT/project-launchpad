import { useEffect, useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Slide-in panel from the right (full width on phones). */
export function SidePanel({ open, onClose, title, description, children }: SidePanelProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-night-950/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-white/10 bg-night-850 p-6 shadow-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-ink-50">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-ink-300">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-xl p-2 text-ink-300 transition hover:bg-white/10 hover:text-ink-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
