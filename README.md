# Spendemon: Pay. Save. Evolve.

> **Live app:** _add published URL here_ · **Demo video:** _add video link here_

## The problem

Budgeting apps tell you what you already spent. They rarely help you put money aside at the moment you decide not to spend it, and saving feels like a chore with no reward.

## The solution

Spendemon is a budgeting game. You log spending, stay under budget and your monsters level up. When you skip an impulse buy, you move that money into a savings goal with **PayPal**, and your saver monster, Saverion, grows with every verified payment. Hitting 25/50/75/100% of a goal unlocks rewards.

## How PayPal is used

- **Checkout (Orders v2):** goal contributions and Marketplace purchases create a PayPal order on the server. Prices come only from the server catalogue.
- **Verified capture:** after the player approves, the server captures the order and checks the amount, currency and owner before crediting anything. Credit is idempotent: a refresh, retry or double click never pays out twice.
- **Webhooks:** signed PayPal events are verified, de-duplicated and reconciled. Refunds and reversals undo the purchased items or the saved amount once, never below zero. Milestone rewards already earned are kept, and the refund shows in the Vault timeline.
- **Spendemon Savings Vault and withdrawals (Payouts):** contributions go to the Spendemon Savings Vault, a PayPal **Sandbox** merchant account that holds the saved money. A completed goal can be withdrawn with the PayPal Payouts API. Each goal can be paid out once only. If Payouts is not enabled on the sandbox account, the app records a clearly labelled **Simulated payout** instead.

## How AI is used

- **Savings Autopilot (Goals page):** "Plan my savings" reads your budget, recent spending and goal deadlines, and the AI proposes how much to save today, with a reason, a risk level and a lower alternative. The server checks the proposal: the goal must be yours, the amount must be a whole number of cents and must fit the goal's remaining target and your remaining monthly budget. If the AI answer is invalid or unavailable, a calculated plan is used and labelled **Calculated fallback**. **The AI never pays.** You confirm every payment yourself.
- **Purchase Guardian (Marketplace):** before checkout, facts calculated on the server (budget left, days of spending) plus advice labelled **AI explanation** or **Calculated fallback**. The pay button never waits for the AI.
- **Insights and Roast chat:** one shared AI path (Gemini key if set, otherwise the built-in Lovable AI).

## Architecture in 5 lines

1. TanStack Start (React 19) app with server functions; Tailwind CSS v4 for styling.
2. Lovable Cloud database and auth; each player's game state is one row, saved with a version check.
3. All payment and AI work runs in server functions that require a signed-in player; secrets never reach the browser.
4. PayPal calls go through the Lovable connector gateway; webhooks land on `/api/public/paypal/webhook` and are signature-checked.
5. Credits, refunds and payouts are database functions that only the server can call, so they are atomic and run once.

## For judges: 3-minute tour

1. On the sign-in screen press **Try as a judge**. This creates a fresh, isolated test account (no email needed) with the demo journey already started. Nothing you do touches any other player.
2. A **spotlight tour** highlights the real buttons on each page. Skip it at any time.
3. **Dashboard:** "Total saved via PayPal" counts verified payments only. Demo money is shown separately. **Reset demo** clears demo rows.
4. **Goals:** press **Plan my savings**, review the plan, then **Confirm simulated payment**. The money is recorded in the Vault and the goal ring fills. Completed goals sit under **Completed goals**, with **Withdraw savings**.
5. **Marketplace:** pick an item to open the **Purchase Guardian**.
6. **Vault:** filter by type, status and date, then tap a row to see its status timeline.
7. **`/judges`:** the PayPal self-test. Green or red for checkout keys, webhook ID and AI, plus the exact name of any missing secret.

Full walkthrough: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## What is real and what is simulated

| Area | Status |
| --- | --- |
| Accounts, game saves, goals, orders | Real, stored in Lovable Cloud with per-player access rules |
| PayPal checkout and capture | **PayPal Sandbox only.** No real money. The server verifies every capture before crediting |
| Judge accounts and demo goals | **Simulated checkout:** same screens, labelled "Simulated", PayPal is never called, never counted as verified |
| Refunds and reversals | Real webhook handling. Value is reversed once; milestone rewards are kept |
| Spendemon Savings Vault | A PayPal Sandbox merchant account holding test money, **not a bank deposit** |
| Withdraw savings | PayPal Sandbox Payouts when enabled; otherwise a labelled **Simulated payout**. Always simulated for demo goals |
| AI (Autopilot, Guardian, insights, roast) | Live AI with server checks; a labelled **Calculated fallback** when AI is unavailable |

All amounts are shown in **USD**.

## Running it

```sh
bun install
bun run dev      # local dev server
bun run test     # unit tests (vitest)
bun run lint
bun run build
```

Server-side settings (names only, see `.env.example`):

| Name | Needed for |
| --- | --- |
| `PAYPAL_API_KEY`, `LOVABLE_API_KEY` | PayPal Sandbox calls through the connector gateway (set by connecting PayPal) |
| `PAYPAL_WEBHOOK_ID` | Verifying PayPal webhooks |
| `GEMINI_API_KEY` | Optional; the built-in Lovable AI is used without it |
| `SPENDEMON_OWNER_USER_ID` | Only this account sees the "Sandbox setup needed" notice |

Health check: `GET /api/public/paypal-health` returns true/false readiness flags only, never secret values.
