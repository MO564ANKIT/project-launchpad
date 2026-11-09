# Spendemon: Pay. Save. Evolve.

A budgeting game. You log spending, stay under budget, and your monsters level up. Savings goals are funded through **PayPal Sandbox** (test money only), and a payment counts only after the server has checked it with PayPal.

## For judges: 3-minute tour

1. **Sign up** with email and password, then confirm your email.
2. The **guided tour** opens on first sign-in. It shows the dashboard, expenses, goals and the Marketplace.
3. On the dashboard, press **Start demo**. This adds a sample goal and a verified sample payment to *your own account only*, marked as demo. **Reset demo** removes them.
4. **Goals** (`/goals`): active goals with progress rings and milestones; finished goals sit in a separate **Completed goals** section.
5. **Vault** (`/vault`): every PayPal payment. Filter by type, status and **date**, and tap a row to open the side panel with a **status timeline**.
6. **Marketplace** (`/loot-shop`): pick an item to open the **AI Purchase Guardian**. It labels its advice **AI explanation** or **Calculated fallback**. The pay button works straight away and never waits for the AI.

A full walkthrough script is in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## What is real and what is simulated

| Area | Status |
| --- | --- |
| Accounts, saves, goals, orders | Real, stored in Lovable Cloud with per-player access rules |
| PayPal | **Sandbox only.** No real money moves. The server verifies each capture before crediting it |
| Demo journey | Sample rows flagged `is_demo`, never counted in "Total saved via PayPal" |
| AI (Guardian, insights, roast chat) | Live when the AI key is set; otherwise a calculated fallback, clearly labelled |

If the PayPal Sandbox keys are not configured, Goals and the Marketplace show a **"Sandbox setup needed"** notice and checkout is paused. Demo mode still works.

## Tech

TanStack Start (React 19), Tailwind CSS v4, Lovable Cloud (database and auth), server functions for payments and AI.

```sh
bun install
bun run dev      # local dev server
bun run test     # unit tests (vitest)
bun run lint
bun run build
```

Server-side secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `GEMINI_API_KEY`. None of them ever reach the browser.

Health check: `GET /api/public/paypal-health` returns only true/false readiness flags.
