import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/kit/Button";

import { usePageNavigate } from "@/components/app/usePageNavigate";
import type { PageId } from "@/components/layout/BottomNav";

const STEPS: { title: string; body: string; page: PageId; target: string }[] = [
  {
    title: "Welcome to Spendemon",
    body: "Log what you spend, stay under budget, and your monsters level up. Overspend and they get grumpy.",
    page: "dashboard",
    target: "savings",
  },
  {
    title: "Log expenses",
    body: "Every expense you record feeds your monsters and powers your daily quests.",
    page: "expenses",
    target: "page-heading",
  },
  {
    title: "Pay. Save. Evolve.",
    body: "Create a savings goal and contribute with PayPal Sandbox (test money only). Verified payments evolve Saverion.",
    page: "goals",
    target: "autopilot",
  },
  {
    title: "Ask the Purchase Guardian",
    body: "Before buying in the Marketplace, the Guardian checks the item against your budget. You always decide.",
    page: "shop",
    target: "marketplace",
  },
  {
    title: "Try the demo",
    body: 'On the dashboard, press "Start demo" to add a sample goal and payment to your account. "Reset demo" removes them.',
    page: "dashboard",
    target: "demo",
  },
];

const keyFor = (userId: string) => `spendemon.tour.done.${userId}`;

/** First-run guided tour, shown once per player on this device. */
export function GuidedTour({ userId }: { userId: string }) {
  const navigate = usePageNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    let element: HTMLElement | null = null;
    let previous: HTMLElement | null = null;
    const update = () => {
      element =
        document.querySelector(`[data-tour="${STEPS[step].target}"]`) ??
        document.querySelector("main h1");
      if (!element) return;
      if (element !== previous) {
        previous?.classList.remove("tour-target");
        element.classList.add("tour-target");
        element.scrollIntoView({ block: "center", behavior: "instant" });
        previous = element;
      }
      const r = element.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    const timer = window.setInterval(update, 300);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      previous?.classList.remove("tour-target");
    };
  }, [open, step]);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(keyFor(userId))) setOpen(true);
    } catch {
      /* storage blocked: skip the tour */
    }
  }, [userId]);

  const finish = () => {
    try {
      window.localStorage.setItem(keyFor(userId), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    navigate("dashboard");
  };

  const next = () => {
    if (step === STEPS.length - 1) return finish();
    const upcoming = step + 1;
    setStep(upcoming);
    navigate(STEPS[upcoming].page);
  };

  const current = STEPS[step];
  if (!open) return null;
  return (
    <div className="tour-layer" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect && (
        <div
          className="tour-spotlight"
          aria-hidden="true"
          style={{
            top: rect.top - 5,
            left: rect.left - 5,
            width: rect.width + 10,
            height: rect.height + 10,
          }}
        />
      )}
      <section className="tour-copy" style={{ top: rect && rect.top > 340 ? 16 : undefined }}>
        <p className="text-xs text-neon-300">
          Step {step + 1} of {STEPS.length} · ↑ highlighted above
        </p>
        <h2 id="tour-title" className="mt-2 text-xl font-bold">
          {current.title}
        </h2>
        <div className="space-y-6">
          <p className="flex gap-3 text-sm leading-relaxed text-ink-200">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-volt-300" aria-hidden="true" />{" "}
            {current.body}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-neon-400" : "bg-white/15"}`}
              />
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={finish}>
              Skip tour
            </Button>
            <Button variant="primary" onClick={next}>
              {step === STEPS.length - 1 ? "Start playing" : "Next"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
