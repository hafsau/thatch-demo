"use client";

import { useState } from "react";
import { usd, type RankedPlan } from "@/lib/cost/estimate";
import { marketFor } from "@/lib/market";
import type { Persona } from "@/lib/personas";
import { LedgerPanel } from "@/components/ledger-panel";
import { MetalBadge } from "@/components/metal-badge";

export function WhatsLeftStep({ persona, pick, onBack, onEnroll }: { persona: Persona; pick: RankedPlan; onBack: () => void; onEnroll: () => void }) {
  const left = pick.estimate.monthlyLeft;
  const items = marketFor(persona.id);
  const [added, setAdded] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const committed = items.filter((i) => added.includes(i.id)).reduce((s, i) => s + i.monthly, 0);
  const remaining = left - committed;

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-[60ch]">
        <p className="eyebrow">Step 4 of 5</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">
          {left > 0 ? (
            <>
              <span className="text-good">{usd(left)}</span> a month is yours for care.
            </>
          ) : left === 0 ? (
            <>Your budget covers the premium exactly.</>
          ) : (
            <>
              This plan costs <span className="text-bad">{usd(-left)}</span> more than your budget.
            </>
          )}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {left > 0 ? (
            <>
              After the {usd(pick.plan.premium)} premium, the rest of your {usd(persona.budget)} loads onto your Thatch Card on the first of every month.
              Spend it on copays, prescriptions, or anything in Thatch Market. Nothing to submit.
            </>
          ) : left === 0 ? (
            <>Nothing loads onto your card this year, but every dollar of your budget went to coverage you chose.</>
          ) : (
            <>
              The difference comes out of your paycheck before tax, about {usd(-left * 12)} a year. If that&apos;s not right for you, a Bronze
              plan would leave money on the card; the trade-off is what you&apos;d pay when you use it.
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <MetalBadge metal={pick.plan.metal} />
              <p className="mt-1 text-lg font-medium">
                {pick.plan.issuer} <span className="text-muted">{pick.plan.name}</span>
              </p>
              <p className="text-sm text-muted">
                {usd(pick.plan.premium)}/mo · {usd(pick.plan.deductible)} deductible · coverage starts Jan 1
              </p>
            </div>
            <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">
              Change plan
            </button>
          </div>

          {left > 0 && !dismissed && (
            <section aria-labelledby="mkt-h" className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 id="mkt-h" className="text-base font-medium">
                    Things that fit in {usd(left)} a month
                  </h2>
                  <p className="text-sm text-muted">Optional. Sized to what&apos;s left, not to what sells. You can do this later from the app.</p>
                </div>
                <button type="button" onClick={() => setDismissed(true)} className="text-sm text-dim hover:text-ink">
                  Not now
                </button>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const on = added.includes(item.id);
                  const fits = on || item.monthly <= remaining;
                  return (
                    <li key={item.id} className={`card flex flex-col gap-2 p-4 ${!fits ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-dim">{item.partner}</p>
                        </div>
                        <p className="tabular text-sm">
                          {usd(item.monthly)}
                          <span className="text-dim">/mo</span>
                        </p>
                      </div>
                      <p className="text-sm text-muted">{item.why}</p>
                      <button
                        type="button"
                        aria-pressed={on}
                        disabled={!fits}
                        onClick={() => setAdded((a) => (on ? a.filter((x) => x !== item.id) : [...a, item.id]))}
                        className={`mt-auto self-start rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${
                          on ? "border-ink bg-ink text-bg" : "border-line-strong text-muted hover:text-ink"
                        }`}
                      >
                        {on ? "✓ Added" : fits ? "Add" : `Over by ${usd(item.monthly - remaining)}`}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">
              ← Back to plans
            </button>
            <button type="button" onClick={onEnroll} className="btn btn-primary">
              Enroll in {pick.plan.issuer} {pick.plan.name} →
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 flex flex-col gap-3">
          <LedgerPanel persona={persona} focus={pick} label="Your pick" />
          {committed > 0 && (
            <div className="card p-4 text-sm">
              <p className="eyebrow eyebrow-quiet">After what you added</p>
              <div className="mt-2 flex justify-between">
                <span className="text-muted">Still unspent each month</span>
                <span className={`tabular font-medium ${remaining >= 0 ? "text-good" : "text-bad"}`}>{usd(remaining)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
