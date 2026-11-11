# Spendemon roadmap

## Hackathon readiness checklist (done)
- [x] PayPal self-test page (/judges), clearer return states, capture/webhook/credit tests
- [x] Refunds reverse value once (milestone rewards kept) and show in the Vault timeline
- [x] Savings Autopilot: checked AI proposals, calculated fallback, one shared AI path
- [x] Spendemon Savings Vault story; one-per-goal withdrawals, labelled Simulated payout when unavailable
- [x] USD everywhere; stored amounts unchanged
- [x] Judge entry (isolated throwaway account), spotlight tour, labelled simulated checkout
- [x] Demo payments always read "Simulated", never "Verified"
- [x] .env ignored + .env.example, routing/Guardian/every-page tests, README pitch, demo script, 360px check

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
- [ ] Real PayPal Sandbox checkout not tried end to end yet: PayPal is connected, but the webhook ID and webhook registration are still needed
- [ ] Real Sandbox Payouts not tried (falls back to a labelled Simulated payout)
- [ ] App owner account not set, so nobody sees the "Sandbox setup needed" notice yet
- [ ] Existing players and records from the old app not imported (waiting on exports)
- [ ] README needs the live URL and demo video link
