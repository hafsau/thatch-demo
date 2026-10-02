import { PERSONAS, type Persona } from "@/lib/personas";

export function PersonaBar({ persona, onChange, sourceNote }: { persona: Persona; onChange: (id: Persona["id"]) => void; sourceNote: string }) {
  return (
    <div className="border-b border-line bg-sunken">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm sm:px-6">
        <span className="eyebrow eyebrow-quiet">Demo · see it as</span>
        <div role="radiogroup" aria-label="Household" className="flex flex-wrap gap-1">
          {PERSONAS.map((p) => {
            const active = p.id === persona.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={active}
                type="button"
                onClick={() => onChange(p.id)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  active ? "border-ink bg-ink text-bg" : "border-line-strong bg-raised text-muted hover:text-ink"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
        <span className="text-muted">{persona.tagline}</span>
        <span className="ml-auto hidden text-xs text-dim lg:inline">{sourceNote}</span>
      </div>
    </div>
  );
}
