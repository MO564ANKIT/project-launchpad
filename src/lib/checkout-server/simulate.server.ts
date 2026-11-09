import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CATALOGUE, creditVerifiedOrder, type CheckoutResult } from "./paypal.server";

// Isolated, explicit demo path. Never calls PayPal or credits a non-demo order.
export async function simulateCheckout(db: SupabaseClient<Database>, userId: string, input: { action: string; goalId?: string; amountCents?: number; itemIds?: string[]; orderId?: string }): Promise<CheckoutResult> {
  if (input.action === "capture" || input.action === "cancel") {
    const order = await db.from("shop_orders").select("*").eq("paypal_order_id", input.orderId ?? "").eq("user_id", userId).eq("is_demo", true).maybeSingle();
    if (order.error) throw order.error;
    if (!order.data || order.data.kind === "payout") return { ok: false, error: "Simulated order not found." };
    if (input.action === "cancel") { await db.from("shop_orders").update({ status: "cancelled" }).eq("id", order.data.id).eq("status", "created"); return { ok: true, body: { status: "cancelled" } }; }
    const milestones = await creditVerifiedOrder(db, order.data.paypal_order_id, null);
    return { ok: true, body: { status: "completed", orderId: order.data.paypal_order_id, kind: order.data.kind as "shop" | "goal_contribution", goalId: order.data.goal_id, itemIds: order.data.item_ids, amountCents: order.data.amount_cents, milestones, simulated: true, alreadyCompleted: order.data.status === "completed" } };
  }
  let amount = 0;
  const items = [...new Set(input.itemIds ?? [])];
  if (input.action === "create") {
    if (!items.length || items.length > 20 || items.some(id => !Object.hasOwn(CATALOGUE, id))) return { ok: false, error: "Pick a valid marketplace item." };
    amount = items.reduce((sum,id) => sum + CATALOGUE[id].priceUsdCents, 0);
  } else {
    const goal = await db.from("savings_goals").select("*").eq("id", input.goalId ?? "").eq("user_id", userId).eq("is_demo", true).maybeSingle();
    if (goal.error) throw goal.error;
    amount = input.amountCents ?? 0;
    if (!goal.data || goal.data.completed_at || !Number.isInteger(amount) || amount < 100 || amount > 50000 || amount > goal.data.target_cents - goal.data.contributed_cents) return { ok: false, error: "Simulated contributions require a demo goal and an amount between $1.00 and its remaining target (maximum $500.00)." };
  }
  const orderId = `DEMO${crypto.randomUUID().replaceAll("-", "").slice(0,20).toUpperCase()}`;
  const { error } = await db.from("shop_orders").insert({ paypal_order_id: orderId, user_id: userId, kind: input.action === "create" ? "shop" : "goal_contribution", goal_id: input.action === "contribute" ? input.goalId : null, item_ids: items, amount_cents: amount, currency: "USD", status: "created", is_demo: true, failure_reason: "Simulated checkout; no money moved" });
  if (error) throw error;
  const path = input.action === "create" ? "/loot-shop" : "/goals";
  return { ok: true, body: { orderId, approveUrl: `${path}?paypal=return&simulated=1&token=${orderId}`, simulated: true } };
}