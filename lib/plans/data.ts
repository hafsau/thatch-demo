import type { PlanFile } from "@/lib/plans/types";
import maya from "@/data/plans/maya.json";
import okafors from "@/data/plans/okafors.json";
import dennis from "@/data/plans/dennis.json";

const FILES: Record<string, PlanFile> = {
  maya: maya as PlanFile,
  okafors: okafors as PlanFile,
  dennis: dennis as PlanFile,
};

export function plansFor(personaId: string): PlanFile {
  const f = FILES[personaId];
  if (!f) throw new Error(`No plan data for ${personaId}`);
  return f;
}

export function sourceLabel(file: PlanFile, county: string, state: string) {
  return file.source === "cms-marketplace-api"
    ? `Real ${file.planYear} plans for ${county} County, ${state}, from the CMS Marketplace API`
    : `Representative plans modeled on ${file.planYear} individual-market plans in ${county} County, ${state}`;
}
