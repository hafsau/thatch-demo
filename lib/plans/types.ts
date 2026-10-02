/**
 * The slice of a Marketplace plan that Fitting Room needs.
 *
 * It is deliberately smaller than what the CMS Marketplace API returns.
 * `scripts/fetch-plans.ts` maps the API's shape onto this one; the
 * representative data in `data/plans/*.json` is hand-written in the same shape,
 * so swapping sources changes nothing downstream.
 */

export type Metal = "Bronze" | "Expanded Bronze" | "Silver" | "Gold" | "Platinum" | "Catastrophic";
export type PlanType = "HMO" | "PPO" | "EPO" | "POS";

/** What you pay for one unit of a service. */
export type CostShare = {
  /** Flat dollar copay per visit/fill. */
  copay?: number;
  /** Fraction of the allowed amount you pay (0–1). */
  coinsurance?: number;
  /** Whether the deductible must be met before the copay/coinsurance applies. */
  afterDeductible: boolean;
};

export type Service =
  | "primaryCare"
  | "specialist"
  | "mentalHealthOutpatient"
  | "genericRx"
  | "preferredBrandRx"
  | "urgentCare"
  | "emergency"
  | "inpatient"
  | "outpatientSurgery"
  | "labs"
  | "imaging";

export type NetworkStatus = "in" | "out" | "unknown";
export type DrugStatus = "covered" | "not-covered" | "unknown";

export type Plan = {
  id: string;
  name: string;
  issuer: string;
  metal: Metal;
  type: PlanType;
  /** Monthly premium for the whole household, before any credit. */
  premium: number;
  /** The deductible that applies to this household (individual or family). */
  deductible: number;
  /** The out-of-pocket maximum that applies to this household. */
  oopMax: number;
  hsaEligible: boolean;
  referralRequired: boolean;
  nationalNetwork: boolean;
  /** CMS global quality rating, 1–5, or null when not yet rated. */
  qualityRating: number | null;
  costSharing: Record<Service, CostShare>;
  /** Network status for each of the persona's providers, by provider id. */
  providers: Record<string, NetworkStatus>;
  /** Formulary status for each of the persona's drugs, by drug id. */
  drugs: Record<string, DrugStatus>;
};

export type PlanFile = {
  personaId: string;
  /** Where the numbers came from. Shown in the UI and case study. */
  source: "cms-marketplace-api" | "representative";
  planYear: number;
  fetchedAt?: string;
  plans: Plan[];
};
