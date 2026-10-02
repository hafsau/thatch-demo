"use client";

import { EVENTS, type Persona } from "@/lib/personas";

function Chip({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={`flex max-w-full flex-col items-start rounded-md border px-4 py-3 text-left transition-colors ${
        on ? "border-ink bg-ink text-bg" : "border-line bg-raised text-ink hover:border-line-strong"
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        <span
          aria-hidden
          className={`grid size-4 place-items-center rounded-full border text-[10px] ${on ? "border-bg bg-bg text-ink" : "border-line-strong"}`}
        >
          {on ? "✓" : ""}
        </span>
        {label}
      </span>
      {hint && <span className={`mt-1 text-sm ${on ? "text-bg/75" : "text-muted"}`}>{hint}</span>}
    </button>
  );
}

export function TryOnStep({
  persona,
  events,
  onToggle,
  onBack,
  onContinue,
}: {
  persona: Persona;
  events: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-[60ch]">
        <p className="eyebrow">Step 2 of 5</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Try it on with your actual life.</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Every plan looks cheap until you use it. Tell us who you see and what the year probably holds, and we&apos;ll
          price each plan for <em>your</em> year, not an average one.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="docs-h" className="flex flex-col gap-3">
          <h2 id="docs-h" className="text-base font-medium">
            Doctors you want to keep
          </h2>
          <ul className="flex flex-col gap-2">
            {persona.providers.map((p) => (
              <li key={p.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted">
                    {p.specialty} · {p.where}
                  </p>
                </div>
                <span className="rounded-full bg-good-soft px-2.5 py-1 text-xs font-medium text-good">Added</span>
              </li>
            ))}
          </ul>
          <button type="button" className="self-start text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            + Add a doctor or hospital
          </button>
        </section>

        <section aria-labelledby="meds-h" className="flex flex-col gap-3">
          <h2 id="meds-h" className="text-base font-medium">
            Prescriptions you take
          </h2>
          <ul className="flex flex-col gap-2">
            {persona.drugs.map((d) => (
              <li key={d.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-muted">
                    {d.kind === "brand" ? "Brand name" : "Generic"} · {d.why}
                  </p>
                </div>
                <span className="rounded-full bg-good-soft px-2.5 py-1 text-xs font-medium text-good">Added</span>
              </li>
            ))}
          </ul>
          <button type="button" className="self-start text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            + Add a prescription
          </button>
        </section>
      </div>

      <section aria-labelledby="year-h" className="flex flex-col gap-3">
        <div>
          <h2 id="year-h" className="text-base font-medium">
            What&apos;s likely this year?
          </h2>
          <p className="text-sm text-muted">Best guesses are fine. You can change these any time, and the plans will re-price.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {persona.offeredEvents.map((id) => {
            const ev = EVENTS[id];
            return <Chip key={id} on={events.includes(id)} onClick={() => onToggle(id)} label={ev.label} hint={ev.hint} />;
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="btn btn-primary"
        >
          See plans that fit →
        </button>
      </div>
    </div>
  );
}
