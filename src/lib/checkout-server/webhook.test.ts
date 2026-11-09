import { describe, expect, it } from "vitest";
import { interpretWebhookEvent, processWebhookEvent, type WebhookEvent } from "./webhook.server";
import { creditVerifiedOrder } from "./paypal.server";
import { paymentDb, type MockOrder } from "./paymentMocks";
const order = (): MockOrder => ({ paypal_order_id: "ORDER1234567890", user_id: "player", kind: "goal_contribution", goal_id: "goal", item_ids: [], amount_cents: 1000, currency: "USD", status: "created" });
const event = (type = "PAYMENT.CAPTURE.COMPLETED", amount = "10.00"): WebhookEvent => ({ id: "EVENT", event_type: type, resource: { id: "CAPTURE123", amount: { value: amount, currency_code: "USD" }, supplementary_data: { related_ids: { order_id: "ORDER1234567890", capture_id: "CAPTURE123" } } } });
describe("webhook reconciliation", () => {
  it("skips a processed duplicate event", async () => { const mock = paymentDb(order(), { duplicate: true }); expect(await processWebhookEvent(mock.db,event())).toBe("duplicate"); expect(mock.rpc).not.toHaveBeenCalled(); });
  it("does not credit an unknown order", async () => { const mock = paymentDb(); expect(await processWebhookEvent(mock.db,event())).toBe("unknown-order"); expect(mock.rpc).not.toHaveBeenCalled(); });
  it("does not credit amount mismatch", async () => { const mock = paymentDb(order()); expect(await processWebhookEvent(mock.db,event(undefined,"9.99"))).toBe("amount-mismatch"); expect(mock.rpc).not.toHaveBeenCalled(); });
  it("refund reverses value once and retains earned milestones", async () => { const mock = paymentDb(order()); await creditVerifiedOrder(mock.db,"ORDER1234567890","CAPTURE123"); await processWebhookEvent(mock.db,event("PAYMENT.CAPTURE.REFUNDED")); await processWebhookEvent(mock.db,{ ...event("PAYMENT.CAPTURE.REVERSED"), id: "EVENT2" }); expect(mock.stats()).toMatchObject({ reverseCount: 1, contributed: 0, milestones: [25,50,75,100] }); });
  it("denied capture fails the order without credit", async () => { const row = order(); const mock = paymentDb(row); expect(await processWebhookEvent(mock.db,event("PAYMENT.CAPTURE.DENIED"))).toBe("failed"); expect(row.status).toBe("failed"); expect(mock.rpc).not.toHaveBeenCalled(); });
  it("refund resource id is not mistaken for the capture id", () => { expect(interpretWebhookEvent({ id: "r", event_type: "PAYMENT.CAPTURE.REFUNDED", resource: { id: "REFUND123", links: [{ rel: "up", href: "https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE123" }] } })).toEqual({ kind: "refund", captureId: "CAPTURE123" }); });
});