import { openCheckout } from "@/lib/openCheckout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { planSavings } from "@/lib/autopilot.functions";
import { createGoalContribution } from "@/lib/paypalCheckout";
import { formatUsdCents } from "@/lib/money";
import { useAuth } from "@/state/authContext";
export function SavingsAutopilot() {
  const planFn = useServerFn(planSavings);
  const [result, setResult] = useState<Awaited<ReturnType<typeof planSavings>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  // Demo goals and judge accounts always go through the clearly labelled simulated checkout.
  const simulated = result?.goalIsDemo === true || session?.user.app_metadata.judge_mode === true;
  const plan = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await planFn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not plan savings.");
    } finally {
      setBusy(false);
    }
  };
  const pay = async () => {
    if (!result?.plan) return;
    setPaying(true);
    setError(null);
    try {
      const order = await createGoalContribution(
        result.plan.goalId,
        result.plan.suggestedAmountCents,
        simulated,
      );
      if (openCheckout(order.approveUrl)) setPaying(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setPaying(false);
    }
  };
  return (
    <section className="space-y-4 border-y border-border py-5" data-tour="autopilot">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-5 w-5 text-neon-300" /> Savings Autopilot
        </h2>
        <Button onClick={plan} disabled={busy || paying}>
          {busy ? "Planning…" : "Plan my savings"}
        </Button>
      </div>
      {result?.plan && (
        <article className="card space-y-3 p-5">
          <p className="text-xs font-bold text-volt-300">
            {result.source === "ai" ? "AI explanation" : "Calculated fallback"}
          </p>
          <p className="text-2xl font-bold text-neon-300">
            {formatUsdCents(result.plan.suggestedAmountCents)}
          </p>
          <p className="text-sm text-ink-200">{result.plan.reason}</p>
          <p className="text-xs text-ink-300">
            Risk: {result.plan.risk} · Lower alternative:{" "}
            {formatUsdCents(result.plan.alternativeAmountCents)}
          </p>
          <Button className="w-full whitespace-normal" disabled={paying} onClick={pay}>
            {paying
              ? "Opening checkout…"
              : simulated
                ? "Confirm simulated payment"
                : "Confirm and pay with PayPal"}
          </Button>
          {simulated && (
            <p className="text-xs text-ink-400">
              Simulated checkout: no PayPal order is created and no money moves.
            </p>
          )}
        </article>
      )}
      {result?.message && (
        <p role="status" className="text-sm text-ink-300">
          {result.message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </section>
  );
}
