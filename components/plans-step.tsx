"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { RankedPlan, SortKey } from "@/lib/cost/estimate";
import { EVENTS, type Persona } from "@/lib/personas";
import { CompareDialog } from "@/components/compare-dialog";
import { LedgerPanel } from "@/components/ledger-panel";
import { PlanCard } from "@/components/plan-card";

const SORTS: { id: SortKey; label: string; hint: string }[] = [
  { id: "fit", label: "Best for your year", hint: "Premiums plus the care you listed" },
  { id: "premium", label: "Lowest monthly", hint: "What most sites sort by" },
  { id: "deductible", label: "Lowest deductible", hint: "Plan pays sooner" },
];

export function PlansStep({
  persona,
  ranked,
  sort,
  onSort,
  events,
  onEditYear,
  onChoose,
  sourceNote,
}: {
  persona: Persona;
  ranked: RankedPlan[];
  sort: SortKey;
  onSort: (s: SortKey) => void;
  events: string[];
  onEditYear: () => void;
  onChoose: (id: string) => void;
  sourceNote: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [cmpOpen, setCmpOpen] = useState(false);

  const byFit = [...ranked].sort((a, b) => a.estimate.yearlyTotal - b.estimate.yearlyTotal);
  const best = byFit[0];
  const focus = ranked.find((r) => r.plan.id === hovered) ?? best;
  const label = hovered && hovered !== best.plan.id ? "Previewing" : "Best fit for your year";
  const a = ranked.find((r) => r.plan.id === compare[0]) ?? null;
  const b = ranked.find((r) => r.plan.id === compare[1]) ?? null;

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 2 ? c : [...c, id]));

  const yearWords = events
    .map((id) => EVENTS[id]?.label.toLowerCase())
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[60ch]">
          <p className="eyebrow">Step 3 of 5</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">
            {ranked.length} plans, priced for your year.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Assuming {yearWords || "no care at all"}.{" "}
            <button type="button" onClick={onEditYear} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              Change that
            </button>
            . Hover a plan to see your budget with it.
          </p>
        </div>
        <fieldset className="flex flex-wrap gap-1 self-start rounded-[22px] border border-line bg-raised p-1">
          <legend className="sr-only">Sort plans</legend>
          {SORTS.map((s) => (
            <label key={s.id} className="cursor-pointer" title={s.hint}>
              <input type="radio" name="sort" value={s.id} checked={sort === s.id} onChange={() => onSort(s.id)} className="peer sr-only" />
              <span className="block rounded-full px-3 py-1.5 text-sm text-muted transition-colors peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:text-ink">
                {s.label}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      {sort === "premium" && (
        <p role="note" className="rounded-md border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          Lowest monthly isn&apos;t lowest cost. For your year, the cheapest premium here costs about{" "}
          <strong className="tabular">
            {Math.round((ranked[0].estimate.yearlyTotal - best.estimate.yearlyTotal) / 100) * 100 > 0
              ? `$${(Math.round((ranked[0].estimate.yearlyTotal - best.estimate.yearlyTotal) / 100) * 100).toLocaleString()}`
              : "the same"}
          </strong>{" "}
          more in total than the best fit.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ol className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {ranked.map((r, i) => (
              <PlanCard
                key={r.plan.id}
                ranked={r}
                rank={i + 1}
                best={r.plan.id === best.plan.id}
                persona={persona}
                inCompare={compare.includes(r.plan.id)}
                compareFull={compare.length >= 2}
                onCompare={() => toggleCompare(r.plan.id)}
                onChoose={() => onChoose(r.plan.id)}
                onHover={(on) => setHovered(on ? r.plan.id : (h) => (h === r.plan.id ? null : h))}
              />
            ))}
          </AnimatePresence>
        </ol>

        <div className="lg:sticky lg:top-20 flex flex-col gap-3">
          <LedgerPanel persona={persona} focus={focus} label={label} />
          <div className="card flex flex-col gap-2 p-4">
            <p className="eyebrow eyebrow-quiet">Compare</p>
            {compare.length === 0 && <p className="text-sm text-muted">Pick two plans to see them side by side, with the arithmetic.</p>}
            {compare.length > 0 && (
              <ul className="text-sm">
                {compare.map((id) => {
                  const r = ranked.find((x) => x.plan.id === id)!;
                  return (
                    <li key={id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {r.plan.issuer} {r.plan.name}
                      </span>
                      <button type="button" onClick={() => toggleCompare(id)} className="text-xs text-dim hover:text-ink" aria-label={`Remove ${r.plan.name} from comparison`}>
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              disabled={compare.length < 2}
              onClick={() => setCmpOpen(true)}
              className="btn btn-dark btn-sm mt-1 w-full"
            >
              Compare {compare.length === 2 ? "these two" : `(${compare.length}/2)`}
            </button>
          </div>
          <p className="px-1 text-xs leading-relaxed text-dim">{sourceNote}. Estimates, not quotes.</p>
        </div>
      </div>

      <CompareDialog
        open={cmpOpen}
        a={a}
        b={b}
        persona={persona}
        onClose={() => setCmpOpen(false)}
        onChoose={(id) => {
          setCmpOpen(false);
          onChoose(id);
        }}
      />
    </div>
  );
}
