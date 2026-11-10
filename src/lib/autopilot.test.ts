import { describe, expect, it } from "vitest";
import { fallbackPlan, validatePlan, type PlanGoal } from "./autopilot";
import { computeGuardianFacts, usdCentsToPaise } from "./ai-server/financeFacts";
import { formatMoney, formatSignedMoney } from "./money";

const goal: PlanGoal = {
  id: "11111111-1111-4111-8111-111111111111",
  target_cents: 1000,
  contributed_cents: 200,
  deadline: "2026-11-10",
  completed_at: null,
};
const plan = {
  goalId: goal.id,
  suggestedAmountCents: 400,
  alternativeAmountCents: 200,
  risk: "low",
  reason: "Fits recorded budget",
};
describe("Savings Autopilot safeguards", () => {
  it("accepts an owned goal with integer amounts within the $1 minimum", () => {
    expect(validatePlan(plan, [goal], 500)?.suggestedAmountCents).toBe(400);
  });
  it("rejects another player's goal", () => {
    expect(validatePlan(plan, [], 500)).toBeNull();
  });
  it("rejects amounts below 100 cents", () => {
    expect(validatePlan({ ...plan, suggestedAmountCents: 99 }, [goal], 500)).toBeNull();
  });
  it("rejects non-integer cents", () => {
    expect(validatePlan({ ...plan, suggestedAmountCents: 100.5 }, [goal], 500)).toBeNull();
  });
  it("never exceeds remaining monthly budget", () => {
    expect(validatePlan(plan, [goal], 399)).toBeNull();
  });
  it("never exceeds the goal's remaining 800 cents", () => {
    expect(validatePlan({ ...plan, suggestedAmountCents: 801 }, [goal], 2000)).toBeNull();
  });
  it("rejects completed goals", () => {
    expect(validatePlan(plan, [{ ...goal, completed_at: "2026-11-09" }], 500)).toBeNull();
  });
  it("rejects an alternative higher than the suggestion", () => {
    expect(validatePlan({ ...plan, alternativeAmountCents: 401 }, [goal], 500)).toBeNull();
  });
  it("caps deterministic fallback at the remaining 150-cent budget", () => {
    expect(fallbackPlan([goal], 150, "2026-11-09")?.suggestedAmountCents).toBe(150);
  });
  it("does not invent savings when budget remaining is less than $1", () => {
    expect(fallbackPlan([goal], 99, "2026-11-09")).toBeNull();
  });
});
describe("USD minor units", () => {
  it("keeps 499 cents unchanged for Guardian comparison", () => {
    expect(usdCentsToPaise(499)).toBe(499);
  });
  it("formats stored 12345 minor units as USD", () => {
    expect(formatMoney(12345)).toBe("$123.45");
    expect(formatSignedMoney(-12345)).toBe("-$123.45");
  });
  it("computes Guardian routing with USD rather than currency conversion", () => {
    expect(
      computeGuardianFacts(
        { monthlyBudgetPaise: 500, categoryBudgetsPaise: {}, expenses: [], events: [] },
        499,
        "2026-11-09",
      ).verdict,
    ).toBe("tight");
  });
});
