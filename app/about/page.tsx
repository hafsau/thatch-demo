import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Case study",
  description:
    "How Fitting Room was researched, framed, explored and built: an end-to-end product design example for Thatch, with the directions that lost and the limits.",
};

function Section({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={eyebrow.toLowerCase().replace(/[^a-z]+/g, "-")} className="grid gap-6 border-t border-line py-14 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div className="md:sticky md:top-24 md:self-start">
        <p className="eyebrow">
          {n} · {eyebrow}
        </p>
      </div>
      <div className="flex max-w-[68ch] flex-col gap-5">
        <h2 className="display text-4xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}
function P({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed text-muted">{children}</p>;
}
function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {children}
    </a>
  );
}
function Callout({ children }: { children: ReactNode }) {
  return <div className="rounded-md border-l-4 border-accent bg-raised px-5 py-4 leading-relaxed text-muted">{children}</div>;
}
function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="border-l border-line-strong pl-4">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
    </li>
  );
}

/** A low-fidelity wireframe for a rejected direction. */
function Wire({ title, verdict, children }: { title: string; verdict: string; children: ReactNode }) {
  return (
    <figure className="card flex flex-col gap-3 p-4">
      <div aria-hidden className="rounded-sm border border-dashed border-line-strong bg-bg p-3 text-[10px] leading-tight text-muted">
        {children}
      </div>
      <figcaption>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{verdict}</p>
      </figcaption>
    </figure>
  );
}
const Box = ({ className = "", dark = false, children }: { className?: string; dark?: boolean; children?: ReactNode }) => (
  <div className={`rounded-xs border px-1.5 py-1 ${dark ? "border-ink bg-ink text-bg" : "border-line-strong bg-raised"} ${className}`}>{children}</div>
);

