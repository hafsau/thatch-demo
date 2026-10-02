/**
 * Thatch Market-style suggestions, sized to what's left on the card.
 * Prices are illustrative monthly equivalents.
 */
export type MarketItem = { id: string; name: string; partner: string; monthly: number; why: string };

const ITEMS: Record<string, MarketItem> = {
  therapy: { id: "therapy", name: "Therapy, between sessions", partner: "Talkspace", monthly: 69, why: "Messaging with a licensed therapist on the weeks you can't make it in." },
  labs: { id: "labs", name: "Full-body lab panel", partner: "Function Health", monthly: 42, why: "100+ biomarkers twice a year, $499 billed annually." },
  oura: { id: "oura", name: "Sleep and recovery tracking", partner: "Oura", monthly: 29, why: "Ring plus membership, spread over the year." },
  copays: { id: "copays", name: "Set aside for copays", partner: "Thatch Card", monthly: 25, why: "Leaves the card ready for the visits and refills you planned." },
  dental: { id: "dental", name: "Family dental", partner: "Delta Dental", monthly: 58, why: "Cleanings and sealants for two kids." },
  vision: { id: "vision", name: "Vision", partner: "VSP", monthly: 14, why: "Annual exam and a pair of glasses." },
  glp1: { id: "glp1", name: "GLP-1 program", partner: "Hers", monthly: 165, why: "Medication plus clinician check-ins." },
  heart: { id: "heart", name: "Heart rhythm monitor", partner: "KardiaMobile", monthly: 12, why: "Send an ECG to your cardiologist from home." },
  gym: { id: "gym", name: "Movement", partner: "ClassPass", monthly: 49, why: "Qualifies with a doctor's letter through Truemed." },
  prenatal: { id: "prenatal", name: "Prenatal vitamins and support", partner: "Ritual", monthly: 39, why: "If the baby is on the list." },
};

const BY_PERSONA: Record<string, string[]> = {
  maya: ["copays", "therapy", "labs", "oura", "gym"],
  okafors: ["copays", "dental", "vision", "labs", "gym"],
  dennis: ["copays", "heart", "vision", "labs", "oura"],
};

export function marketFor(personaId: string): MarketItem[] {
  return (BY_PERSONA[personaId] ?? []).map((id) => ITEMS[id]);
}
