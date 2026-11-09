import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { Modal } from "@/components/kit/Modal";
import { usePageNavigate } from "@/components/app/usePageNavigate";
import type { PageId } from "@/components/layout/BottomNav";

const STEPS: { title: string; body: string; page: PageId }[] = [
  {
    title: "Welcome to Spendemon",
    body: "Log what you spend, stay under budget, and your monsters level up. Overspend and they get grumpy.",
    page: "dashboard",
  },
  {
    title: "Log expenses",
    body: "Every expense you record feeds your monsters and powers your daily quests.",
    page: "expenses",
  },
  {
    title: "Pay. Save. Evolve.",
    body: "Create a savings goal and contribute with PayPal Sandbox (test money only). Verified payments evolve Saverion.",
    page: "goals",
  },
  {
    title: "Ask the Purchase Guardian",
    body: "Before buying in the Marketplace, the Guardian checks the item against your budget. You always decide.",
    page: "shop",
  },
  {
    title: "Try the demo",
    body: 'On the dashboard, press "Start demo" to add a sample goal and payment to your account. "Reset demo" removes them.',
    page: "dashboard",
  },
];

const keyFor = (userId: string) => `spendemon.tour.done.${userId}`;

/** First-run guided tour, shown once per player on this device. */
export function GuidedTour({ userId }: { userId: string }) {
  const navigate = usePageNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

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
  return (
    <Modal
      open={open}
      onClose={finish}
      title={current.title}
      description={`Step ${step + 1} of ${STEPS.length}`}
      maxWidth="md"
    >
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
    </Modal>
  );
}
