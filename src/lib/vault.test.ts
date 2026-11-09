import { describe, expect, it } from "vitest";
import { buildTimeline, filterByDateRange, splitGoals } from "@/lib/vault";
import { totalSavedCents, type PaypalTransaction } from "@/lib/ledger";

const now = new Date("2026-11-09T12:00:00Z");
const tx = (over: Partial<PaypalTransaction>): PaypalTransaction => ({
  id: "x",
  paypal_order_id: "o",
  paypal_capture_id: null,
  kind: "goal_contribution",
  goal_id: null,
  item_ids: [],
  amount_cents: 1000,
  currency: "USD",
  status: "completed",
  failure_reason: null,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
  captured_at: now.toISOString(),
  is_demo: false,
  ...over,
});

describe("vault date filter", () => {
  it("last 7 days keeps a 6-day-old payment and drops an 8-day-old one", () => {
    const rows = [
      tx({ id: "a", created_at: "2026-11-03T12:00:00Z" }),
      tx({ id: "b", created_at: "2026-11-01T12:00:00Z" }),
    ];
    expect(filterByDateRange(rows, "7d", now).map((r) => r.id)).toEqual(["a"]);
  });
});

describe("status timeline", () => {
  it('a verified payment ends with a done "Verified by server" step', () => {
    const steps = buildTimeline(tx({ status: "completed" }));
    expect(steps[steps.length - 1]).toMatchObject({ label: "Verified by server", state: "done" });
  });
});

describe("completed goals section", () => {
  it("puts goals with a completion date in the completed list only", () => {
    const { active, completed } = splitGoals([
      { completed_at: null },
      { completed_at: "2026-11-01T00:00:00Z" },
    ]);
    expect(active).toHaveLength(1);
    expect(completed).toHaveLength(1);
  });
});

describe("total saved via PayPal", () => {
  it("counts only verified, non-demo goal contributions", () => {
    const rows = [
      tx({ amount_cents: 1500 }),
      tx({ amount_cents: 700, status: "pending" }),
      tx({ amount_cents: 2000, is_demo: true }),
      tx({ amount_cents: 999, kind: "shop" }),
    ];
    expect(totalSavedCents(rows)).toBe(1500);
  });
});
