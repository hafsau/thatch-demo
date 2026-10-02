"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { usd, type RankedPlan } from "@/lib/cost/estimate";
import type { Persona } from "@/lib/personas";

type Stage = { title: string; when: string; detail: string; state: "done" | "now" | "next" };

export function EnrolledStep({ persona, pick, onRestart }: { persona: Persona; pick: RankedPlan; onRestart: () => void }) {
  const reduce = useReducedMotion();
  const [channel, setChannel] = useState<"text" | "email" | "call">("text");
  const first = persona.name.replace(/^The /, "");
  const enrollmentId = `THX-${persona.id.slice(0, 2).toUpperCase()}-${pick.plan.id.replace(/\W/g, "").slice(-6).toUpperCase()}`;

  const stages: Stage[] = [
    { title: "Enrolled", when: "Today", detail: `Thatch sent your application to ${pick.plan.issuer}.`, state: "done" },
    { title: "Carrier is processing", when: "3–5 business days", detail: "This is the quiet part. We'll tell you when it ends, so you don't have to wonder.", state: "now" },
    { title: "Member ID issued", when: "By Dec 15", detail: "Your ID lands here and in the app. Pharmacies can use it before the card arrives.", state: "next" },
    {
      title: "Thatch Card ships",
      when: "Arrives before Jan 1",
      detail:
        pick.estimate.monthlyLeft > 0
          ? `Your card loads ${usd(pick.estimate.monthlyLeft)} on the first of each month.`
          : "Your premium uses your whole budget this year, so the card arrives with no monthly balance. It still works for Thatch Market deals.",
      state: "next",
    },
    { title: "Coverage starts", when: "Jan 1", detail: "First premium paid by Thatch on your behalf. You're covered.", state: "next" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-[60ch]">
        <p className="eyebrow">Step 5 of 5</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">You&apos;re enrolled. Here&apos;s exactly what happens next.</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The weeks between enrolling and your first appointment are where people get nervous. So we show every step, and we tell you
          when each one is done.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <ol className="card flex flex-col p-2" aria-label="Coverage timeline">
          {stages.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 28 }}
              className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 px-4 py-4"
            >
              {i < stages.length - 1 && <span aria-hidden className="absolute top-10 bottom-0 left-[29px] w-px bg-line-strong" />}
              <span
                aria-hidden
                className={`relative z-10 mt-0.5 grid size-7 place-items-center rounded-full text-xs font-semibold ${
                  s.state === "done" ? "bg-good-fill text-white" : s.state === "now" ? "bg-ink text-bg ring-4 ring-well" : "border border-line-strong bg-raised text-dim"
                }`}
              >
                {s.state === "done" ? "✓" : i + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className={`font-medium ${s.state === "next" ? "text-muted" : ""}`}>
                    {s.title}
                    {s.state === "now" && <span className="ml-2 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ink uppercase">Happening now</span>}
                  </p>
                  <p className="text-sm text-dim tabular">{s.when}</p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</p>
              </div>
            </motion.li>
          ))}
          <li className="m-2 mt-1 rounded-md bg-bg p-4">
            <p className="text-sm font-medium">How should we update you?</p>
            <div role="radiogroup" aria-label="Update channel" className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["text", "Text me"],
                  ["email", "Email me"],
                  ["call", "Call me"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={channel === id}
                  onClick={() => setChannel(id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${channel === id ? "border-ink bg-ink text-bg" : "border-line-strong text-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-dim">One message per step, nothing else. A human picks up at (415) 555-0142, evenings and weekends during open enrollment.</p>
          </li>
        </ol>

        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="rounded-lg bg-dark p-5 text-on-dark shadow-float">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-on-dark-muted uppercase">Enrollment confirmation</p>
                <p className="mt-1 text-lg leading-tight font-medium">{first}</p>
              </div>
              <span className="wordmark text-sm text-on-dark">Thatch</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-on-dark-muted">Plan</dt>
                <dd>
                  {pick.plan.issuer} {pick.plan.name}
                </dd>
              </div>
              <div>
                <dt className="text-on-dark-muted">Starts</dt>
                <dd>Jan 1</dd>
              </div>
              <div>
                <dt className="text-on-dark-muted">Enrollment ID</dt>
                <dd className="tabular">{enrollmentId}</dd>
              </div>
              <div>
                <dt className="text-on-dark-muted">Member ID</dt>
                <dd className="text-on-dark-muted">Pending from carrier</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-on-dark-muted">
              Not a member card yet. If you need care before your ID arrives, show this and the pharmacy or clinic can call Thatch to confirm
              your enrollment in under two minutes.
            </p>
          </div>
          <div className="card p-4 text-sm">
            <p className="eyebrow eyebrow-quiet">Your first month, planned</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex justify-between">
                <span className="text-muted">Budget from employer</span>
                <span className="tabular">{usd(persona.budget)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Premium, paid by Thatch</span>
                <span className="tabular">−{usd(pick.plan.premium)}</span>
              </li>
              <li className="flex justify-between border-t border-line pt-1.5 font-medium">
                <span>{pick.estimate.monthlyLeft >= 0 ? "Loads on your card Jan 1" : "From your paycheck"}</span>
                <span className={`tabular ${pick.estimate.monthlyLeft >= 0 ? "text-good" : "text-bad"}`}>{usd(Math.abs(pick.estimate.monthlyLeft))}</span>
              </li>
            </ul>
          </div>
          <button type="button" onClick={onRestart} className="self-start text-sm text-dim underline-offset-4 hover:text-ink hover:underline">
            Start over as someone else
          </button>
        </div>
      </div>
    </div>
  );
}
