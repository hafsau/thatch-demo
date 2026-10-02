"use client";

import type { RefObject } from "react";
import { usd, type RankedPlan } from "@/lib/cost/estimate";
import type { Persona } from "@/lib/personas";
import type { CostShare } from "@/lib/plans/types";
import { MetalBadge } from "@/components/metal-badge";
import { Term } from "@/components/term-tip";

function share(s: CostShare) {
  if (s.copay !== undefined) return `${usd(s.copay)} copay${s.afterDeductible ? " after deductible" : ""}`;
  const pct = Math.round((s.coinsurance ?? 0) * 100);
  return pct === 0 ? "Covered in full" : `You pay ${pct}%${s.afterDeductible ? " after deductible" : ""}`;
}

function Row({ label, cells, strong = false }: { label: React.ReactNode; cells: React.ReactNode[]; strong?: boolean }) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="py-2.5 pr-4 text-left text-sm font-normal text-muted">
        {label}
      </th>
      {cells.map((c, i) => (
        <td key={i} className={`py-2.5 pr-4 text-sm tabular ${strong ? "font-medium" : ""}`}>
          {c}
        </td>
      ))}
    </tr>
  );
}

/**
 * A native <dialog>. The parent holds the ref and calls showModal() in the
 * click handler, so opening never depends on an effect running.
 */
export function CompareDialog({
  ref,
  a,
  b,
  persona,
  onChoose,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  a: RankedPlan | null;
  b: RankedPlan | null;
  persona: Persona;
  onChoose: (id: string) => void;
}) {
  const onClose = () => ref.current?.close();
  if (!a || !b) return null;
  const pair = [a, b];
  const cheaperYear = a.estimate.yearlyTotal <= b.estimate.yearlyTotal ? a : b;
  const diff = Math.abs(a.estimate.yearlyTotal - b.estimate.yearlyTotal);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="cmp-title"
      className="m-auto w-[min(100vw-2rem,900px)] rounded-lg bg-raised p-0 text-body shadow-overlay backdrop:bg-dark/40 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Side by side</p>
            <h2 id="cmp-title" className="display mt-1 text-3xl">
              Same year, two plans.
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">
              For the year you described, <strong className="text-ink">{cheaperYear.plan.issuer} {cheaperYear.plan.name}</strong> comes out about{" "}
              <strong className="tabular text-ink">{usd(diff)}</strong> cheaper in total
              {cheaperYear.plan.premium > pair.find((p) => p !== cheaperYear)!.plan.premium ? ", even though its premium is higher" : ""}.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close comparison" className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr>
              <td className="pb-3" />
              {pair.map((r) => (
                <th key={r.plan.id} scope="col" className="pb-3 pr-4 text-left align-top">
                  <MetalBadge metal={r.plan.metal} />
                  <p className="mt-1 leading-tight font-medium">
                    {r.plan.issuer} <span className="text-muted">{r.plan.name}</span>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label={<Term k="fit">Estimated year</Term>} strong cells={pair.map((r) => <span key={r.plan.id} className="display text-2xl">{usd(r.estimate.yearlyTotal)}</span>)} />
            <Row label="Left on your card each month" cells={pair.map((r) => (r.estimate.monthlyLeft < 0 ? <span key={r.plan.id} className="text-bad">−{usd(-r.estimate.monthlyLeft)} from paycheck</span> : <span key={r.plan.id} className="text-good">{usd(r.estimate.monthlyLeft)}</span>))} />
            <Row label={<Term k="premium" />} cells={pair.map((r) => `${usd(r.plan.premium)}/mo`)} />
            <Row label={<Term k="deductible" />} cells={pair.map((r) => usd(r.plan.deductible))} />
            <Row label={<Term k="oopMax" />} cells={pair.map((r) => usd(r.plan.oopMax))} />
            <Row label="Primary care visit" cells={pair.map((r) => share(r.plan.costSharing.primaryCare))} />
            <Row label="Specialist visit" cells={pair.map((r) => share(r.plan.costSharing.specialist))} />
            <Row label="Therapy session" cells={pair.map((r) => share(r.plan.costSharing.mentalHealthOutpatient))} />
            <Row label="Generic prescription" cells={pair.map((r) => share(r.plan.costSharing.genericRx))} />
            <Row label="Brand prescription" cells={pair.map((r) => share(r.plan.costSharing.preferredBrandRx))} />
            <Row label="Hospital stay" cells={pair.map((r) => share(r.plan.costSharing.inpatient))} />
            {persona.providers.map((p) => (
              <Row
                key={p.id}
                label={p.name}
                cells={pair.map((r) => {
                  const s = r.plan.providers[p.id] ?? "unknown";
                  return <span key={r.plan.id} className={s === "in" ? "text-good" : s === "out" ? "text-bad" : "text-warn"}>{s === "in" ? "In network" : s === "out" ? "Out of network" : "Confirming"}</span>;
                })}
              />
            ))}
            {persona.drugs.map((d) => (
              <Row
                key={d.id}
                label={d.name}
                cells={pair.map((r) => {
                  const s = r.plan.drugs[d.id] ?? "unknown";
                  return <span key={r.plan.id} className={s === "covered" ? "text-good" : s === "not-covered" ? "text-bad" : "text-warn"}>{s === "covered" ? "Covered" : s === "not-covered" ? "Not covered" : "Checking"}</span>;
                })}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {pair.map((r) => (
            <div key={r.plan.id} className="rounded-md border border-line bg-bg p-4">
              <p className="eyebrow eyebrow-quiet">How the year adds up</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted">Premiums × 12</span>
                  <span className="tabular">{usd(r.estimate.premiums)}</span>
                </li>
                {r.estimate.lines.map((l) => (
                  <li key={l.label} className={`flex justify-between gap-3 ${l.uncovered ? "text-bad" : ""}`}>
                    <span className={l.uncovered ? "" : "text-muted"}>
                      {l.label}
                      {l.units > 1 ? ` ×${l.units}` : ""}
                      {l.uncovered === "out-of-network" && " (out of network)"}
                      {l.uncovered === "drug-not-covered" && " (not covered)"}
                    </span>
                    <span className="tabular">{usd(l.youPay)}</span>
                  </li>
                ))}
                {r.estimate.hitOopMax && (
                  <li className="flex justify-between text-good">
                    <span>Out-of-pocket maximum caps your share</span>
                    <span className="tabular">−{usd(r.estimate.uncappedOutOfPocket - r.estimate.outOfPocket)}</span>
                  </li>
                )}
                <li className="mt-1 flex justify-between border-t border-line pt-1 font-medium">
                  <span>Total</span>
                  <span className="tabular">{usd(r.estimate.yearlyTotal)}</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onChoose(r.plan.id)}
                className="btn btn-dark btn-sm mt-4 w-full"
              >
                Choose {r.plan.issuer} {r.plan.name}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-dim">
          Estimates use typical in-network prices for the care you listed. Real bills vary. The arithmetic is shown so you can check it.
        </p>
      </div>
    </dialog>
  );
}
