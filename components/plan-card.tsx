"use client";

import { motion, useReducedMotion } from "motion/react";
import { usd, type RankedPlan } from "@/lib/cost/estimate";
import type { Persona } from "@/lib/personas";
import { MetalBadge } from "@/components/metal-badge";
import { Term } from "@/components/term-tip";

export function networkSummary(r: RankedPlan, persona: Persona) {
  const out = persona.providers.filter((p) => r.plan.providers[p.id] === "out");
  const unknown = persona.providers.filter((p) => r.plan.providers[p.id] === "unknown");
  const uncovered = persona.drugs.filter((d) => r.plan.drugs[d.id] === "not-covered");
  return { out, unknown, uncovered, clean: out.length === 0 && uncovered.length === 0 };
}

function Status({ kind, children }: { kind: "in" | "out" | "unknown" | "covered" | "not-covered"; children: React.ReactNode }) {
  const tone =
    kind === "in" || kind === "covered" ? "text-good" : kind === "unknown" ? "text-warn" : "text-bad";
  const glyph = kind === "in" || kind === "covered" ? "✓" : kind === "unknown" ? "?" : "✕";
  return (
    <li className={`flex items-center gap-2 text-sm ${tone}`}>
      <span aria-hidden className="w-3 text-center font-semibold">
        {glyph}
      </span>
      <span className="text-muted">{children}</span>
    </li>
  );
}

export function PlanCard({
  ranked,
  rank,
  best,
  persona,
  inCompare,
  compareFull,
  onCompare,
  onChoose,
  onHover,
}: {
  ranked: RankedPlan;
  rank: number;
  best: boolean;
  persona: Persona;
  inCompare: boolean;
  compareFull: boolean;
  onCompare: () => void;
  onChoose: () => void;
  onHover: (on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const { plan, estimate } = ranked;
  const left = estimate.monthlyLeft;
  const net = networkSummary(ranked, persona);
  const titleId = `plan-${plan.id}-title`;
  return (
    <motion.li
      layout={!reduce}
      transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocusCapture={() => onHover(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onHover(false);
      }}
      aria-labelledby={titleId}
      className={`card relative grid gap-5 p-5 transition-shadow hover:shadow-float sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6 ${
        best ? "ring-1 ring-ink" : ""
      }`}
    >
      {best && (
        <span className="absolute -top-3 left-5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-wide text-bg uppercase">
          Best fit for your year
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-dim tabular">#{rank}</span>
          <MetalBadge metal={plan.metal} />
          <span className="text-xs text-dim">
            <Term k={plan.type === "HMO" ? "hmo" : plan.type === "EPO" ? "epo" : "ppo"}>{plan.type}</Term>
          </span>
          {plan.hsaEligible && (
            <span className="text-xs text-dim">
              <Term k="hsa">HSA</Term>
            </span>
          )}
          {plan.qualityRating !== null && (
            <span className="text-xs text-dim" aria-label={`${plan.qualityRating} of 5 stars`}>
              {"★".repeat(plan.qualityRating)}
              <span className="text-line-strong">{"★".repeat(5 - plan.qualityRating)}</span>
            </span>
          )}
        </div>
        <div>
          <h3 id={titleId} className="text-lg leading-tight font-medium">
            {plan.issuer} <span className="text-muted">{plan.name}</span>
          </h3>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-dim">
              <Term k="fit">Your year</Term>
            </dt>
            <dd className="display mt-0.5 text-2xl tabular">{usd(estimate.yearlyTotal)}</dd>
          </div>
          <div>
            <dt className="text-dim">
              <Term k="premium">Monthly</Term>
            </dt>
            <dd className="mt-0.5 text-2xl tabular">{usd(plan.premium)}</dd>
          </div>
          <div>
            <dt className="text-dim">Left on your card</dt>
            <dd className={`mt-0.5 text-2xl tabular ${left < 0 ? "text-bad" : "text-good"}`}>
              {left < 0 ? `−${usd(-left)}` : usd(left)}
              <span className="text-sm text-dim">/mo</span>
            </dd>
          </div>
          <div>
            <dt className="text-dim">
              <Term k="deductible">Deductible</Term>
            </dt>
            <dd className="mt-0.5 text-2xl tabular">{usd(plan.deductible)}</dd>
          </div>
        </dl>

        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {persona.providers.map((p) => {
            const s = plan.providers[p.id] ?? "unknown";
            return (
              <Status key={p.id} kind={s}>
                {p.name.split(",")[0]} · {s === "in" ? "in network" : s === "out" ? "out of network" : "we'll confirm within 4 days"}
              </Status>
            );
          })}
          {persona.drugs.map((d) => {
            const s = plan.drugs[d.id] ?? "unknown";
            return (
              <Status key={d.id} kind={s}>
                {d.name.split(" ")[0]} · {s === "covered" ? "covered" : s === "not-covered" ? "not covered, full price" : "checking"}
              </Status>
            );
          })}
        </ul>

        {!net.clean && (
          <p className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">
            {estimate.uncovered > 0 ? (
              <>
                About <strong className="tabular">{usd(estimate.uncovered)}</strong> of your year would be full price on this plan
{" "}
                because{" "}
                {net.out.length > 0 && <>{net.out.map((p) => p.name.split(",")[0]).join(" and ")} {net.out.length > 1 ? "are" : "is"} out of network</>}
                {net.out.length > 0 && net.uncovered.length > 0 && " and "}
                {net.uncovered.length > 0 && <>it doesn&apos;t cover {net.uncovered.map((d) => d.name.split(" ")[0]).join(" or ")}</>}.
              </>
            ) : (
              <>This plan doesn&apos;t cover everyone you added.</>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-row gap-2 sm:w-40 sm:flex-col sm:justify-center">
        <button
          type="button"
          onClick={onChoose}
          className="btn btn-dark btn-sm flex-1 sm:flex-none"
        >
          Choose this plan
        </button>
        <button
          type="button"
          aria-pressed={inCompare}
          disabled={!inCompare && compareFull}
          onClick={onCompare}
          className={`btn btn-secondary btn-sm flex-1 sm:flex-none ${inCompare ? "border-ink! bg-well" : ""}`}
        >
          {inCompare ? "✓ Comparing" : "Compare"}
        </button>
      </div>
    </motion.li>
  );
}
