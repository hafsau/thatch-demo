import { describe, expect, it } from "vitest";
import { estimate, rankPlans } from "@/lib/cost/estimate";
import type { Plan } from "@/lib/plans/types";
import { personaById, utilizationFor } from "@/lib/personas";

const share = (copay?: number, coinsurance?: number, afterDeductible = true) => ({ copay, coinsurance, afterDeductible });

function plan(over: Partial<Plan> = {}): Plan {
  return {
    id: "t",
    name: "Test Silver",
    issuer: "Test",
    metal: "Silver",
    type: "HMO",
    premium: 400,
    deductible: 3000,
    oopMax: 8000,
    hsaEligible: false,
    referralRequired: true,
    nationalNetwork: false,
    qualityRating: 3,
    costSharing: {
      primaryCare: share(30, undefined, false),
      specialist: share(60, undefined, false),
      mentalHealthOutpatient: share(30, undefined, false),
      genericRx: share(10, undefined, false),
      preferredBrandRx: share(undefined, 0.3, true),
      urgentCare: share(75, undefined, false),
      emergency: share(undefined, 0.3, true),
      inpatient: share(undefined, 0.3, true),
      outpatientSurgery: share(undefined, 0.3, true),
      labs: share(undefined, 0.3, true),
      imaging: share(undefined, 0.3, true),
    },
    providers: {},
    drugs: {},
    ...over,
  };
}

describe("estimate", () => {
  it("charges nothing but premiums for a year with no care", () => {
    const e = estimate(plan(), [], 550);
    expect(e.premiums).toBe(4800);
    expect(e.outOfPocket).toBe(0);
    expect(e.yearlyTotal).toBe(4800);
    expect(e.monthlyLeft).toBe(150);
    expect(e.netAfterBudget).toBe(550 * 12 - 4800);
  });

  it("applies a flat copay without touching the deductible", () => {
    const e = estimate(plan(), [{ service: "primaryCare", allowed: 180, units: 3, label: "PCP" }], 0);
    expect(e.outOfPocket).toBe(90);
    expect(e.metDeductible).toBe(false);
  });

  it("pays allowed amounts in full until the deductible is met, then coinsurance", () => {
    // 4 × $1,000 imaging at 30% after a $3,000 deductible:
    // units 1–3 pay $1,000 each (deductible), unit 4 pays $300.
    const e = estimate(plan(), [{ service: "imaging", allowed: 1000, units: 4, label: "MRI" }], 0);
    expect(e.outOfPocket).toBe(3300);
    expect(e.metDeductible).toBe(true);
  });

  it("splits a single unit across the deductible boundary", () => {
    // $5,000 surgery, $3,000 deductible, 30% of the remaining $2,000 = $600.
    const e = estimate(plan(), [{ service: "outpatientSurgery", allowed: 5000, units: 1, label: "Surgery" }], 0);
    expect(e.outOfPocket).toBe(3600);
  });

  it("caps out-of-pocket at the plan maximum", () => {
    const e = estimate(plan(), [{ service: "inpatient", allowed: 60000, units: 1, label: "Hospital" }], 0);
    expect(e.uncappedOutOfPocket).toBe(3000 + 57000 * 0.3);
    expect(e.outOfPocket).toBe(8000);
    expect(e.hitOopMax).toBe(true);
  });

  it("never charges a copay larger than the allowed amount", () => {
    const e = estimate(plan(), [{ service: "specialist", allowed: 40, units: 1, label: "Quick visit" }], 0);
    expect(e.outOfPocket).toBe(40);
  });

  it("applies copay after deductible when flagged", () => {
    const p = plan({ costSharing: { ...plan().costSharing, specialist: share(60, undefined, true) }, deductible: 100 });
    // Unit 1: $100 deductible + $60 copay on the remaining $160 = $160. Unit 2: $60.
    const e = estimate(p, [{ service: "specialist", allowed: 260, units: 2, label: "Specialist" }], 0);
    expect(e.outOfPocket).toBe(220);
  });
});

describe("network and formulary", () => {
  it("charges full price, outside the cap, for an out-of-network doctor", () => {
    const p = plan({ providers: { ortiz: "out" }, oopMax: 1000 });
    const e = estimate(p, [{ service: "mentalHealthOutpatient", allowed: 150, units: 40, label: "Therapy", providerId: "ortiz" }], 0);
    expect(e.uncovered).toBe(6000);
    expect(e.outOfPocket).toBe(0);
    expect(e.yearlyTotal).toBe(4800 + 6000);
    expect(e.lines[0].uncovered).toBe("out-of-network");
  });

  it("charges full price for a drug the plan does not cover", () => {
    const p = plan({ drugs: { symbicort: "not-covered" } });
    const e = estimate(p, [{ service: "preferredBrandRx", allowed: 540, units: 12, label: "Symbicort", drugId: "symbicort" }], 0);
    expect(e.uncovered).toBe(6480);
    expect(e.lines[0].uncovered).toBe("drug-not-covered");
  });

  it("treats unknown network status as in-network for the estimate", () => {
    const p = plan({ providers: { patel: "unknown" } });
    const e = estimate(p, [{ service: "primaryCare", allowed: 180, units: 1, label: "PCP", providerId: "patel" }], 0);
    expect(e.outOfPocket).toBe(30);
    expect(e.uncovered).toBe(0);
  });
});

describe("rankPlans", () => {
  const cheapPremiumHighDeductible = plan({ id: "a", name: "A", premium: 300, deductible: 7000, oopMax: 9000 });
  const pricierPremiumLowDeductible = plan({ id: "b", name: "B", premium: 450, deductible: 1000, oopMax: 5000 });

  it("ranks by yearly total by default, which can invert the premium order", () => {
    const heavyYear = [{ service: "outpatientSurgery" as const, allowed: 12000, units: 1, label: "Surgery" }];
    const byFit = rankPlans([cheapPremiumHighDeductible, pricierPremiumLowDeductible], heavyYear, 0, "fit");
    expect(byFit[0].plan.id).toBe("b"); // 5400 + 1000 + 3300 = 9700 vs 3600 + 7000 + 1500 = 12100
    const byPremium = rankPlans([cheapPremiumHighDeductible, pricierPremiumLowDeductible], heavyYear, 0, "premium");
    expect(byPremium[0].plan.id).toBe("a");
  });

  it("keeps the cheap plan first for a light year", () => {
    const byFit = rankPlans([cheapPremiumHighDeductible, pricierPremiumLowDeductible], [], 0, "fit");
    expect(byFit[0].plan.id).toBe("a");
  });
});

describe("personas", () => {
  it("expands monthly prescriptions from the persona's drug list", () => {
    const u = utilizationFor(personaById("okafors"), ["meds"]);
    expect(u).toHaveLength(2);
    expect(u.map((x) => x.drugId).sort()).toEqual(["albuterol", "symbicort"]);
    expect(u.map((x) => x.service).sort()).toEqual(["genericRx", "preferredBrandRx"]);
    expect(u.every((x) => x.units === 12)).toBe(true);
  });

  it("attaches the persona's provider to an event", () => {
    const u = utilizationFor(personaById("maya"), ["therapy"]);
    expect(u[0].providerId).toBe("ortiz");
  });

  it("ignores unknown event ids", () => {
    expect(utilizationFor(personaById("maya"), ["nope"])).toEqual([]);
  });
});
