# Spendemon roadmap

## Hackathon readiness checklist (in progress)
- [ ] Signed-in PayPal self-test, return-state recovery, capture/webhook/credit tests
- [ ] Idempotent refund reversal and Vault timeline
- [ ] Savings Autopilot with validated proposals, deterministic fallback, shared AI generation
- [ ] Spendemon Savings Vault story and idempotent sandbox withdrawals
- [ ] USD formatting throughout without changing stored integers
- [ ] Judge entry, spotlight tour, clearly simulated checkout
- [ ] Secret hygiene, route/Guardian tests, documentation and verification at 360px

## Phase 1 — "Pay. Save. Evolve." upgrade (done)
- [x] Answer: where to see the preview
- [x] Database: savings goals, PayPal ledger (extend shop_orders), inventory, milestone rewards, webhook events, atomic credit function
- [x] PayPal engine: goal contributions + shop through one verified capture path; webhook route with signature check + dedup
- [x] Save-to-Level page (/goals)
- [x] AI Purchase Guardian before Loot Shop checkout
- [x] Monster Marketplace with server inventory
- [x] Transaction Vault page (/vault)
- [x] Quests: savings/review quests, difficulty; XP from verified milestones claimed once
- [x] AI Financial Insights card
- [x] Dashboard: PayPal savings quest, recent transactions, demo journey checklist

## Phase 2 — Demo/judge-ready brief
- [x] Sandbox setup notice on Goals + Marketplace; test-mode note in Purchase Guardian
- [x] Goals: separate completed-goals section
- [x] Vault: date filter + side panel with status timeline
- [x] Dashboard: "Total saved via PayPal" (verified, non-demo only; demo shown separately)
- [x] Purchase Guardian: "AI explanation" / "Calculated fallback" labels; pay button never waits for AI
- [x] Demo mode: Start demo / Reset demo buttons (own data only) + first-run guided tour
- [x] Reliability: pinned framer-motion and ai-gateway, 4 new tests (date filter, timeline, completed goals, total saved), error screen on every page, build + lint (0 errors) + tests (37 pass)
- [x] Docs: README for judges, docs/DEMO_SCRIPT.md
- [x] Mobile: every page checked at 360px, no sideways scrolling (header, streak row, cards fixed)

## Honest status / not done yet
- [ ] PayPal Sandbox checkout untested end to end: needs PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID
- [ ] Live AI answers untested: needs GEMINI_API_KEY (calculated fallback works today)
- [ ] Existing players and records from the old app not imported yet (waiting on exports)
- [ ] The guided tour is a step-by-step card; it does not yet highlight on-screen elements
- [ ] Lint shows 7 harmless warnings in shared UI files
