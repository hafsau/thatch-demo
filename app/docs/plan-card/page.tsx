import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Plan card spec",
  description: "Component documentation for the Fitting Room plan card: anatomy, states, content rules, accessibility.",
};

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl font-medium tracking-tight">
      {children}
    </h2>
  );
}
function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[68ch] leading-relaxed text-muted">{children}</p>;
}
function Rule({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  return (
    <li className={`rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed ${kind === "do" ? "border-good bg-good-soft/50" : "border-bad bg-bad-soft/50"}`}>
      <span className={`mr-2 font-semibold ${kind === "do" ? "text-good" : "text-bad"}`}>{kind === "do" ? "Do" : "Don't"}</span>
      <span className="text-muted">{children}</span>
    </li>
  );
}

const ANATOMY = [
  ["Rank and badges", "Position in the current sort, metal level dot, plan type, HSA flag, quality stars. All secondary; small and muted."],
  ["Name", "Issuer in ink, plan name in muted. People recognise the carrier first."],
  ["Your year", "Estimated yearly total for the household's described year. The largest number on the card, set in the headline style. Leads the row because it is the sort key."],
  ["Monthly", "The premium. Second, because it is what every other site leads with and people will look for it."],
  ["Left on your card", "Budget minus premium. Green when positive, red with a minus sign when the premium exceeds the budget."],
  ["Deductible", "Fourth. Important, but only meaningful next to the year estimate."],
  ["Coverage rows", "One line per doctor and per prescription the person added, with a glyph and status in words. Never a bare icon."],
  ["Warning", "Only when something they added isn't covered. States the dollar consequence and the reason in one sentence."],
  ["Actions", "Choose (primary, ink) and Compare (secondary, outline). Compare is a toggle with aria-pressed and disables itself when two are selected."],
] as const;

const STATES = [
  ["Default", "Card on cream, hairline border, soft shadow."],
  ["Best fit", "1px ink ring and a small uppercase badge, 'Best fit for your year'. Exactly one card has it, always the lowest estimated year regardless of the current sort."],
  ["Hover / focus-within", "Shadow lifts. The ledger panel switches to this plan with the label 'Previewing'. Focus does the same as hover, so keyboard users get the preview too."],
  ["In compare", "Compare button reads '✓ Comparing' on sunken background with an ink border."],
  ["Compare full", "Other cards' Compare buttons are disabled at 40% opacity. Choose stays enabled."],
  ["Over budget", "'Left on your card' turns red and shows a minus sign. The ledger explains that the difference comes from the paycheck."],
  ["Not covered", "Coverage row glyph turns ✕ and red; a warning block states the dollar amount at full price and why."],
  ["Unknown network", "Glyph is ? in warn colour with 'we'll confirm within 4 days'. Treated as in-network for the estimate, and the copy says so in the case study."],
  ["Reduced motion", "No layout animation when the order changes; cards snap."],
] as const;

export default function PlanCardDoc() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6">
      <div className="max-w-[60ch]">
        <p className="eyebrow">Design doc · Component</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Plan card</h1>
        <P>
          The plan card is the unit of decision in Fitting Room. Everything else on the plans step exists to help someone compare cards. This
          page is written the way I&apos;d document it for the team: what it is for, what&apos;s in it, how it behaves, and what not to do with
          it. See it live on the{" "}
          <Link href="/" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            prototype
          </Link>
          .
        </P>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-dim">Status</dt>
            <dd className="font-medium">Concept, v1</dd>
          </div>
          <div>
            <dt className="text-dim">Owner</dt>
            <dd className="font-medium">Hafsa Usmani</dd>
          </div>
          <div>
            <dt className="text-dim">Source</dt>
            <dd className="font-medium">components/plan-card.tsx</dd>
          </div>
          <div>
            <dt className="text-dim">Last updated</dt>
            <dd className="font-medium">Oct 2026</dd>
          </div>
        </dl>
      </div>

      <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-y border-line py-3 text-sm">
        {[
          ["purpose", "Purpose"],
          ["anatomy", "Anatomy"],
          ["states", "States"],
          ["content", "Content rules"],
          ["layout", "Layout"],
          ["a11y", "Accessibility"],
          ["open", "Open questions"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="text-muted hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-12 flex flex-col gap-14">
        <section className="flex flex-col gap-4">
          <H2 id="purpose">Purpose</H2>
          <P>
            Let a person judge one plan against their own year in under ten seconds, and against another plan in under thirty. The card
            answers four questions in order: what will this cost me this year, what will it cost me each month, what&apos;s left for my
            care, and does it cover the people and prescriptions I named.
          </P>
          <P>
            It is <em>not</em> a summary of benefits. Copays, coinsurance and hospital costs live in the compare view, where there is room to
            explain them. Putting them on the card made every card look the same and the important differences disappear.
          </P>
        </section>

        <section className="flex flex-col gap-5">
          <H2 id="anatomy">Anatomy</H2>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <figure className="card relative p-6" aria-label="Annotated plan card">
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center gap-3 text-xs text-dim">
                  <Num n={1} />
                  <span>#1</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-silver" />
                    Silver
                  </span>
                  <span>HMO</span>
                  <span>★★★★<span className="text-line-strong">★</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Num n={2} />
                  <p className="text-lg font-medium">
                    Oscar <span className="text-muted">Silver Classic</span>
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    [3, "Your year", "$6,994", "display"],
                    [4, "Monthly", "$462", ""],
                    [5, "Left on your card", "$88/mo", "text-good"],
                    [6, "Deductible", "$5,000", ""],
                  ].map(([n, k, v, cls]) => (
                    <div key={String(k)}>
                      <div className="flex items-center gap-1.5 text-dim">
                        <Num n={n as number} />
                        <span className="text-xs">{k}</span>
                      </div>
                      <p className={`mt-0.5 text-xl tabular ${cls}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3">
                  <Num n={7} />
                  <ul className="grid flex-1 grid-cols-2 gap-1 text-muted">
                    <li>
                      <span className="text-good">✓</span> Lena Ortiz · in network
                    </li>
                    <li>
                      <span className="text-good">✓</span> Dr. Sam Patel · in network
                    </li>
                    <li>
                      <span className="text-good">✓</span> Sertraline · covered
                    </li>
                  </ul>
                </div>
                <div className="flex items-center gap-3">
                  <Num n={8} />
                  <p className="flex-1 rounded-md bg-bad-soft px-3 py-2 text-bad">About $6,000 of your year would be full price on this plan because Lena Ortiz is out of network.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Num n={9} />
                  <div className="flex gap-2">
                    <span className="rounded-full bg-ink px-4 py-2 text-bg">Choose this plan</span>
                    <span className="rounded-full border border-line-strong px-4 py-2 text-muted">Compare</span>
                  </div>
                </div>
              </div>
            </figure>
            <ol className="flex flex-col gap-3">
              {ANATOMY.map(([title, body], i) => (
                <li key={title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <Num n={i + 1} />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <H2 id="states">States</H2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left">
                <th className="border-b border-line-strong py-2 pr-4 font-medium">State</th>
                <th className="border-b border-line-strong py-2 font-medium">Behaviour</th>
              </tr>
            </thead>
            <tbody>
              {STATES.map(([s, b]) => (
                <tr key={s} className="align-top">
                  <th scope="row" className="border-b border-line py-2.5 pr-4 text-left font-medium whitespace-nowrap">
                    {s}
                  </th>
                  <td className="border-b border-line py-2.5 leading-relaxed text-muted">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-5">
          <H2 id="content">Content rules</H2>
          <ul className="grid gap-2 lg:grid-cols-2">
            <Rule kind="do">Lead with the year. It is the sort key, so it is the first number.</Rule>
            <Rule kind="dont">Lead with the premium. That is the default everywhere else and the reason people get burned.</Rule>
            <Rule kind="do">Say &quot;left on your card&quot;. It names where the money goes.</Rule>
            <Rule kind="dont">Say &quot;savings&quot; or &quot;remaining allowance&quot;. One is marketing, the other is HR.</Rule>
            <Rule kind="do">Show a status in words next to every glyph: &quot;in network&quot;, &quot;not covered, full price&quot;.</Rule>
            <Rule kind="dont">Use a bare check or cross. Colour and shape alone fail for a lot of people and all screen readers.</Rule>
            <Rule kind="do">Give a dollar consequence for anything not covered, and the reason, in one sentence.</Rule>
            <Rule kind="dont">Hide a plan with an out-of-network doctor. People should see the trade-off; it is sometimes worth it.</Rule>
            <Rule kind="do">Use a real minus sign (−) and the phrase &quot;from your paycheck&quot; when the premium exceeds the budget.</Rule>
            <Rule kind="dont">Show a negative number in red with no explanation. Red without words reads as &quot;error&quot;.</Rule>
            <Rule kind="do">Keep insurance terms behind the dotted underline. The plain word is the label; the term is one hover away.</Rule>
            <Rule kind="dont">Define terms inline on the card. It doubles the height and nobody reads it at this moment.</Rule>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <H2 id="layout">Layout</H2>
          <P>
            Desktop: a two-column grid, content left and a 160px action column right, actions vertically centred. The four numbers sit in a
            four-column row. Below 640px the actions move under the content as a horizontal pair and the numbers collapse to two columns.
            Cards use <code className="rounded-xs bg-sunken px-1 text-[0.9em]">layout</code> animation when the order changes, 350ms ease-out,
            disabled under reduced motion.
          </P>
          <P>
            Minimum height is not fixed. A card with a warning is taller than one without, and that is correct: the warning is information,
            not decoration.
          </P>
        </section>

        <section className="flex flex-col gap-4">
          <H2 id="a11y">Accessibility</H2>
          <ul className="grid max-w-[68ch] list-disc gap-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              The card is a <code className="rounded-xs bg-sunken px-1 text-[0.9em]">li</code> labelled by its heading, so a list of cards reads as &quot;list, 10 items, Oscar Silver Classic&quot;.
            </li>
            <li>Focus inside the card triggers the same ledger preview as hover; the ledger is an aria-live region, polite.</li>
            <li>Compare uses aria-pressed; when two are selected the others are disabled, not hidden, and the reason is visible in the compare panel.</li>
            <li>Quality stars have an aria-label (&quot;4 of 5 stars&quot;). Metal dots are aria-hidden; the metal name is text.</li>
            <li>All text meets 4.5:1. Green and red statuses are never the only signal; every one has a glyph and words.</li>
            <li>Term tooltips are buttons with aria-describedby pointing at the always-present definition, so they work on touch and with a screen reader.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <H2 id="open">Open questions</H2>
          <ul className="grid max-w-[68ch] gap-3 text-sm leading-relaxed text-muted">
            <li className="border-l border-line-strong pl-4">
              <span className="font-medium text-ink">Should the year estimate show a range?</span> A single number is legible; a range is honest. My current answer is a single number on the card and the arithmetic in compare, but I&apos;d test a &quot;$6,500–7,400&quot; variant.
            </li>
            <li className="border-l border-line-strong pl-4">
              <span className="font-medium text-ink">Where does the AI advisor live?</span> Thatch has &quot;Ask Thatch&quot;. The card should not become a chat surface, but a card-level &quot;why is this ranked here?&quot; that opens the advisor with context is worth trying.
            </li>
            <li className="border-l border-line-strong pl-4">
              <span className="font-medium text-ink">Compliance.</span> If Thatch displays plans under CMS Enhanced Direct Enrollment rules, default sort and badge language need review. Healthcare.gov itself offers an &quot;estimated total yearly costs&quot; figure, so the concept is allowed; the defaults are the question.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Num({ n }: { n: number }) {
  return (
    <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-ink">
      {n}
    </span>
  );
}
