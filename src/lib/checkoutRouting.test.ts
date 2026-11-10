import { describe, expect, it } from "vitest";
import { guardianUsesSimulation, serverUsesSimulation } from "./checkoutRouting";

describe("Purchase Guardian checkout routing", () => {
  it("uses real PayPal Sandbox for a normal player when keys are set", () => {
    expect(guardianUsesSimulation({ judgeMode: false, checkoutReady: true })).toBe(false);
  });

  it("uses simulated checkout when PayPal keys are missing", () => {
    expect(guardianUsesSimulation({ judgeMode: false, checkoutReady: false })).toBe(true);
  });

  it("always uses simulated checkout in judge mode", () => {
    expect(guardianUsesSimulation({ judgeMode: true, checkoutReady: true })).toBe(true);
  });

  it("does not switch to simulation while the setup check is still loading", () => {
    expect(guardianUsesSimulation({ judgeMode: false, checkoutReady: undefined })).toBe(false);
  });
});

describe("server checkout routing", () => {
  it("sends a real order to PayPal", () => {
    expect(
      serverUsesSimulation({ requestedSimulation: false, judgeMode: false, orderId: "5O190127" }),
    ).toBe(false);
  });

  it("keeps judge accounts on the simulated path even if the browser asks for PayPal", () => {
    expect(
      serverUsesSimulation({ requestedSimulation: false, judgeMode: true, orderId: undefined }),
    ).toBe(true);
  });

  it("captures DEMO orders through the simulated path", () => {
    expect(
      serverUsesSimulation({ requestedSimulation: false, judgeMode: false, orderId: "DEMO-abc" }),
    ).toBe(true);
  });
});
