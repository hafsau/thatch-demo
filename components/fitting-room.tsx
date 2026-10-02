"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { rankPlans, type SortKey } from "@/lib/cost/estimate";
import { PERSONAS, personaById, utilizationFor, type Persona } from "@/lib/personas";
import { plansFor, sourceLabel } from "@/lib/plans/data";
import { BudgetStep } from "@/components/budget-step";
import { EnrolledStep } from "@/components/enrolled-step";
import { PersonaBar } from "@/components/persona-bar";
import { PlansStep } from "@/components/plans-step";
import { Stepper, STEPS, type StepId } from "@/components/stepper";
import { TryOnStep } from "@/components/tryon-step";
import { WhatsLeftStep } from "@/components/whats-left-step";

const ORDER = STEPS.map((s) => s.id);

/** The household comes from the URL via the server page; changing it remounts the flow. */
export function FittingRoom({ personaId }: { personaId: string }) {
  const router = useRouter();
  const persona = useMemo(() => (PERSONAS.some((p) => p.id === personaId) ? personaById(personaId) : PERSONAS[0]), [personaId]);
  const changePersona = (id: Persona["id"]) => router.replace(id === "maya" ? "/" : `/?as=${id}`, { scroll: false });
  const file = plansFor(persona.id);
  const sourceNote = sourceLabel(file, persona.household.county, persona.household.state);

  return (
    <>
      <PersonaBar persona={persona} onChange={changePersona} sourceNote={sourceNote} />
      {/* A different household is a different person: the key resets every step. */}
      <Flow key={persona.id} persona={persona} sourceNote={sourceNote} onSwitch={changePersona} />
    </>
  );
}

function Flow({ persona, sourceNote, onSwitch }: { persona: Persona; sourceNote: string; onSwitch: (id: Persona["id"]) => void }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<StepId>("budget");
  const [reached, setReached] = useState<StepId[]>(["budget"]);
  const [confirmed, setConfirmed] = useState(false);
  const [events, setEvents] = useState<string[]>(persona.defaultEvents);
  const [sort, setSort] = useState<SortKey>("fit");
  const [pickId, setPickId] = useState<string | null>(null);
  // First paint is server-rendered and must not wait for JS; only step changes animate in.
  const [stepped, setStepped] = useState(false);

  const go = useCallback((s: StepId) => {
    setStep(s);
    setStepped(true);
    setReached((r) => (r.includes(s) ? r : [...r, s]));
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const file = plansFor(persona.id);
  const utilization = useMemo(() => utilizationFor(persona, events), [persona, events]);
  const ranked = useMemo(() => rankPlans(file.plans, utilization, persona.budget, sort), [file, utilization, persona.budget, sort]);
  const pick = ranked.find((r) => r.plan.id === pickId) ?? null;
  const idx = ORDER.indexOf(step);
  const animateIn = stepped && !reduce;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-6 pb-24 sm:px-6">
      <Stepper current={step} reached={reached} onGo={go} />
      {/* Enter only, no exit: the next step should never wait on the last one. */}
      <motion.div key={step} initial={animateIn ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          {step === "budget" && <BudgetStep persona={persona} confirmed={confirmed} onConfirm={() => setConfirmed(true)} onContinue={() => go("tryon")} />}
          {step === "tryon" && (
            <TryOnStep
              persona={persona}
              events={events}
              onToggle={(id) => setEvents((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))}
              onBack={() => go("budget")}
              onContinue={() => go("plans")}
            />
          )}
          {step === "plans" && (
            <PlansStep
              persona={persona}
              ranked={ranked}
              sort={sort}
              onSort={setSort}
              events={events}
              onEditYear={() => go("tryon")}
              onChoose={(id) => {
                setPickId(id);
                go("left");
              }}
              sourceNote={sourceNote}
            />
          )}
          {step === "left" && pick && <WhatsLeftStep persona={persona} pick={pick} onBack={() => go("plans")} onEnroll={() => go("covered")} />}
          {step === "covered" && pick && (
            <EnrolledStep
              persona={persona}
              pick={pick}
              onRestart={() => {
                const next = PERSONAS[(PERSONAS.findIndex((p) => p.id === persona.id) + 1) % PERSONAS.length];
                onSwitch(next.id);
              }}
            />
          )}
        </motion.div>
      <p className="sr-only" aria-live="polite">
        Step {idx + 1} of {ORDER.length}: {STEPS[idx].label}
      </p>
    </div>
  );
}
