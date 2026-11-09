import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/kit/Button";
import { withdrawSavings } from "@/lib/withdraw.functions";
import { useRefreshLedger } from "@/lib/ledger";
export function WithdrawSavings({ goalId }: { goalId: string }) {
  const withdraw = useServerFn(withdrawSavings);
  const refresh = useRefreshLedger();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Button className="w-full" variant="ghost" onClick={() => setOpen(true)}>
        Withdraw savings
      </Button>
      {open && (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const result = await withdraw({ data: { goalId, recipient } });
              setMessage(result.message);
              await refresh();
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Withdrawal could not be started.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm">
            PayPal Sandbox recipient email
            <input
              required
              type="email"
              className="input mt-2"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
          <p className="text-xs text-amber-300">
            Sandbox only. If Payouts is unavailable, a Simulated payout is recorded instead.
          </p>
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Checking withdrawal…" : "Confirm withdrawal"}
          </Button>
        </form>
      )}
      {message && (
        <p role="status" className="text-sm text-ink-200">
          {message}
        </p>
      )}
    </div>
  );
}
