import { z } from "zod";

export const MIN_CONTRIBUTION_CENTS = 100;
export type PlanGoal = { id: string; target_cents: number; contributed_cents: number; deadline: string | null; completed_at: string | null };
export const planSchema = z.object({
  goalId: z.string().uuid(),
  suggestedAmountCents: z.number().int().min(MIN_CONTRIBUTION_CENTS).max(50000),
  reason: z.string().trim().min(1).max(600),
  risk: z.enum(["low", "medium", "high"]),
  alternativeAmountCents: z.number().int().min(MIN_CONTRIBUTION_CENTS).max(50000),
}).strict();
export type SavingsPlan = z.infer<typeof planSchema>;
export function validatePlan(value: unknown, goals: PlanGoal[], remainingBudget: number): SavingsPlan | null {
  const parsed = planSchema.safeParse(value);
  if (!parsed.success) return null;
  const plan = parsed.data;
  const goal = goals.find(g => g.id === plan.goalId && !g.completed_at);
  if (!goal) return null;
  const cap = Math.min(50000, goal.target_cents - goal.contributed_cents, remainingBudget);
  if (plan.suggestedAmountCents > cap || plan.alternativeAmountCents > cap || plan.alternativeAmountCents > plan.suggestedAmountCents) return null;
  return plan;
}
export function fallbackPlan(goals: PlanGoal[], remainingBudget: number, today: string): SavingsPlan | null {
  const goal = [...goals].filter(g => !g.completed_at && g.target_cents - g.contributed_cents >= 100)
    .sort((a,b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"))[0];
  if (!goal || remainingBudget < 100) return null;
  const remaining = goal.target_cents - goal.contributed_cents;
  const days = goal.deadline ? Math.max(1, Math.ceil((Date.parse(goal.deadline) - Date.parse(today)) / 86400000)) : 30;
  const amount = Math.min(50000, remaining, remainingBudget, Math.max(100, Math.ceil(remaining / days)));
  return { goalId: goal.id, suggestedAmountCents: amount, alternativeAmountCents: Math.max(100, Math.floor(amount / 2)), risk: amount > remainingBudget / 2 ? "high" : amount > remainingBudget / 4 ? "medium" : "low", reason: "A daily share of your earliest goal, capped by your remaining monthly budget. Recorded expenses and contributions only; this is not a bank balance." };
}