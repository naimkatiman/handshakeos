import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HandshakeOS · Evaluate it in three minutes",
  description: "Six steps through HandshakeOS for judges: what to click, what to look for, and what is real.",
};

const STEPS = [
  {
    href: "/#audit",
    title: "Watch a rumour get refused",
    doIt: "Scroll the landing page to the four-message audit.",
    look: "Each message is stamped proposed, completed or hearsay. The hearsay lunges the funnel forward, then it falls back. Only completed evidence moves a deal.",
  },
  {
    href: "/capture?sample=en&run=1",
    title: "Run a real deal with live Gemma 4",
    doIt: "Open the guided sample. Press Verify, then Confirm, then send the rumour.",
    look: "The model name and seconds on screen, every claim quoted from the source, a deal that advances only after you confirm, and the rumour rejected.",
  },
  {
    href: "/capture",
    title: "Use your own words",
    doIt: "Paste meeting notes in any ASEAN language, drop a business card photo, or import a WhatsApp chat export (.txt).",
    look: "Your own sentences highlighted where the model found each claim. A quote it cannot find in your text is downgraded, never shown as fact.",
  },
  {
    href: "/capture?sample=en&run=1",
    title: "Ask the deal a question",
    doIt: "On the sample deal, ask “Who has to sign off?”, then “What is the next deadline?”",
    look: "An answer the notes do not contain comes back as “The conversation does not say.” An answer they do contain comes back with the exact quote. No guessing.",
  },
  {
    href: "/dashboard",
    title: "See outcomes, not activity",
    doIt: "Pick a country on the ASEAN map, check Chase this week, then Print report.",
    look: "Conversion counted only on confirmed stages, who owes what this week with a one-tap nudge, and a one-page report for sponsors.",
  },
  {
    href: "/versions",
    title: "See how it was built",
    doIt: "Open the changelog.",
    look: "Every release on the live site, why it shipped, and the check that verified it.",
  },
];

const FACTS = [
  ["Model", "Open-weight Gemma 4 (google/gemma-4-26b-a4b-it) through OpenRouter. If it has not answered in 15 s, Gemini races it and the first good answer wins. The result always names the model that answered."],
  ["Grounding", "Every quote is checked against the source text. Ungrounded quotes are downgraded and can never count as completed."],
  ["Human in the loop", "The model never moves a deal. A person confirms each stage, and every decision lands in the audit trail."],
  ["Illustrative data", "The sample deals on Outcomes are illustrative and labelled so. Once you capture your own, the funnel switches to yours."],
  ["Your data", "Deals stay in your browser. The site records anonymous funnel events (a random per-tab id, no personal data). Model calls are capped at 10 per minute per visitor."],
];

export default function Judge() {
  return (
    <div className="space-y-8 pt-4">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">For judges · about three minutes</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Evaluate HandshakeOS in six steps.</h1>
        <p className="mt-3 text-muted">
          HandshakeOS turns networking conversations into partnership outcomes, and only counts a step when the evidence is real. Each step below says what
          to do and what to look for.
        </p>
      </div>

      <ol className="grid gap-3 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Link href={s.href} className="flex h-full flex-col rounded-xl border border-line bg-card p-5 transition hover:border-accent">
              <span className="font-mono text-xs font-semibold text-accent">Step {i + 1}</span>
              <span className="mt-1 text-lg font-semibold tracking-tight">{s.title}</span>
              <span className="mt-2 text-sm">{s.doIt}</span>
              <span className="mt-2 text-sm text-muted">
                <span className="font-medium text-ink">Look for: </span>
                {s.look}
              </span>
              <span className="mt-auto pt-4 text-sm font-semibold text-accent">Open →</span>
            </Link>
          </li>
        ))}
      </ol>

      <section aria-labelledby="real" className="rounded-xl border border-line bg-card p-5">
        <h2 id="real" className="text-[13px] font-semibold uppercase tracking-wider text-muted">What is real, what is illustrative</h2>
        <dl className="mt-3 divide-y divide-line">
          {FACTS.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
