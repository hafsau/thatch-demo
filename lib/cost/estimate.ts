import type { CostShare, Plan, Service } from "@/lib/plans/types";
import type { Utilization } from "@/lib/personas";

/**
 * A deliberately simple, inspectable cost model.
 *
 * It walks the year's care one unit at a time, applies the deductible first,
 * then the copay or coinsurance, and caps the total at the out-of-pocket
 * maximum. Care from an out-of-network doctor, or a drug the plan doesn't
 * cover, is paid at full price and does not count toward the cap, which is how
 * HMO and EPO plans actually behave. It ignores separate drug deductibles,
 * tiered networks, and embedded family deductibles. The case study lists
 * these limits.
 */

export type LineItem = {
  label: string;
  service: Service;
  units: number;
  allowed: number;
  /** What the household pays for this line over the year. */
  youPay: number;
  /** Why this line was paid at full price, if it was. */
  uncovered?: "out-of-network" | "drug-not-covered";
};

export type Estimate = {
  /** premium × 12 */
  premiums: number;
  /** Modeled in-network out-of-pocket, after the OOP max cap. */
  outOfPocket: number;
  /** In-network out-of-pocket before the cap, for explanation. */
  uncappedOutOfPocket: number;
  /** Full-price care the plan won't pay for: out-of-network doctors, uncovered drugs. Not capped. */
  uncovered: number;
  /** Whether the OOP max did the capping. */
  hitOopMax: boolean;
  /** Whether the deductible was met during the year. */
  metDeductible: boolean;
  /** premiums + outOfPocket + uncovered */
  yearlyTotal: number;
  /** budget × 12 − yearlyTotal. Positive means money left on the card at year end. */
  netAfterBudget: number;
  /** budget − premium. What loads onto the card each month before any care. */
  monthlyLeft: number;
  lines: LineItem[];
};

function payFor(share: CostShare, allowed: number, dedRemaining: number): { pay: number; dedUsed: number } {
  if (share.copay !== undefined && !share.afterDeductible) {
    return { pay: Math.min(share.copay, allowed), dedUsed: 0 };
  }
  const dedUsed = Math.min(allowed, dedRemaining);
  const rest = allowed - dedUsed;
  let pay = dedUsed;
  if (rest > 0) {
    if (share.copay !== undefined) pay += Math.min(share.copay, rest);
    else pay += rest * (share.coinsurance ?? 0);
  }
  return { pay, dedUsed };
}

export function estimate(plan: Plan, utilization: Utilization[], monthlyBudget: number): Estimate {
  let dedRemaining = plan.deductible;
  let running = 0;
  let uncovered = 0;
  const lines: LineItem[] = [];

  for (const u of utilization) {
    const outOfNetwork = u.providerId !== undefined && plan.providers[u.providerId] === "out";
    const drugNotCovered = u.drugId !== undefined && plan.drugs[u.drugId] === "not-covered";
    if (outOfNetwork || drugNotCovered) {
      const full = round(u.allowed * u.units);
      uncovered += full;
      lines.push({
        label: u.label,
        service: u.service,
        units: u.units,
        allowed: u.allowed,
        youPay: full,
        uncovered: outOfNetwork ? "out-of-network" : "drug-not-covered",
      });
      continue;
    }
    const share = plan.costSharing[u.service];
    let lineTotal = 0;
    for (let i = 0; i < u.units; i++) {
      const { pay, dedUsed } = payFor(share, u.allowed, dedRemaining);
      dedRemaining -= dedUsed;
      lineTotal += pay;
    }
    running += lineTotal;
    lines.push({ label: u.label, service: u.service, units: u.units, allowed: u.allowed, youPay: round(lineTotal) });
  }

  const uncapped = round(running);
  const outOfPocket = Math.min(uncapped, plan.oopMax);
  const premiums = plan.premium * 12;
  const yearlyTotal = round(premiums + outOfPocket + uncovered);
  return {
    premiums,
    outOfPocket,
    uncappedOutOfPocket: uncapped,
    uncovered: round(uncovered),
    hitOopMax: uncapped > plan.oopMax,
    metDeductible: dedRemaining <= 0 && plan.deductible > 0,
    yearlyTotal,
    netAfterBudget: round(monthlyBudget * 12 - yearlyTotal),
    monthlyLeft: monthlyBudget - plan.premium,
    lines,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export type SortKey = "fit" | "premium" | "deductible";

export type RankedPlan = { plan: Plan; estimate: Estimate };

export function rankPlans(plans: Plan[], utilization: Utilization[], monthlyBudget: number, sort: SortKey): RankedPlan[] {
  const ranked = plans.map((plan) => ({ plan, estimate: estimate(plan, utilization, monthlyBudget) }));
  ranked.sort((a, b) => {
    if (sort === "premium") return a.plan.premium - b.plan.premium || tiebreak(a, b);
    if (sort === "deductible") return a.plan.deductible - b.plan.deductible || tiebreak(a, b);
    return a.estimate.yearlyTotal - b.estimate.yearlyTotal || tiebreak(a, b);
  });
  return ranked;
}

function tiebreak(a: RankedPlan, b: RankedPlan) {
  return (b.plan.qualityRating ?? 0) - (a.plan.qualityRating ?? 0) || a.plan.name.localeCompare(b.plan.name);
}

/** Format dollars. Negative numbers use a real minus sign. */
export const usd = (n: number, opts: { cents?: boolean; sign?: boolean } = {}) => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.cents ? 2 : 0,
    minimumFractionDigits: opts.cents ? 2 : 0,
  });
  if (n < 0) return `−${s}`;
  return opts.sign && n > 0 ? `+${s}` : s;
};
