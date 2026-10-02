import type { Service } from "@/lib/plans/types";

/** One unit of care: what it costs the plan (allowed amount) and how many times. */
export type Utilization = {
  service: Service;
  allowed: number;
  units: number;
  label: string;
  /** The persona's provider this care goes to, if any. Out-of-network means full price. */
  providerId?: string;
  /** The persona's drug this fill is for, if any. Not covered means full price. */
  drugId?: string;
};

/** A "what's likely this year" chip. */
export type LifeEvent = {
  id: string;
  label: string;
  /** One line in plain words. */
  hint: string;
  utilization: Utilization[];
};

export type Provider = { id: string; name: string; specialty: string; where: string };
export type Drug = { id: string; name: string; kind: "generic" | "brand"; why: string };

export type Persona = {
  id: "maya" | "okafors" | "dennis";
  name: string;
  /** How the persona switcher introduces them. */
  tagline: string;
  /** Who they are, in the voice of a research note. */
  story: string;
  /** The review theme this persona was built from. */
  builtFrom: string;
  household: { ages: number[]; city: string; state: string; zip: string; countyFips: string; county: string };
  /** The street address the employer has on file; the demo confirms it. */
  address: string;
  /** Monthly health budget from the employer. */
  budget: number;
  providers: Provider[];
  drugs: Drug[];
  /** Event ids selected by default. */
  defaultEvents: string[];
  /** Events offered to this persona (ids into EVENTS). */
  offeredEvents: string[];
  /** Which of the persona's providers each event's care goes to. */
  eventProviders: Record<string, string>;
};

/**
 * Allowed amounts are rounded, typical in-network negotiated rates, used only
 * to make the estimate concrete. The case study calls this out as a model.
 */
export const EVENTS: Record<string, LifeEvent> = {
  usual: {
    id: "usual",
    label: "The usual",
    hint: "A check-up and routine labs.",
    utilization: [
      { service: "primaryCare", allowed: 180, units: 1, label: "Annual check-up" },
      { service: "labs", allowed: 120, units: 1, label: "Routine labs" },
    ],
  },
  therapy: {
    id: "therapy",
    label: "Therapy most weeks",
    hint: "About 40 sessions over the year.",
    utilization: [{ service: "mentalHealthOutpatient", allowed: 150, units: 40, label: "Therapy sessions" }],
  },
  baby: {
    id: "baby",
    label: "A baby",
    hint: "Prenatal visits, ultrasounds, and a hospital delivery.",
    utilization: [
      { service: "specialist", allowed: 200, units: 10, label: "Prenatal visits" },
      { service: "imaging", allowed: 400, units: 2, label: "Ultrasounds" },
      { service: "inpatient", allowed: 14000, units: 1, label: "Hospital delivery" },
    ],
  },
  surgery: {
    id: "surgery",
    label: "A planned surgery",
    hint: "Outpatient procedure, imaging, and follow-ups.",
    utilization: [
      { service: "imaging", allowed: 900, units: 1, label: "MRI" },
      { service: "outpatientSurgery", allowed: 12000, units: 1, label: "Outpatient surgery" },
      { service: "specialist", allowed: 250, units: 4, label: "Surgeon follow-ups" },
    ],
  },
  kids: {
    id: "kids",
    label: "Two kids, one bad week",
    hint: "Well-child visits plus an urgent care trip.",
    utilization: [
      { service: "primaryCare", allowed: 160, units: 4, label: "Well-child visits" },
      { service: "urgentCare", allowed: 220, units: 1, label: "Urgent care" },
    ],
  },
  asthma: {
    id: "asthma",
    label: "Managing asthma",
    hint: "A flare-up and two specialist visits. Inhalers are under prescriptions.",
    utilization: [
      { service: "specialist", allowed: 240, units: 2, label: "Pulmonology visits" },
      { service: "urgentCare", allowed: 220, units: 1, label: "Flare-up, urgent care" },
    ],
  },
  heart: {
    id: "heart",
    label: "Managing a heart condition",
    hint: "Cardiology visits, labs, and an echocardiogram.",
    utilization: [
      { service: "specialist", allowed: 260, units: 4, label: "Cardiology visits" },
      { service: "labs", allowed: 110, units: 4, label: "Quarterly labs" },
      { service: "imaging", allowed: 650, units: 1, label: "Echocardiogram" },
    ],
  },
  cath: {
    id: "cath",
    label: "A possible procedure",
    hint: "If the cardiologist orders a catheterization.",
    utilization: [{ service: "outpatientSurgery", allowed: 9500, units: 1, label: "Cardiac catheterization" }],
  },
  meds: {
    id: "meds",
    label: "Monthly prescriptions",
    hint: "Refills for the medications you added.",
    utilization: [], // Derived from the persona's drugs; see utilizationFor().
  },
};

