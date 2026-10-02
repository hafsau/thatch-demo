# Fitting Room

**▶ Live: [thatch-demo.vercel.app](https://thatch-demo.vercel.app)** · [Case study](https://thatch-demo.vercel.app/about) · [Plan card spec](https://thatch-demo.vercel.app/docs/plan-card)

**Try a health plan on before you buy it.** An unofficial product design concept for [Thatch](https://thatch.com) by [Hafsa Usmani](https://hafsausmani.com), built as my application for the Product Designer role.

> **Not affiliated with Thatch.** Nothing here is insurance advice. Plan figures are estimates for illustration.

---

## The idea

Thatch gives every employee a monthly health budget. They pick their own plan, and whatever the premium doesn't use loads onto a Thatch Card. That model makes one number visible that no other marketplace can show: **what the year will really cost you, and what's left for your care.**

Every marketplace sells on monthly premium. Fitting Room ranks plans by estimated yearly cost for *your* year (your doctors, your prescriptions, what's likely to happen) and keeps a live ledger of budget → premium → left on your card as you compare.

The full reasoning, the explorations that lost, and the limits are on the **[case study page](https://thatch-demo.vercel.app/about)**.

## The flow

| Step | What it does |
|---|---|
| **Your budget** | The hero number, plus an exact-address confirmation up front (zip-code quotes that change at checkout are the most common complaint in reviews). |
| **Try it on** | Add doctors, prescriptions, and "what's likely this year" as chips. No forms-as-interrogation. |
| **Plans that fit** | Ranked by estimated year. Each card shows monthly premium, what's left on the card, and whether *your* doctors and drugs are covered. A live ledger previews whichever plan you hover. |
| **Compare** | Two plans side by side, in plain words, with the arithmetic shown so you can check it. |
| **What's left** | Thatch Market suggestions sized to the leftover, dismissible. |
| **You're covered** | A 30-day coverage timeline and an enrollment confirmation you can show before your member ID arrives. |

Three households, built from themes in public reviews, are switchable at the top: Maya (29, Austin), the Okafors (family of four, Columbus), and Dennis (63, Phoenix).

## Plan data

`data/plans/*.json` holds the plans for each household in one small schema (`lib/plans/types.ts`).

- `scripts/fetch-plans.ts` pulls **real plans from the CMS Marketplace API** for each household's county, with provider and drug coverage, and writes them in that schema. It needs a free key from [developer.cms.gov/marketplace-api](https://developer.cms.gov/marketplace-api/).
- `scripts/representative-plans.ts` writes **representative plans** modeled on 2026 individual-market plans in each county, for when the key isn't available. Each file says which source it is, and the UI shows it.

## The cost model

`lib/cost/estimate.ts` walks the year's care one unit at a time: deductible first, then copay or coinsurance, capped at the out-of-pocket maximum. Care from an out-of-network doctor or an uncovered drug is paid at full price and doesn't count toward the cap, which is how HMO and EPO plans behave. It's deliberately simple and the compare view shows every line. Known limits (separate drug deductibles, tiered networks, embedded family deductibles) are listed on the case study page.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # cost model and persona tests (Vitest)
npm run e2e        # Playwright against a production build, with axe
```

**Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Motion, Vitest, Playwright + axe, Lighthouse CI.

---

Built by Hafsa Usmani. Feedback welcome.
