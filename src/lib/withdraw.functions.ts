import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const withdrawSavings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ goalId: z.string().uuid(), recipient: z.string().email().max(254) }))
  .handler(async ({ data, context }) => {
    const goal = await context.supabase
      .from("savings_goals")
      .select("id, is_demo")
      .eq("id", data.goalId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (goal.error || !goal.data) throw new Error("Savings goal not found.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { paypalConfigured, paypalFetch } = await import("./checkout-server/paypal.server");
    const simulated =
      goal.data.is_demo || context.claims.app_metadata?.judge_mode === true || !paypalConfigured();
    const reservation = await supabaseAdmin.rpc("reserve_goal_payout", {
      _goal_id: data.goalId,
      _user_id: context.userId,
      _simulate: simulated,
    });
    if (reservation.error) throw new Error(reservation.error.message);
    const row = z
      .object({
        paypal_order_id: z.string(),
        amount_cents: z.number().int(),
        status: z.string(),
        is_demo: z.boolean(),
        payout_batch_id: z.string().nullable(),
      })
      .parse(reservation.data);
    if (row.status === "completed")
      return {
        simulated: row.is_demo,
        message: row.is_demo
          ? "Simulated payout already recorded. No money moved."
          : "Withdrawal already completed.",
      };
    const ref = row.paypal_order_id;
    const settle = async (batchId: string, demo: boolean) => {
      const result = await supabaseAdmin.rpc("settle_goal_payout", {
        _order_id: ref,
        _batch_id: batchId,
        _simulate: demo,
      });
      if (result.error)
        throw new Error(
          "Payout status could not be recorded. Check again; do not start a second withdrawal.",
        );
    };
    if (simulated || row.is_demo) {
      await settle(ref, true);
      return {
        simulated: true,
        message: "Simulated payout: no money moved. Your sandbox vault balance is unchanged.",
      };
    }
    let batchId = row.payout_batch_id;
    if (!batchId) {
      const response = await paypalFetch("/v1/payments/payouts", {
        method: "POST",
        headers: { "PayPal-Request-Id": ref },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: ref,
            email_subject: "Spendemon Savings Vault withdrawal",
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: { value: (row.amount_cents / 100).toFixed(2), currency: "USD" },
              receiver: data.recipient,
              sender_item_id: ref,
            },
          ],
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (["AUTHORIZATION_ERROR", "NOT_AUTHORIZED", "PAYOUTS_NOT_ENABLED"].includes(body?.name)) {
          await settle(ref, true);
          return {
            simulated: true,
            message:
              "Simulated payout: PayPal Payouts is not enabled on this sandbox account. No money moved.",
          };
        }
        // DUPLICATE_BATCH_ID recovery: PayPal returns the original batch link.
        const duplicate = body?.details?.find(
          (d: { issue?: string }) => d.issue === "DUPLICATE_BATCH_ID",
        );
        batchId = duplicate?.links
          ?.find((l: { rel?: string }) => l.rel === "self")
          ?.href?.split("/")
          .at(-1);
        if (!batchId)
          throw new Error(
            `PayPal payout failed (${response.status}). Check the Vault before trying again.`,
          );
      } else batchId = body?.batch_header?.payout_batch_id;
      if (typeof batchId !== "string")
        throw new Error("PayPal has not returned a payout reference. Check again shortly.");
      const saved = await supabaseAdmin
        .from("shop_orders")
        .update({ status: "pending", payout_batch_id: batchId })
        .eq("paypal_order_id", ref)
        .eq("status", "created");
      if (saved.error)
        throw new Error("Payout submitted; recording is pending. Check again shortly.");
    }
    const status = await paypalFetch(`/v1/payments/payouts/${encodeURIComponent(batchId)}`);
    if (!status.ok) throw new Error("PayPal payout status is unavailable. Check again shortly.");
    const body = await status.json();
    if (
      body.batch_header?.batch_status === "SUCCESS" &&
      body.items?.every((i: { transaction_status?: string }) => i.transaction_status === "SUCCESS")
    ) {
      await settle(batchId, false);
      return { simulated: false, message: "Sandbox withdrawal completed. No real money moved." };
    }
    return {
      simulated: false,
      message: "Sandbox payout pending. Check withdrawal again to refresh its status.",
    };
  });