const SWATCHES = [
  ["Warm gray 50", "--bg", "Page"],
  ["White", "--raised", "Cards"],
  ["Section tint", "--sunken", "Wells, bars"],
  ["Ink", "--ink", "Text, primary action"],
  ["Brand red", "--accent", "Eyebrows, the main button"],
  ["Warm green", "--good", "Yours: left on the card, in network"],
  ["Warm orange", "--warn", "Unknown, confirming"],
  ["Warm red", "--bad", "Not covered, from paycheck"],
] as const;

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6">
      <header className="grid gap-8 pb-14 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
        <p className="eyebrow md:pt-4">Case study</p>
        <div className="flex max-w-[68ch] flex-col gap-6">
          <h1 className="display text-5xl sm:text-6xl">Pricing the year, not the month.</h1>
          <p className="text-xl leading-relaxed text-muted">
            Thatch gives employees a budget and lets them choose their own health plan. That is a better model than group insurance and a
            harder decision for the person making it. This is an end-to-end design example for the hardest version of that decision, built
            as my application for the Product Designer role.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-dim">Role</dt>
              <dd>Research, design, copy, build. Solo.</dd>
            </div>
            <div>
              <dt className="text-dim">When</dt>
              <dd>Early October 2026, four days.</dd>
            </div>
            <div>
              <dt className="text-dim">Inputs</dt>
              <dd>Public reviews, Thatch&apos;s site and help copy, CMS plan data.</dd>
            </div>
            <div>
              <dt className="text-dim">Output</dt>
              <dd>
                A{" "}
                <Link href="/" className="text-ink underline decoration-line-strong underline-offset-4">
                  working prototype
                </Link>
                , this write-up, a{" "}
                <Link href="/docs/plan-card" className="text-ink underline decoration-line-strong underline-offset-4">
                  component spec
                </Link>
                .
              </dd>
            </div>
          </dl>
          <Callout>
            <strong className="text-ink">The short version.</strong> Every marketplace sorts plans by monthly premium. Thatch&apos;s budget model
            makes a better number visible: what the year will really cost, and what&apos;s left for your care. Fitting Room makes that the
            default, prices by the real address, keeps your doctors in the ranking, and doesn&apos;t go quiet after you enroll.
          </Callout>
        </div>
      </header>

      <Section n="01" eyebrow="Why now" title="The hardest year yet to pick a plan on a fixed budget.">
        <P>
          Open Enrollment opens on November 1, 2026. The enhanced ACA premium subsidies expired in January, and individual-market premiums
          rose with them. For someone on a Thatch budget, the budget is fixed and the plans got more expensive, which widens the gap between
          the cheapest premium and the cheapest year.
        </P>
        <P>
          Thatch&apos;s own numbers set the target. 85% of employees pick a plan on their own and 93% rate the experience good or great (
          <A href="https://thatch.com/how-it-works">thatch.com</A>). That is excellent. It also means the remaining 7 to 15% are where support
          hours, anxiety, and the one-star reviews concentrate. A design that helps the person who is about to pick the wrong plan helps the
          business more than one that delights the person who was always going to be fine.
        </P>
        <P>
          Two more signals shaped the brief. Thatch acquired Venteur in April 2026 for its plan-curation work, and it is hiring a Head of
          Product Design with the phrase &quot;consumer-grade craft&quot; in the posting. So: a consumer bar, applied to the moment Thatch is most
          different from everyone else.
        </P>
      </Section>

      <Section n="02" eyebrow="Who gets stuck" title="Four themes from public reviews, turned into three households.">
        <P>
          I read every public review I could find (73 on Trustpilot at 3.9/5, plus G2 and Capterra) and Thatch&apos;s help and marketing copy.
          Most reviews praise support by name, which tells you where the product currently leans. The negative ones cluster:
        </P>
        <ul className="grid gap-4">
          <Item title="“The price changed.”">
            Quotes during onboarding used a zip code, often the office&apos;s. The real price at the home address was higher. People read this as
            bait-and-switch even when it is a rating-area rule. Design response: confirm the home address before any price is shown, and say
            why.
          </Item>
          <Item title="“Am I covered yet?”">
            The weeks between enrolling and the first appointment: no member ID, no card, a premium that hasn&apos;t posted, a reimbursement
            &quot;under review&quot;. Design response: a coverage timeline with every step and its date, and an enrollment confirmation you can show
            before the ID arrives.
          </Item>
          <Item title="“Keep my doctor.”">
            For families, the pediatrician outranks the price. Network status is checked late, per plan, by hand. Design response: doctors
            and prescriptions are added first, shown on every card, and counted in the ranking at full price if out of network.
          </Item>
          <Item title="“Everything is email.”">
            Design response: pick your channel at enrollment, one message per step, and a human number with hours.
          </Item>
        </ul>
        <P>
          I turned these into three households rather than demographics, each with one non-negotiable, because that is how people actually
          choose. <strong className="text-ink">Maya</strong> (29, Austin) has a therapist she will not give up and optimized the wrong number
          last year. <strong className="text-ink">The Okafors</strong> (family of four, Columbus) have a pediatrician at Nationwide Children&apos;s
          and an inhaler that not every formulary covers; Daniel got a zip-code quote. <strong className="text-ink">Dennis</strong> (63,
          Phoenix) has a cardiologist, a blood thinner, and 18 months until Medicare; he has called support twice to ask whether he is
          &quot;actually covered yet&quot;.
        </P>
        <P>
          Honest scope note: no interviews. These are synthesized from public text and my own enrollment experiences. Section 07 says how
          I&apos;d validate them.
        </P>
      </Section>

      <Section n="03" eyebrow="The reframe" title="The right unit is the year, and Thatch is the only one who can show the leftover.">
        <P>
          Marketplaces inherited &quot;sort by premium&quot; from a world where the employer paid most of it and the employee saw a payroll deduction.
          Under an ICHRA the employee holds the budget and the risk. A $350 Bronze plan and a $460 Silver plan are $1,320 apart on premium and,
          for Maya&apos;s year of weekly therapy, about $3,600 apart in total, in the other direction. The sort order is the recommendation.
          Everything else is annotation.
        </P>
        <P>
          Healthcare.gov does offer an &quot;estimated total yearly costs&quot; figure, using low, medium and high usage buckets. The difference here is
          that the estimate uses <em>your</em> doctors, <em>your</em> prescriptions and <em>your</em> likely year; it is the default sort, not a
          column; it is shown against your budget; and the arithmetic is one click away so you can check it.
        </P>
        <P>
          That last part is Thatch&apos;s structural advantage. Thatch knows the budget. So it can show the number no public marketplace can:
          what&apos;s left for your care. The homepage already draws it as a static breakdown. Fitting Room makes it live.
        </P>
        <div className="card p-5">
          <p className="eyebrow mb-3">Principles I held to</p>
          <ol className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ["Price the year, not the month.", "The default sort is the recommendation."],
              ["Show the leftover.", "It is the reason Thatch exists."],
              ["The address is part of the price.", "Confirm it before a single number."],
              ["Never make someone guess if they're covered.", "Every step, every date."],
              ["Plain words first.", "Insurance words on hover."],
              ["Guidance, not nagging.", "Suggestions sized to what's left, dismissible."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-sm bg-bg px-3 py-2">
                <p className="font-medium text-ink">{t}</p>
                <p className="text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section n="04" eyebrow="What lost" title="Four directions I tried and why they lost.">
        <P>I sketched these as low-fidelity frames and walked each one through the three households before building anything.</P>
        <div className="grid gap-4 sm:grid-cols-2">
          <Wire title="A. The quiz" verdict="Seven questions in, one recommendation out. Lost because it hides the arithmetic, and people who've been burned don't trust a black box. Thatch already has AI guidance; what's missing is legibility, not another oracle.">
            <div className="flex flex-col gap-1">
              <Box>How often do you see a doctor? ○ Rarely ○ Sometimes ● Often</Box>
              <Box>Any regular prescriptions? ● Yes ○ No</Box>
              <Box>Expecting a big event? ○ Yes ● No</Box>
              <Box dark>We recommend: Silver Classic →</Box>
            </div>
          </Wire>
          <Wire title="B. Good / Better / Best" verdict="A curated trio. Lost because with a fixed budget 'Best' is often over the budget, and hiding the rest of the market makes the price-surprise complaints worse. Thatch is the agent of record across the market; the list has to be the list.">
            <div className="grid grid-cols-3 gap-1">
              <Box className="h-16">Good<br />$352</Box>
              <Box className="h-16 bg-sunken">Better<br />$462</Box>
              <Box className="h-16">Best<br />$548</Box>
            </div>
          </Wire>
          <Wire title="C. Premium-first with a 'true cost' badge" verdict="Keep the familiar sort, add a badge. Lost in informal tests: the badge read as marketing and the sort order still did the recommending. You can't annotate your way out of a wrong default.">
            <div className="flex flex-col gap-1">
              <Box className="flex justify-between"><span>Bronze · $352/mo</span><span className="rounded-xs bg-accent-soft px-1">true cost $10.6k</span></Box>
              <Box className="flex justify-between"><span>Bronze · $361/mo</span><span className="rounded-xs bg-accent-soft px-1">true cost $10.7k</span></Box>
              <Box className="flex justify-between"><span>Silver · $462/mo</span><span className="rounded-xs bg-good-soft px-1">true cost $7.0k</span></Box>
            </div>
          </Wire>
          <Wire title="D. The budget dashboard" verdict="One view to allocate your budget across insurance, card and Market with sliders. Lost because it treats the premium like a line item you can trim. Pretty, wrong model. I kept one idea from it: the proportional budget bar in the ledger.">
            <div className="flex flex-col gap-1">
              <Box>Insurance ▬▬▬▬▬▬▬○▬▬ $462</Box>
              <Box>Card ▬▬○▬▬▬▬▬▬▬ $60</Box>
              <Box>Market ▬○▬▬▬▬▬▬▬▬ $28</Box>
            </div>
          </Wire>
        </div>
        <P>
          One more decision worth naming: desktop-first. Comparing plans is a two-column task, and employers run enrollment sessions on laptops.
          The layout collapses to one column with the ledger below the list on phones. I would check that assumption against device analytics
          on day one; if most employees enroll on phones, the ledger becomes a sticky bottom strip.
        </P>
      </Section>

      <Section n="05" eyebrow="The flow" title="Five steps, one number that follows you.">
        <ol className="grid gap-4">
          <Item title="1 · Your budget">
            The hero is the budget, set large in Thatch&apos;s headline style, because it is the one number the person needs to hold in their head. The address confirmation
            sits beside it, before any price, with a one-line reason. Try it as <Link href="/" className="text-ink underline underline-offset-4">Maya</Link>.
          </Item>
          <Item title="2 · Try it on">
            Doctors and prescriptions as cards, &quot;what&apos;s likely this year&quot; as chips with a plain hint each. Best guesses are fine; the copy says so.
            There is no form to complete, only things to confirm.
          </Item>
          <Item title="3 · Plans that fit">
            Ranked by estimated year. Each card leads with the year, then the premium, then what&apos;s left on the card, then the deductible, and
            shows every doctor and drug you named with a status in words. The ledger on the right previews whichever card you hover or focus.
            Switching the sort to &quot;lowest monthly&quot; is allowed, and a note tells you what that choice costs. See the Okafors&apos; list for the
            out-of-network and uncovered-drug cases: <Link href="/?as=okafors" className="text-ink underline underline-offset-4">try it as the Okafors</Link>.
          </Item>
          <Item title="3b · Compare">
            Two plans side by side in plain words, then &quot;how the year adds up&quot; for each: premiums, every line of care, the cap if it applies.
            The arithmetic is the trust mechanism.
          </Item>
          <Item title="4 · What's left">
            The leftover, said plainly, including the case where the premium exceeds the budget (
            <Link href="/?as=dennis" className="text-ink underline underline-offset-4">Dennis</Link>). Market suggestions are sized to the leftover and
            can be dismissed with &quot;Not now&quot;. Nothing is pre-added.
          </Item>
          <Item title="5 · You're covered">
            A timeline with five steps and their dates, &quot;happening now&quot; marked, a channel choice, and a dark enrollment-confirmation card that
            is honest about what it is: not a member ID, but enough for a pharmacy to call and confirm.
          </Item>
        </ol>
      </Section>

      <Section n="06" eyebrow="The system" title="A small system, documented like a real one.">
        <P>
          Thatch publishes its design tokens as CSS custom properties on the marketing site: a warm-gray scale, the brand red, &quot;slab&quot; radii
          and elevations, and the easing curves. Fitting Room uses those values directly, renamed for the roles they play, so the prototype
          sits inside Thatch&apos;s visual language rather than next to it. Two adjustments, both on purpose: where a brand value fails WCAG AA
          for text (the red on cream is 4.3:1), the nearest step in Thatch&apos;s own scale is used for text and the brand value is kept for fills
          and hovers; and green is reserved for &quot;yours&quot;, money left on the card and a doctor in network, so it means one thing.
        </P>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SWATCHES.map(([name, v, use]) => (
            <li key={name} className="card overflow-hidden">
              <div className="h-14 border-b border-line" style={{ background: `var(${v})` }} />
              <div className="p-3 text-xs">
                <p className="font-medium text-ink">{name}</p>
                <p className="text-dim">{use}</p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="grid gap-4">
          <Item title="Type">
            Thatch sets headlines in Selecta at medium weight with -1% tracking and tight leading, buttons at 18px regular in pills, and
            eyebrows wide-tracked in brand red. Selecta is licensed, so Inter, which thatch.com also loads, stands in with the same settings.
            Tabular numerals wherever money appears, so nothing jitters when the ledger updates.
          </Item>
          <Item title="Components">
            Plan card (<Link href="/docs/plan-card" className="text-ink underline underline-offset-4">spec</Link>), ledger panel, term tip, chip,
            stepper, status row, compare dialog, timeline, confirmation card. Each has its states enumerated in code and the plan card&apos;s are
            written up.
          </Item>
          <Item title="Copy rules">
            Plain word as the label, insurance word on hover. A dollar consequence next to every warning. Negative money gets a real minus sign
            and a reason. No &quot;you may be eligible&quot;. No exclamation marks.
          </Item>
          <Item title="Motion">
            Money tweens because it is a quantity that should settle. Timeline steps spring because they are state. Cards use layout animation
            when the order changes. All of it is off under reduced motion, and the flow was tested that way.
          </Item>
          <Item title="Accessibility">
            axe clean on every step and in the dialog. Keyboard focus previews a plan the way hover does. The ledger is a polite live region.
            The compare view is a native dialog. Every colour-coded status has a glyph and words. All text at or above 4.5:1.
          </Item>
        </ul>
      </Section>

      <Section n="07" eyebrow="What I'd measure" title="How I'd know it worked, and how I'd test it first.">
        <ul className="grid gap-4">
          <Item title="Before building: eight sessions in window shopping week">
            Late October, when next year&apos;s plans publish. Households like these three. One task: &quot;pick a plan and tell me what your year will
            cost.&quot; Success is a number they can say out loud and defend. Failure is &quot;the cheap one&quot;.
          </Item>
          <Item title="Self-select rate and time to decision">
            Thatch&apos;s 85% is the baseline. Time to decision should go down for people who add a doctor; if it goes up, the try-it-on step is
            too heavy.
          </Item>
          <Item title="Support contacts per enrollee in the first 45 days, by theme">
            Price surprise and &quot;am I covered&quot; should fall first. This is the metric that pays for the work.
          </Item>
          <Item title="Distance from best fit">
            Share of people whose choice is within $500 of the best-fit year. People who switch to premium sort and choose Bronze anyway are
            fine; that is an informed choice, and it should show up as one.
          </Item>
          <Item title="Card balance at day 90">
            If the leftover is visible at decision time, it should get used. Unused balances are a sign the number did not land.
          </Item>
        </ul>
      </Section>

      <Section n="08" eyebrow="Honest limits" title="What this is not.">
        <ul className="grid gap-4">
          <Item title="The cost model is simple on purpose">
            Deductible first, then copay or coinsurance, capped at the out-of-pocket maximum; out-of-network and uncovered drugs at full price
            outside the cap. It ignores separate drug deductibles, tiered networks, embedded family deductibles, and coinsurance on
            drugs. Allowed amounts are rounded typical rates. The compare view shows every line so the simplifications are visible.
          </Item>
          <Item title="Plan data">
            The prototype ships with representative plans modeled on 2026 individual-market plans in each household&apos;s county, generated by
            a script in the repo. A second script pulls real plans, with provider and drug coverage, from the CMS Marketplace API in the same
            schema; the UI states which source it is showing. 2027 plans publish in late October.
          </Item>
          <Item title="No real provider search">
            Doctors and prescriptions are pre-added for each household. The real thing needs the NPI and formulary lookups the CMS API offers.
          </Item>
          <Item title="Compliance">
            If Thatch displays plans under CMS Enhanced Direct Enrollment rules, the default sort and the badge language need review. The idea
            is permitted (Healthcare.gov publishes its own yearly estimate); the defaults are the question.
          </Item>
          <Item title="Not affiliated">
            This is an unofficial concept. Market prices, enrollment dates, the support number and the enrollment ID are illustrative.
          </Item>
        </ul>
      </Section>

      <Section n="09" eyebrow="Process" title="How it was made.">
        <P>
          Half a day of reading reviews and Thatch&apos;s copy; a day of framing and the four rejected directions; two days of building, writing,
          and testing. I designed in code with Claude Code as a pair, the way I&apos;d want to work with an engineer: I made the calls on what to
          build, what to cut, and what the words say; it made the calls on how the TypeScript is arranged. The judgment this project needed was
          in the reframe, the rejected directions, the copy, and the decision to put the arithmetic one click away. The source is public.
        </P>
        <P>
          <strong className="text-ink">Sources.</strong> <A href="https://thatch.com/">thatch.com</A> and{" "}
          <A href="https://thatch.com/how-it-works">how it works</A>; <A href="https://www.trustpilot.com/review/thatch.com">Trustpilot</A>;{" "}
          <A href="https://www.g2.com/products/thatch-thatch/reviews">G2</A>;{" "}
          <A href="https://techcrunch.com/2025/04/03/thatch-raises-40m-to-give-employees-more-control-of-their-health-insurance-choices">TechCrunch</A>{" "}
          and <A href="https://medcitynews.com/2026/09/thatch-secures-108m-reaches-1b-valuation/">MedCity News</A> on funding;{" "}
          <A href="https://research.contrary.com/report/thatch">Contrary Research</A> on the business and the Venteur acquisition;{" "}
          <A href="https://developer.cms.gov/marketplace-api/">CMS Marketplace API</A>; <A href="https://www.healthcare.gov/">Healthcare.gov</A>{" "}
          for the yearly-estimate precedent.
        </P>
        <p className="pt-4 text-sm text-dim">
          Hafsa Usmani · <A href="https://hafsausmani.com">hafsausmani.com</A> · <A href="https://github.com/hafsau/thatch-demo">source</A>
        </p>
      </Section>
    </div>
  );
}