export const PERSONAS: Persona[] = [
  {
    id: "maya",
    name: "Maya",
    tagline: "29 · Austin · therapy most weeks",
    story:
      "Maya is a product marketer at a 40-person startup. She rents in South Austin, sees a therapist she has been with for three years, and takes one generic prescription. Last year she picked the cheapest premium and spent $1,900 out of pocket on therapy before she noticed. She doesn't want to do that again.",
    builtFrom: "The budget-conscious single adult who optimizes the wrong number.",
    household: { ages: [29], city: "Austin", state: "TX", zip: "78704", countyFips: "48453", county: "Travis" },
    address: "2104 S 5th St, Austin, TX 78704",
    budget: 550,
    providers: [
      { id: "ortiz", name: "Lena Ortiz, LCSW", specialty: "Therapist", where: "South Lamar" },
      { id: "patel", name: "Dr. Sam Patel", specialty: "Primary care", where: "Austin Regional Clinic" },
    ],
    drugs: [{ id: "sertraline", name: "Sertraline 50mg", kind: "generic", why: "Daily" }],
    defaultEvents: ["usual", "therapy", "meds"],
    offeredEvents: ["usual", "therapy", "meds", "surgery", "baby"],
    eventProviders: { usual: "patel", therapy: "ortiz" },
  },
  {
    id: "okafors",
    name: "The Okafors",
    tagline: "Family of four · Columbus · a pediatrician they trust",
    story:
      "Ngozi (38) and Daniel (36) have two kids, 7 and 4. Their employer just moved from a group plan to a Thatch budget. Their non-negotiable is the pediatrician at Nationwide Children's who caught their son's asthma early. Daniel's quote during onboarding was based on the office zip code, and the price changed when he entered their home address. He is still a little suspicious.",
    builtFrom: "The review theme of zip-code quotes that change at the real address, and 'keep my doctor'.",
    household: { ages: [38, 36, 7, 4], city: "Columbus", state: "OH", zip: "43215", countyFips: "39049", county: "Franklin" },
    address: "881 Neil Ave, Columbus, OH 43215",
    budget: 1650,
    providers: [
      { id: "chen", name: "Dr. Amara Chen", specialty: "Pediatrics", where: "Nationwide Children's" },
      { id: "walsh", name: "Dr. Kevin Walsh", specialty: "Family medicine", where: "OhioHealth Grant" },
    ],
    drugs: [
      { id: "albuterol", name: "Albuterol inhaler", kind: "generic", why: "Rescue inhaler" },
      { id: "symbicort", name: "Symbicort 80/4.5", kind: "brand", why: "Daily controller" },
    ],
    defaultEvents: ["usual", "kids", "asthma", "meds"],
    offeredEvents: ["usual", "kids", "asthma", "meds", "baby", "surgery"],
    eventProviders: { usual: "walsh", kids: "chen", asthma: "chen" },
  },
  {
    id: "dennis",
    name: "Dennis",
    tagline: "63 · Phoenix · 18 months from Medicare",
    story:
      "Dennis manages a Five Guys-sized restaurant group's facilities team. He has a cardiologist he has seen since a scare in 2023 and takes a blood thinner that is expensive without coverage. He is 18 months from Medicare and mostly wants nothing to change until then. He reads every letter the carrier sends and has called support twice to ask whether he was 'actually covered yet'.",
    builtFrom: "The review theme of activation delays and 'am I covered yet', plus the 65+ segment Thatch supports.",
    household: { ages: [63], city: "Phoenix", state: "AZ", zip: "85004", countyFips: "04013", county: "Maricopa" },
    address: "310 N 3rd St, Phoenix, AZ 85004",
    budget: 1100,
    providers: [
      { id: "nakamura", name: "Dr. Robert Nakamura", specialty: "Cardiology", where: "Banner – University" },
      { id: "reyes", name: "Dr. Elena Reyes", specialty: "Primary care", where: "HonorHealth" },
    ],
    drugs: [
      { id: "atorvastatin", name: "Atorvastatin 40mg", kind: "generic", why: "Daily" },
      { id: "eliquis", name: "Eliquis 5mg", kind: "brand", why: "Blood thinner, daily" },
    ],
    defaultEvents: ["usual", "heart", "meds"],
    offeredEvents: ["usual", "heart", "meds", "cath", "surgery"],
    eventProviders: { usual: "reyes", heart: "nakamura", cath: "nakamura" },
  },
];

export function personaById(id: string): Persona {
  const p = PERSONAS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown persona: ${id}`);
  return p;
}

/** Typical allowed amounts for a 30-day fill. */
const RX_ALLOWED = { generic: 18, brand: 540 } as const;

/** Expand selected events into concrete utilization for a persona. */
export function utilizationFor(persona: Persona, eventIds: string[]): Utilization[] {
  const out: Utilization[] = [];
  for (const id of eventIds) {
    const ev = EVENTS[id];
    if (!ev) continue;
    if (id === "meds") {
      for (const d of persona.drugs) {
        out.push({
          service: d.kind === "generic" ? "genericRx" : "preferredBrandRx",
          allowed: RX_ALLOWED[d.kind],
          units: 12,
          label: `${d.name}, monthly`,
          drugId: d.id,
        });
      }
    } else {
      const providerId = persona.eventProviders[id];
      out.push(...ev.utilization.map((u) => (providerId ? { ...u, providerId } : u)));
    }
  }
  return out;
}
