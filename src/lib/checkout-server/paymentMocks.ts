import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type MockOrder = {
  paypal_order_id: string;
  user_id: string;
  kind: string;
  goal_id: string | null;
  item_ids: string[];
  amount_cents: number;
  currency: string;
  status: string;
  paypal_capture_id?: string | null;
  refund_reversed_at?: string;
  updated_at?: string;
  is_demo?: boolean;
};
export function paymentDb(order?: MockOrder, options: { duplicate?: boolean } = {}) {
  const rows: Record<string, Record<string, unknown>[]> = {
    shop_orders: order ? [order] : [],
    paypal_webhook_events: options.duplicate
      ? [{ event_id: "EVENT", processed_at: "2026-11-09" }]
      : [],
    goal_rewards: [],
  };
  let creditCount = 0,
    reverseCount = 0,
    contributed = 0;
  const milestones = new Set<number>();
  const from = vi.fn((table: string) => {
    let operation = "select";
    let payload: Record<string, unknown> = {};
    const filters: ((r: Record<string, unknown>) => boolean)[] = [];
    let lease = false;
    const execute = () => {
      const source = rows[table] ?? [];
      let selected = source.filter((r) => filters.every((f) => f(r)));
      if (lease)
        selected = selected.filter((r) => ["created", "pending"].includes(String(r.status)));
      if (operation === "update") selected.forEach((r) => Object.assign(r, payload));
      if (operation === "upsert") {
        if (source.some((r) => r.event_id === payload.event_id)) selected = [];
        else {
          source.push(payload);
          selected = [payload];
        }
      }
      return { data: selected, error: null };
    };
    const q = {
      select: vi.fn(() => q),
      update: vi.fn((v: Record<string, unknown>) => {
        operation = "update";
        payload = v;
        return q;
      }),
      upsert: vi.fn((v: Record<string, unknown>) => {
        operation = "upsert";
        payload = v;
        return q;
      }),
      eq: vi.fn((key: string, value: unknown) => {
        filters.push((r) => r[key] === value);
        return q;
      }),
      in: vi.fn((key: string, values: unknown[]) => {
        filters.push((r) => values.includes(r[key]));
        return q;
      }),
      or: vi.fn(() => {
        lease = true;
        return q;
      }),
      maybeSingle: vi.fn(async () => {
        const result = execute();
        return { ...result, data: result.data[0] ?? null };
      }),
      then: (resolve: (value: ReturnType<typeof execute>) => unknown) =>
        Promise.resolve(execute()).then(resolve),
    };
    return q;
  });
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (
      name === "credit_paypal_order" &&
      order &&
      args._order_id === order.paypal_order_id &&
      ["created", "capturing", "pending"].includes(order.status)
    ) {
      creditCount++;
      contributed += order.amount_cents;
      order.status = "completed";
      order.paypal_capture_id = String(args._capture_id);
      const newlyGranted = [25, 50, 75, 100].filter(
        (m) => contributed * 100 >= 1000 * m && !milestones.has(m),
      );
      newlyGranted.forEach((m) => {
        milestones.add(m);
        rows.goal_rewards.push({ order_id: order.paypal_order_id, milestone: m });
      });
      return { data: { credited: true, milestones: newlyGranted }, error: null };
    }
    if (
      name === "reverse_paypal_order" &&
      order &&
      args._capture_id === order.paypal_capture_id &&
      !order.refund_reversed_at &&
      ["completed", "refunded"].includes(order.status)
    ) {
      reverseCount++;
      contributed = Math.max(0, contributed - order.amount_cents);
      order.status = "refunded";
      order.refund_reversed_at = "now";
      return { data: { reversed: true }, error: null };
    }
    return { data: { credited: false, milestones: [], reversed: false }, error: null };
  });
  return {
    db: { from, rpc } as unknown as SupabaseClient<Database>,
    rpc,
    rows,
    stats: () => ({ creditCount, reverseCount, contributed, milestones: [...milestones] }),
  };
}
