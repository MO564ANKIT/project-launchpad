import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureOrder, creditVerifiedOrder } from "./paypal.server";
import { paymentDb, type MockOrder } from "./paymentMocks";
const id = "ORDER1234567890";
const order = (status = "created"): MockOrder => ({
  paypal_order_id: id,
  user_id: "player",
  kind: "goal_contribution",
  goal_id: "goal",
  item_ids: [],
  amount_cents: 1000,
  currency: "USD",
  status,
});
const body = (value = "10.00", status = "COMPLETED") => ({
  status: "COMPLETED",
  purchase_units: [
    {
      payments: {
        captures: [{ id: "CAPTURE123", status, amount: { value, currency_code: "USD" } }],
      },
    },
  ],
});
beforeEach(() => {
  vi.stubEnv("LOVABLE_API_KEY", "test");
  vi.stubEnv("PAYPAL_API_KEY", "test");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("captureOrder", () => {
  it("credits exact successful capture", async () => {
    const mock = paymentDb(order());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(body())),
    );
    expect(await captureOrder(mock.db, "player", id)).toMatchObject({
      ok: true,
      body: { status: "completed", amountCents: 1000 },
    });
    expect(mock.stats().creditCount).toBe(1);
  });
  it("keeps a pending capture uncredited", async () => {
    const row = order();
    const mock = paymentDb(row);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(body("10.00", "PENDING"))),
    );
    expect(await captureOrder(mock.db, "player", id)).toMatchObject({
      body: { status: "pending" },
    });
    expect(row.status).toBe("pending");
    expect(mock.stats().creditCount).toBe(0);
  });
  it("rejects amount mismatch", async () => {
    const mock = paymentDb(order());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(body("9.99"))),
    );
    expect(await captureOrder(mock.db, "player", id)).toMatchObject({ body: { status: "failed" } });
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("returns already-completed without calling PayPal", async () => {
    const mock = paymentDb(order("completed"));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await captureOrder(mock.db, "player", id)).toMatchObject({
      body: { alreadyCompleted: true, status: "completed" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("concurrent double capture acquires one lease and credits once", async () => {
    const mock = paymentDb(order());
    const fetchMock = vi.fn(async () => Response.json(body()));
    vi.stubGlobal("fetch", fetchMock);
    await Promise.all([captureOrder(mock.db, "player", id), captureOrder(mock.db, "player", id)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mock.stats().creditCount).toBe(1);
    expect(mock.stats().contributed).toBe(1000);
  });
  it("cannot capture another player's order", async () => {
    const mock = paymentDb(order());
    vi.stubGlobal("fetch", vi.fn());
    expect(await captureOrder(mock.db, "stranger", id)).toMatchObject({ ok: false });
    expect(mock.rpc).not.toHaveBeenCalled();
  });
});
describe("atomic credit RPC contract (mocked transaction)", () => {
  it("repeated credit calls grant milestones and 1000 cents once", async () => {
    const mock = paymentDb(order());
    expect(await creditVerifiedOrder(mock.db, id, "CAPTURE123")).toEqual([25, 50, 75, 100]);
    expect(await creditVerifiedOrder(mock.db, id, "CAPTURE123")).toEqual([]);
    expect(mock.stats()).toMatchObject({
      creditCount: 1,
      contributed: 1000,
      milestones: [25, 50, 75, 100],
    });
  });
});
