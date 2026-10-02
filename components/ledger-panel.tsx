"use client";

import { usd, type RankedPlan } from "@/lib/cost/estimate";
import type { Persona } from "@/lib/personas";
import { Money } from "@/components/money";
import { Term } from "@/components/term-tip";

/**
 * The live ledger: the homepage hero's budget breakdown, made interactive.
 * It always shows one plan: the best fit, the one being hovered, or the pick.
 */
export function LedgerPanel({ persona, focus, label, compact = false }: { persona: Persona; focus: RankedPlan; label: string; compact?: boolean }) {
  const { plan, estimate } = focus;
  const budget = persona.budget;
  const premShare = Math.min(1, plan.premium / budget);
  const leftShare = Math.max(0, 1 - premShare);
  const over = plan.premium > budget;
  const yearBudget = budget * 12;

  return (
    <section aria-label="Your budget with this plan" aria-live="polite" className={`card flex flex-col gap-5 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <p className="truncate text-sm text-muted">
          {plan.issuer} {plan.name}
        </p>
      </div>

      <div>
        <p className="eyebrow eyebrow-quiet mb-2">Every month</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-sunken" aria-hidden>
          <div className="h-full bg-ink transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${premShare * 100}%` }} />
          <div className="h-full bg-good-fill transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${leftShare * 100}%` }} />
        </div>
        <dl className="mt-3 grid gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">
              Your <Term k="budget">budget</Term>
            </dt>
            <dd className="tabular">{usd(budget)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="flex items-center gap-2 text-muted">
              <span aria-hidden className="inline-block size-2 rounded-full bg-ink" />
              Plan <Term k="premium">premium</Term>
            </dt>
            <dd className="tabular">
              −<Money value={plan.premium} />
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 font-medium">
            <dt className="flex items-center gap-2">
              <span aria-hidden className={`inline-block size-2 rounded-full ${over ? "bg-bad" : "bg-good-fill"}`} />
              {over ? "From your paycheck" : "Left on your card"}
            </dt>
            <dd className={`tabular ${over ? "text-bad" : "text-good"}`}>
              <Money value={Math.abs(estimate.monthlyLeft)} />
              <span className="text-xs font-normal text-dim">/mo</span>
            </dd>
          </div>
        </dl>
        {over && <p className="mt-2 text-xs leading-relaxed text-muted">This premium is more than your budget. The difference comes out of your paycheck before tax.</p>}
      </div>

      {!compact && (
        <div>
          <p className="eyebrow eyebrow-quiet mb-2">Your year, if it goes like you said</p>
          <dl className="grid gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">12 months of premiums</dt>
              <dd className="tabular">
                <Money value={estimate.premiums} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Your share of care{estimate.hitOopMax ? " (capped)" : ""}</dt>
              <dd className="tabular">
                <Money value={estimate.outOfPocket} />
              </dd>
            </div>
            {estimate.uncovered > 0 && (
              <div className="flex justify-between text-bad">
                <dt>Full-price care the plan won&apos;t pay</dt>
                <dd className="tabular">
                  <Money value={estimate.uncovered} />
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1.5 font-medium">
              <dt>
                <Term k="fit">Estimated year</Term>
              </dt>
              <dd className="display text-xl tabular">
                <Money value={estimate.yearlyTotal} />
              </dd>
            </div>
          </dl>
          <p className={`mt-3 rounded-md px-3 py-2 text-sm ${estimate.netAfterBudget >= 0 ? "bg-good-soft text-good" : "bg-sunken text-muted"}`}>
            {estimate.netAfterBudget >= 0 ? (
              <>
                Your {usd(yearBudget)} budget covers all of it, with <strong className="tabular">{usd(estimate.netAfterBudget)}</strong> left over for the year.
              </>
            ) : (
              <>
                Your {usd(yearBudget)} budget covers most of it. You&apos;d cover about{" "}
                <strong className="tabular text-ink">{usd(-estimate.netAfterBudget)}</strong> yourself over the year.
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
