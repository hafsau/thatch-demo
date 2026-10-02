/**
 * Fetches real 2026 individual-market plans for each persona from the CMS
 * Marketplace API and writes them to data/plans/<persona>.json in the shape
 * Fitting Room uses. The site never calls CMS at runtime; this runs once.
 *
 *   CMS_MARKETPLACE_API_KEY=... node scripts/fetch-plans.ts
 *
 * Key: https://developer.cms.gov/marketplace-api/ ("Request an API key").
 * Docs: https://developer.cms.gov/marketplace-api/api-spec.html
 *
 * Mapping notes:
 * - ICHRA households buy without premium tax credits, so `premium` is the
 *   full premium (not `premium_w_credit`). `aptc_eligible: false`.
 * - For the family persona we use the family deductible/MOOP ("Family" type);
 *   for single adults, the individual ones. Medical+drug combined when present.
 * - Provider and drug coverage come from /coverage/search with the persona's
 *   provider NPIs and drug RxCUIs. Fill PROVIDER_NPI and DRUG_RXCUI below with
 *   real identifiers from /providers/autocomplete and /drugs/autocomplete.
 * - If the API has changed shape since this was written, the mapping functions
 *   at the bottom are the only thing to adjust.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CostShare, DrugStatus, Metal, NetworkStatus, Plan, PlanFile, PlanType, Service } from "../lib/plans/types.ts";
import { PERSONAS, type Persona } from "../lib/personas.ts";

const KEY = process.env.CMS_MARKETPLACE_API_KEY;
if (!KEY) {
  console.error("Set CMS_MARKETPLACE_API_KEY. See .env.example.");
  process.exit(1);
}
const BASE = "https://marketplace.api.healthcare.gov/api/v1";
const YEAR = 2026;

/** Fill these in from the autocomplete endpoints before running. */
const PROVIDER_NPI: Record<string, string> = {
  // ortiz: "1234567890",
};
const DRUG_RXCUI: Record<string, string> = {
  sertraline: "312940", // sertraline 50 MG oral tablet
  albuterol: "745679", // albuterol HFA inhaler
  symbicort: "1998774", // budesonide/formoterol 80/4.5
  atorvastatin: "617311", // atorvastatin 40 MG
  eliquis: "1364445", // apixaban 5 MG
};

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "data", "plans");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("apikey", KEY!);
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

type ApiPlan = {
  id: string;
  name: string;
  issuer: { name: string };
  metal_level: string;
  type: string;
  premium: number;
  deductibles: { amount: number; type: string; family_cost?: string; network_tier?: string }[];
  moops: { amount: number; type: string; family_cost?: string; network_tier?: string }[];
  benefits: { name: string; covered: boolean; cost_sharings: { copay_amount?: number; coinsurance_rate?: number; coinsurance_options?: string; copay_options?: string; network_tier?: string }[] }[];
  quality_rating?: { available: boolean; global_rating?: number };
  hsa_eligible?: boolean;
  has_national_network?: boolean;
  specialist_referral_required?: boolean;
};

async function fetchPersona(p: Persona): Promise<PlanFile> {
  const isFamily = p.household.ages.length > 1;
  const people = p.household.ages.map((age, i) => ({
    age,
    aptc_eligible: false,
    uses_tobacco: false,
    relationship: i === 0 ? "Self" : isFamily && i === 1 && age >= 18 ? "Spouse" : "Child",
  }));
  const place = { zipcode: p.household.zip, countyfips: p.household.countyFips, state: p.household.state };

  // Page through /plans/search.
  const plans: ApiPlan[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await api<{ plans: ApiPlan[]; total: number }>("/plans/search", {
      method: "POST",
      body: JSON.stringify({ household: { people, income: 0 }, place, market: "Individual", year: YEAR, limit: 100, offset }),
    });
    plans.push(...page.plans);
    if (plans.length >= page.total || page.plans.length === 0) break;
  }

  // Coverage lookups for providers and drugs.
  const planIds = plans.map((x) => x.id);
  const providerStatus: Record<string, Record<string, NetworkStatus>> = {};
  const drugStatus: Record<string, Record<string, DrugStatus>> = {};
  for (const prov of p.providers) {
    const npi = PROVIDER_NPI[prov.id];
    if (!npi) continue;
    const res = await api<{ coverage: { plan_id: string; coverage: boolean }[] }>(
      `/coverage/search?year=${YEAR}&providerids=${npi}&planids=${planIds.join(",")}`,
    );
    providerStatus[prov.id] = Object.fromEntries(res.coverage.map((c) => [c.plan_id, c.coverage ? "in" : "out"]));
  }
  for (const d of p.drugs) {
    const rxcui = DRUG_RXCUI[d.id];
    if (!rxcui) continue;
    const res = await api<{ coverage: { plan_id: string; coverage: string }[] }>(
      `/drugs/covered?year=${YEAR}&drugs=${rxcui}&planids=${planIds.join(",")}`,
    );
    drugStatus[d.id] = Object.fromEntries(res.coverage.map((c) => [c.plan_id, c.coverage === "Covered" ? "covered" : "not-covered"]));
  }

  return {
    personaId: p.id,
    source: "cms-marketplace-api",
    planYear: YEAR,
    fetchedAt: new Date().toISOString(),
    plans: plans.map((ap) => mapPlan(ap, p, isFamily, providerStatus, drugStatus)),
  };
}

