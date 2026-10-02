"use client";

import type { Persona } from "@/lib/personas";
import { usd } from "@/lib/cost/estimate";
import { Term } from "@/components/term-tip";

export function BudgetStep({
  persona,
  confirmed,
  onConfirm,
  onContinue,
}: {
  persona: Persona;
  confirmed: boolean;
  onConfirm: () => void;
  onContinue: () => void;
}) {
  const first = persona.name.split(" ")[0] === "The" ? persona.name : persona.name;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
      <div className="flex flex-col gap-6">
        <p className="eyebrow">Step 1 of 5</p>
        <h1 className="display text-5xl sm:text-6xl">
          {first}, your employer gives you{" "}
          <span className="whitespace-nowrap text-brand">{usd(persona.budget)}</span>{" "}
          a month for health.
        </h1>
        <p className="max-w-[52ch] text-lg leading-relaxed text-muted">
          It&apos;s a <Term k="budget">health budget</Term>, not a plan. You pick the insurance that fits your life, and whatever the
          premium doesn&apos;t use loads onto your Thatch Card for the care you actually need.
        </p>
        <ul className="grid gap-3 text-sm text-muted sm:grid-cols-3">
          <li className="card p-4">
            <p className="font-medium text-ink">Pick a plan</p>
            <p className="mt-1">From carriers in {persona.household.county} County, filtered by your doctors and prescriptions.</p>
          </li>
          <li className="card p-4">
            <p className="font-medium text-ink">Keep what&apos;s left</p>
            <p className="mt-1">The rest of your {usd(persona.budget)} goes on your card, tax-free, every month.</p>
          </li>
          <li className="card p-4">
            <p className="font-medium text-ink">Nothing to file</p>
            <p className="mt-1">No reimbursement forms. Thatch pays the carrier for you.</p>
          </li>
        </ul>
      </div>

      <div className="card flex flex-col gap-5 p-6 lg:self-start">
        <div>
          <p className="eyebrow">First, your address</p>
          <h2 className="mt-2 text-xl font-medium">Prices depend on where you live, not where you work.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Your employer entered a zip code. Plans are priced by county, and a quote from the wrong zip is the most common
            reason people see a different price at checkout. Confirm your home address and the numbers you see next are the
            numbers you&apos;ll pay.
          </p>
        </div>
        <div className="rounded-md border border-line bg-bg p-4">
          <p className="text-xs text-dim">Home address on file</p>
          <p className="mt-1 font-medium">{persona.address}</p>
          <p className="text-sm text-muted">
            {persona.household.county} County · {persona.household.ages.length === 1 ? `Age ${persona.household.ages[0]}` : `Ages ${persona.household.ages.join(", ")}`}
          </p>
        </div>
        {confirmed ? (
          <p role="status" className="flex items-center gap-2 rounded-md bg-good-soft px-3 py-2 text-sm text-good">
            <span aria-hidden>✓</span> Address confirmed. Prices below are exact for this address.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onConfirm} className="btn btn-dark btn-sm">
              That&apos;s my home address
            </button>
            <button type="button" className="btn btn-secondary btn-sm">
              Edit address
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!confirmed}
          onClick={onContinue}
          className="btn btn-primary mt-1 w-full"
        >
          Try plans on →
        </button>
      </div>
    </div>
  );
}
