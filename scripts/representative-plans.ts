/**
 * Writes representative plan data for the three personas.
 *
 * These are not real plans. They are modeled on 2026 individual-market plans
 * in each persona's county: realistic carriers, metal tiers, price spreads and
 * cost-sharing structures, with network and formulary differences chosen so the
 * prototype has something to show. `scripts/fetch-plans.ts` replaces them with
 * actual CMS Marketplace data in the same shape.
 *
 *   node scripts/representative-plans.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CostShare, DrugStatus, Metal, NetworkStatus, Plan, PlanFile, PlanType, Service } from "../lib/plans/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "data", "plans");

const c = (copay: number, afterDeductible = false): CostShare => ({ copay, afterDeductible });
const pct = (coinsurance: number): CostShare => ({ coinsurance, afterDeductible: true });

type Sharing = Record<Service, CostShare>;

const SHARING: Record<string, Sharing> = {
  bronze: {
    primaryCare: c(50),
    specialist: pct(0.4),
    mentalHealthOutpatient: pct(0.4),
    genericRx: c(25),
    preferredBrandRx: pct(0.4),
    urgentCare: c(75),
    emergency: pct(0.4),
    inpatient: pct(0.4),
    outpatientSurgery: pct(0.4),
    labs: pct(0.4),
    imaging: pct(0.4),
  },
  bronzeHsa: {
    primaryCare: pct(0.3),
    specialist: pct(0.3),
    mentalHealthOutpatient: pct(0.3),
    genericRx: pct(0.3),
    preferredBrandRx: pct(0.3),
    urgentCare: pct(0.3),
    emergency: pct(0.3),
    inpatient: pct(0.3),
    outpatientSurgery: pct(0.3),
    labs: pct(0.3),
    imaging: pct(0.3),
  },
  silverA: {
    primaryCare: c(30),
    specialist: c(65),
    mentalHealthOutpatient: c(30),
    genericRx: c(15),
    preferredBrandRx: c(60),
    urgentCare: c(75),
    emergency: pct(0.3),
    inpatient: pct(0.3),
    outpatientSurgery: pct(0.3),
    labs: c(40),
    imaging: pct(0.3),
  },
  silverB: {
    primaryCare: c(35),
    specialist: c(80),
    mentalHealthOutpatient: c(45),
    genericRx: c(20),
    preferredBrandRx: c(90, true),
    urgentCare: c(90),
    emergency: pct(0.35),
    inpatient: pct(0.35),
    outpatientSurgery: pct(0.35),
    labs: pct(0.35),
    imaging: pct(0.35),
  },
  goldA: {
    primaryCare: c(20),
    specialist: c(45),
    mentalHealthOutpatient: c(20),
    genericRx: c(10),
    preferredBrandRx: c(50),
    urgentCare: c(60),
    emergency: pct(0.2),
    inpatient: pct(0.2),
    outpatientSurgery: pct(0.2),
    labs: c(20),
    imaging: pct(0.2),
  },
  goldB: {
    primaryCare: c(25),
    specialist: c(55),
    mentalHealthOutpatient: c(25),
    genericRx: c(10),
    preferredBrandRx: c(55),
    urgentCare: c(60),
    emergency: pct(0.2),
    inpatient: pct(0.2),
    outpatientSurgery: pct(0.2),
    labs: pct(0.2),
    imaging: pct(0.2),
  },
};

type Row = [
  id: string,
  issuer: string,
  name: string,
  metal: Metal,
  type: PlanType,
  premium: number,
  deductible: number,
  oopMax: number,
  sharing: keyof typeof SHARING,
  quality: number | null,
  providers: Record<string, NetworkStatus>,
  drugs: Record<string, DrugStatus>,
  flags?: { hsa?: boolean; national?: boolean; noReferral?: boolean },
];

function build(rows: Row[]): Plan[] {
  return rows.map(([id, issuer, name, metal, type, premium, deductible, oopMax, sharing, quality, providers, drugs, flags]) => ({
    id,
    issuer,
    name,
    metal,
    type,
    premium,
    deductible,
    oopMax,
    hsaEligible: !!flags?.hsa,
    referralRequired: type === "HMO" && !flags?.noReferral,
    nationalNetwork: !!flags?.national,
    qualityRating: quality,
    costSharing: SHARING[sharing],
    providers,
    drugs,
  }));
}

const maya = build([
  ["tx-amb-brz", "Ambetter", "Everyday Bronze", "Expanded Bronze", "HMO", 352, 7500, 9200, "bronze", 3, { ortiz: "out", patel: "in" }, { sertraline: "covered" }],
  ["tx-bcbs-brz", "Blue Cross Blue Shield of Texas", "MyBlue Health Bronze 405", "Bronze", "HMO", 368, 7000, 9200, "bronzeHsa", 3, { ortiz: "out", patel: "out" }, { sertraline: "covered" }, { hsa: true }],
  ["tx-osc-brz", "Oscar", "Bronze Classic", "Expanded Bronze", "HMO", 374, 7250, 9200, "bronze", 4, { ortiz: "in", patel: "in" }, { sertraline: "covered" }, { noReferral: true }],
  ["tx-aet-brz", "Aetna CVS Health", "Bronze 2", "Bronze", "HMO", 361, 6900, 9200, "bronze", 3, { ortiz: "unknown", patel: "in" }, { sertraline: "covered" }],
  ["tx-osc-slv", "Oscar", "Silver Classic", "Silver", "HMO", 462, 5000, 9000, "silverA", 4, { ortiz: "in", patel: "in" }, { sertraline: "covered" }, { noReferral: true }],
  ["tx-amb-slv", "Ambetter", "Clear Silver", "Silver", "HMO", 448, 5900, 9100, "silverB", 3, { ortiz: "out", patel: "in" }, { sertraline: "covered" }],
  ["tx-bcbs-slv", "Blue Cross Blue Shield of Texas", "Blue Advantage Silver 303", "Silver", "HMO", 486, 4500, 9100, "silverB", 3, { ortiz: "in", patel: "in" }, { sertraline: "covered" }],
  ["tx-osc-gld", "Oscar", "Gold Classic", "Gold", "HMO", 548, 1500, 7800, "goldA", 4, { ortiz: "in", patel: "in" }, { sertraline: "covered" }, { noReferral: true }],
  ["tx-aet-gld", "Aetna CVS Health", "Gold 2", "Gold", "HMO", 539, 1000, 8000, "goldB", 3, { ortiz: "unknown", patel: "in" }, { sertraline: "covered" }],
  ["tx-bcbs-gld", "Blue Cross Blue Shield of Texas", "Blue Advantage Gold 301", "Gold", "HMO", 571, 900, 7500, "goldB", 3, { ortiz: "in", patel: "in" }, { sertraline: "covered" }],
]);

const okafors = build([
  ["oh-cs-brz", "CareSource", "Marketplace Bronze First", "Expanded Bronze", "HMO", 1268, 15000, 18400, "bronze", 2, { chen: "out", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }],
  ["oh-ant-brz", "Anthem", "Bronze Pathway X 7500", "Bronze", "HMO", 1312, 15000, 18400, "bronzeHsa", 3, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }, { hsa: true }],
  ["oh-amb-brz", "Ambetter from Buckeye", "Everyday Bronze", "Expanded Bronze", "HMO", 1245, 14800, 18400, "bronze", 3, { chen: "out", walsh: "out" }, { albuterol: "covered", symbicort: "covered" }],
  ["oh-mm-brz", "Medical Mutual", "Market HMO Bronze 7500", "Bronze", "HMO", 1290, 15000, 18400, "bronze", 3, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "not-covered" }],
  ["oh-osc-brz", "Oscar", "Bronze Classic", "Expanded Bronze", "EPO", 1330, 14500, 18400, "bronze", 4, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }, { noReferral: true }],
  ["oh-cs-slv", "CareSource", "Marketplace Silver", "Silver", "HMO", 1598, 11000, 18000, "silverB", 2, { chen: "out", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }],
  ["oh-ant-slv", "Anthem", "Silver Pathway X 5000", "Silver", "HMO", 1672, 10000, 17400, "silverA", 3, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }],
  ["oh-mm-slv", "Medical Mutual", "Market HMO Silver 4500", "Silver", "HMO", 1640, 9000, 17000, "silverA", 3, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "not-covered" }],
  ["oh-osc-slv", "Oscar", "Silver Classic", "Silver", "EPO", 1655, 9500, 18000, "silverB", 4, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }, { noReferral: true }],
  ["oh-ant-gld", "Anthem", "Gold Pathway X 1500", "Gold", "HMO", 1920, 3000, 14000, "goldA", 3, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }],
  ["oh-osc-gld", "Oscar", "Gold Classic", "Gold", "EPO", 1885, 3000, 15000, "goldB", 4, { chen: "in", walsh: "in" }, { albuterol: "covered", symbicort: "covered" }, { noReferral: true }],
]);

const dennis = build([
  ["az-amb-brz", "Ambetter from Arizona Complete Health", "Everyday Bronze", "Expanded Bronze", "HMO", 846, 7500, 9200, "bronze", 3, { nakamura: "out", reyes: "in" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-bcbs-brz", "Blue Cross Blue Shield of Arizona", "Blue ACA Bronze", "Bronze", "HMO", 892, 7000, 9200, "bronzeHsa", 4, { nakamura: "in", reyes: "in" }, { atorvastatin: "covered", eliquis: "covered" }, { hsa: true }],
  ["az-osc-brz", "Oscar", "Bronze Classic", "Expanded Bronze", "HMO", 868, 7250, 9200, "bronze", 4, { nakamura: "in", reyes: "out" }, { atorvastatin: "covered", eliquis: "covered" }, { noReferral: true }],
  ["az-ban-brz", "Banner|Aetna", "Bronze Banner Plus", "Bronze", "HMO", 859, 7400, 9200, "bronze", 3, { nakamura: "in", reyes: "out" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-uhc-brz", "UnitedHealthcare", "Bronze Essential", "Bronze", "HMO", 905, 7500, 9200, "bronze", 3, { nakamura: "unknown", reyes: "in" }, { atorvastatin: "covered", eliquis: "not-covered" }],
  ["az-amb-slv", "Ambetter from Arizona Complete Health", "Clear Silver", "Silver", "HMO", 1118, 5500, 9000, "silverB", 3, { nakamura: "out", reyes: "in" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-bcbs-slv", "Blue Cross Blue Shield of Arizona", "Blue ACA Silver", "Silver", "HMO", 1174, 4800, 9100, "silverA", 4, { nakamura: "in", reyes: "in" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-ban-slv", "Banner|Aetna", "Silver Banner Plus", "Silver", "HMO", 1139, 5000, 9000, "silverA", 3, { nakamura: "in", reyes: "out" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-osc-slv", "Oscar", "Silver Classic", "Silver", "HMO", 1152, 5000, 9000, "silverB", 4, { nakamura: "in", reyes: "out" }, { atorvastatin: "covered", eliquis: "covered" }, { noReferral: true }],
  ["az-bcbs-gld", "Blue Cross Blue Shield of Arizona", "Blue ACA Gold", "Gold", "HMO", 1338, 1200, 7500, "goldA", 4, { nakamura: "in", reyes: "in" }, { atorvastatin: "covered", eliquis: "covered" }],
  ["az-ban-gld", "Banner|Aetna", "Gold Banner Plus", "Gold", "HMO", 1305, 1000, 7900, "goldB", 3, { nakamura: "in", reyes: "out" }, { atorvastatin: "covered", eliquis: "covered" }],
]);

mkdirSync(outDir, { recursive: true });
for (const [personaId, plans] of Object.entries({ maya, okafors, dennis })) {
  const file: PlanFile = { personaId, source: "representative", planYear: 2026, plans };
  writeFileSync(join(outDir, `${personaId}.json`), JSON.stringify(file, null, 2) + "\n");
  console.log(`wrote data/plans/${personaId}.json (${plans.length} plans)`);
}
