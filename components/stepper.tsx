export type StepId = "budget" | "tryon" | "plans" | "left" | "covered";

export const STEPS: { id: StepId; label: string }[] = [
  { id: "budget", label: "Your budget" },
  { id: "tryon", label: "Try it on" },
  { id: "plans", label: "Plans that fit" },
  { id: "left", label: "What's left" },
  { id: "covered", label: "You're covered" },
];

export function Stepper({ current, reached, onGo }: { current: StepId; reached: StepId[]; onGo: (s: StepId) => void }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Progress" className="fade-x -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ol className="flex min-w-max items-center gap-1 text-sm">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const can = reached.includes(s.id);
          return (
            <li key={s.id} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!can}
                onClick={() => onGo(s.id)}
                aria-current={s.id === current ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors disabled:cursor-default ${
                  s.id === current ? "bg-ink text-bg" : done ? "text-ink hover:bg-sunken" : "text-dim"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid size-5 place-items-center rounded-full text-[11px] font-semibold ${
                    s.id === current ? "bg-bg text-ink" : done ? "bg-good-fill text-white" : "border border-line-strong text-dim"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className="h-px w-4 bg-line-strong" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