function mapPlan(
  ap: ApiPlan,
  p: Persona,
  isFamily: boolean,
  providerStatus: Record<string, Record<string, NetworkStatus>>,
  drugStatus: Record<string, Record<string, DrugStatus>>,
): Plan {
  const pickAmount = (rows: ApiPlan["deductibles"]) => {
    const tier = rows.filter((r) => !r.network_tier || /in[- ]?network|combined/i.test(r.network_tier));
    const wanted = tier.filter((r) => (isFamily ? /family/i.test(r.family_cost ?? r.type) : /individual/i.test(r.family_cost ?? r.type)));
    const combined = wanted.find((r) => /combined/i.test(r.type)) ?? wanted[0] ?? tier[0] ?? rows[0];
    return combined?.amount ?? 0;
  };
  return {
    id: ap.id,
    name: ap.name,
    issuer: ap.issuer.name,
    metal: normalizeMetal(ap.metal_level),
    type: (ap.type as PlanType) ?? "HMO",
    premium: Math.round(ap.premium),
    deductible: pickAmount(ap.deductibles),
    oopMax: pickAmount(ap.moops),
    hsaEligible: !!ap.hsa_eligible,
    referralRequired: !!ap.specialist_referral_required,
    nationalNetwork: !!ap.has_national_network,
    qualityRating: ap.quality_rating?.available ? (ap.quality_rating.global_rating ?? null) : null,
    costSharing: mapSharing(ap.benefits),
    providers: Object.fromEntries(p.providers.map((pr) => [pr.id, providerStatus[pr.id]?.[ap.id] ?? "unknown"])),
    drugs: Object.fromEntries(p.drugs.map((d) => [d.id, drugStatus[d.id]?.[ap.id] ?? "unknown"])),
  };
}

function normalizeMetal(m: string): Metal {
  const s = m.toLowerCase();
  if (s.includes("expanded")) return "Expanded Bronze";
  if (s.includes("bronze")) return "Bronze";
  if (s.includes("silver")) return "Silver";
  if (s.includes("gold")) return "Gold";
  if (s.includes("platinum")) return "Platinum";
  return "Catastrophic";
}

/** CMS benefit names → our services. First match wins. */
const BENEFIT_NAMES: Record<Service, RegExp> = {
  primaryCare: /primary care visit/i,
  specialist: /specialist visit/i,
  mentalHealthOutpatient: /mental\/behavioral health outpatient/i,
  genericRx: /generic drugs/i,
  preferredBrandRx: /preferred brand drugs/i,
  urgentCare: /urgent care/i,
  emergency: /emergency room/i,
  inpatient: /inpatient hospital services/i,
  outpatientSurgery: /outpatient surgery physician/i,
  labs: /laboratory outpatient/i,
  imaging: /imaging \(ct\/pet scans, mris\)/i,
};

function mapSharing(benefits: ApiPlan["benefits"]): Record<Service, CostShare> {
  const out = {} as Record<Service, CostShare>;
  for (const [service, re] of Object.entries(BENEFIT_NAMES) as [Service, RegExp][]) {
    const b = benefits.find((x) => re.test(x.name));
    const cs = b?.cost_sharings.find((x) => !x.network_tier || /in[- ]?network/i.test(x.network_tier)) ?? b?.cost_sharings[0];
    if (!cs) {
      out[service] = { coinsurance: 0.5, afterDeductible: true };
      continue;
    }
    const afterDeductible = /after deductible/i.test(`${cs.copay_options ?? ""} ${cs.coinsurance_options ?? ""}`);
    if (cs.copay_amount && cs.copay_amount > 0) out[service] = { copay: cs.copay_amount, afterDeductible };
    else out[service] = { coinsurance: (cs.coinsurance_rate ?? 0) || 0, afterDeductible: true };
  }
  return out;
}

mkdirSync(outDir, { recursive: true });
for (const p of PERSONAS) {
  const file = await fetchPersona(p);
  writeFileSync(join(outDir, `${p.id}.json`), JSON.stringify(file, null, 2) + "\n");
  console.log(`wrote data/plans/${p.id}.json (${file.plans.length} plans, source: cms)`);
}
