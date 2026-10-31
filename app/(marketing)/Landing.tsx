"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import HeroNetwork from "./HeroNetwork";
import { track } from "@/lib/track";

type ScrollCraftApi = { destroy: () => void };
declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => ScrollCraftApi };
  }
}

const CTA = "Run a real deal";
const CTA_HREF = "/capture?sample=en&run=1";

// One fictional deal, told in the four messages the samples in lib/samples.ts are built from.
const THREAD = [
  {
    from: "Your notes",
    via: "after the Startup ASEAN mixer",
    before: "Met Singapore logistics team. They're interested in testing our AI route optimizer. ",
    quote: "Suggested starting with a 14-day pilot",
    after: " using 10 vehicles. Sarah will send the operational requirements next Friday.",
  },
  {
    from: "Sarah Tan, LintasExpress SG",
    via: "email",
    before: "Thanks for ",
    quote: "walking our ops leads through the route optimizer on yesterday's call",
    after: ". We've agreed internally to proceed with the 14-day pilot on 10 vans, starting Monday.",
  },
  {
    from: "A friend of a friend",
    via: "WhatsApp",
    before: "",
    quote: "Heard from someone at the mixer",
    after: " that LintasExpress might sign with us soon, they seemed really keen. Should be a done deal!",
  },
  {
    from: "Sarah Tan, LintasExpress SG",
    via: "email",
    before: "Quick update: the 14-day pilot is ",
    quote: "now live on all 10 vans since Monday",
    after: ". Drivers are using the optimised routes daily.",
  },
];

const VERDICTS = [
  { level: "proposed", label: "Proposed", stage: "Pilot", note: "Nobody agreed to anything yet. Not counted." },
  { level: "completed", label: "Completed", stage: "Meeting held", note: "Quote found word for word. You confirm, the deal moves." },
  { level: "rejected", label: "Hearsay", stage: "Partnership", note: "A rumour is not evidence. The funnel does not move." },
  { level: "completed", label: "Completed", stage: "POC launched", note: "The pilot is live, in their words. Confirmed." },
];

const STAGES = ["Introduced", "Meeting held", "POC launched", "Partnership signed"];
// Funnel position after each message is audited. Only completed, grounded evidence moves it.
const FUNNEL_AFTER = [0, 1, 1, 2];
// Act progress at which each message is stamped. The scan runs over the 0.09 before it.
const STAMP_AT = [0.14, 0.34, 0.58, 0.8];
const SCAN = 0.09;

export default function Landing() {
  const api = useRef<ScrollCraftApi | null>(null);
  const audit = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [draft, setDraft] = useState("");

  useEffect(() => () => api.current?.destroy(), []);
  useEffect(() => track("landing_view"), []);

  // Real counters from the anonymous event log. Hidden until there is something true to say.
  const [stats, setStats] = useState<{ audited: number; confirmed: number; refused: number } | null>(null);
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((s: { available: boolean; audited: number; confirmed: number; refused: number }) => {
        if (s.available && s.audited > 0) setStats(s);
      })
      .catch(() => {});
  }, []);
  const proof = stats && (
    <p className="proof">
      <span className="proof__dot" aria-hidden="true" />
      Live on this site: {stats.audited} deal{stats.audited === 1 ? "" : "s"} audited by Gemma 4 · {stats.confirmed} step
      {stats.confirmed === 1 ? "" : "s"} verified · {stats.refused} rumour{stats.refused === 1 ? "" : "s"} refused
    </p>
  );

  // The engine publishes act progress as --sc-p. Read it once per frame and quantise, so React only re-renders on a real change.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = audit.current;
      if (el) {
        const v = parseFloat(getComputedStyle(el).getPropertyValue("--sc-p")) || 0;
        setP((old) => (Math.abs(old - v) > 0.004 ? Math.round(v * 250) / 250 : old));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stamped = STAMP_AT.filter((t) => p >= t).length;
  const scanning = STAMP_AT.findIndex((t) => p >= t - SCAN && p < t);
  const funnel = stamped ? FUNNEL_AFTER[stamped - 1] : 0;
  const peakSeen = useRef(false);
  useEffect(() => {
    if (stamped >= 3 && !peakSeen.current) {
      peakSeen.current = true;
      track("audit_peak");
    }
  }, [stamped]);

  return (
    <>
      <Script
        src="/sc/scrollcraft.js"
        onReady={() => {
          api.current?.destroy();
          if (window.ScrollCraft) api.current = window.ScrollCraft.mount(document.body);
        }}
      />
      <span data-sc-progress />
      <div className="sc-grain" aria-hidden="true" />

      <header className="bar">
        <a href="/" className="bar__mark" aria-label="HandshakeOS home">
          <span className="bar__logo">H</span>
          HandshakeOS
        </a>
        <nav className="bar__links">
          <a href="#audit">How it checks</a>
          <a href="/dashboard">Outcomes</a>
          <a className="bar__cta" href={CTA_HREF} onClick={() => track("cta_click", { where: "bar" })}>{CTA}</a>
        </nav>
      </header>

      <main id="top">
        {/* 1 · Recognition: the scroll pushes the camera in toward last night's card while the noise falls away. */}
        <section data-sc-act="scrub" data-sc-span="1.6" data-sc-dwell="0.3" data-sc-drift="#0b0f14" className="hero">
          <div data-sc-stage className="hero__stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sc-stage__poster hero__media" src="/landing/hero-plate.jpg" alt="" />
            <video className="hero__media" data-sc-scrub data-sc-src="/landing/hero-dolly.mp4" data-sc-src-mobile="/landing/hero-dolly-m.mp4" muted playsInline />
            <div className="hero__scrim" aria-hidden="true" />
            <HeroNetwork />
            <div className="hero__copy" data-sc-cue="0 0.7 0">
              <p className="eyebrow">For Startup ASEAN founders and ecosystem teams</p>
              <h1 className="hero__title">Prove the deal, not the handshake.</h1>
              <p className="hero__lede">
                Paste meeting notes, a WhatsApp thread or a business card. HandshakeOS drafts the next steps, then checks
                every claim against what was actually said. Your pipeline only moves when the evidence does.
              </p>
              <div className="hero__actions">
                <a className="btn btn--accent" href={CTA_HREF} onClick={() => track("cta_click", { where: "hero" })}>{CTA}</a>
                <a className="btn btn--ghost" href="#audit">Watch it audit a deal</a>
              </div>
              {proof}
            </div>
            <div className="hero__chips" aria-hidden="true">
              <div className="chip chip--a" data-sc-parallax="0.22">
                <span className="stamp stamp--committed">Committed</span>
                <q>We&apos;ve agreed internally to proceed</q>
              </div>
            </div>
          </div>
        </section>

        {/* 2 · Tension: the copy assembles while the frame holds. */}
        <section data-sc-act="pin" data-sc-span="2.2" data-sc-drift="#10151d" className="tension">
          <div data-sc-stage className="tension__stage">
            <p data-sc-cue="0.02 0.34 0.1">Every mixer ends the same way.</p>
            <p data-sc-cue="0.24 0.58">A pocket of business cards. A dozen &ldquo;let&apos;s explore a pilot&rdquo;.</p>
            <p data-sc-cue="0.5 0.84">Three weeks later, nobody can say who promised what.</p>
            <p className="tension__turn" data-sc-cue="0.76">And the pipeline still counts every one of them.</p>
          </div>
        </section>

        {/* 3 · Peak: the audit. Four real messages, one verdict each. The hearsay is the moment. */}
        <section
          id="audit"
          ref={audit}
          data-sc-act="pin"
          data-sc-span="4.6"
          data-sc-drift="#0b0f14"
          className="audit"
        >
          <div data-sc-stage className="audit__stage" data-stamped={stamped}>
            <div className="audit__head">
              <h2>Four messages. One deal. Watch what counts.</h2>
            </div>
            <ol className="thread">
              {THREAD.map((m, i) => {
                const state = i < stamped ? "done" : i === scanning ? "scan" : p >= STAMP_AT[i] - SCAN - 0.06 ? "next" : "hidden";
                const v = VERDICTS[i];
                return (
                  <li key={i} className={`msg msg--${state} msg--${v.level} ${i < stamped - 1 ? "msg--past" : ""}`}>
                    <div className="msg__meta">
                      <span>{m.from}</span>
                      <span className="msg__via">{m.via}</span>
                    </div>
                    <p className="msg__body">
                      {m.before}
                      <mark className="msg__quote">{m.quote}</mark>
                      {m.after}
                    </p>
                    <div className="msg__verdict">
                      <span className={`stamp stamp--${v.level}`}>{v.label}</span>
                      <span className="msg__stage">{v.stage}</span>
                      <span className="msg__note">{v.note}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <aside className="ledger" aria-label="Deal funnel">
              <p className="ledger__label">LintasExpress · Malaysia to Singapore</p>
              <ol className={`funnel ${stamped === 3 ? "funnel--refused" : ""}`}>
                {STAGES.map((s, i) => (
                  <li key={s} className={i <= funnel ? "is-on" : ""}>
                    <span className="funnel__bar" />
                    <span className="funnel__name">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="ledger__status" aria-live="polite">
                {stamped === 0 && "Reading the conversation."}
                {stamped === 1 && "A suggestion is not a commitment."}
                {stamped === 2 && "Meeting confirmed against the source."}
                {stamped === 3 && "Someone said it was a done deal. Not counted."}
                {stamped === 4 && "Two verified steps. Zero inflated ones."}
              </p>
            </aside>
          </div>
        </section>

        {/* 4 · Substance: the three levels, as a document. */}
        <section className="rules" data-sc-act="flow" data-sc-drift="#f2efe8">
          <div className="rules__wrap">
            <div className="rules__lead" data-sc-in>
              <h2>Three words decide whether a deal moved.</h2>
              <p>
                Gemma 4 reads the evidence in any ASEAN language and sorts every statement into one of three levels. The
                quote has to exist in the source, or it is downgraded. Only you can confirm a step.
              </p>
            </div>
            <dl className="levels" data-sc-in data-sc-stagger="90">
              <div>
                <dt><span className="stamp stamp--proposed">Proposed</span></dt>
                <dd><q>We should run a pilot.</q> Interest, not a decision.</dd>
              </div>
              <div>
                <dt><span className="stamp stamp--committed">Committed</span></dt>
                <dd><q>We agree to run the pilot, starting Monday.</q> A promise with a date. Worth chasing.</dd>
              </div>
              <div>
                <dt><span className="stamp stamp--completed">Completed</span></dt>
                <dd><q>The pilot is live on all 10 vans.</q> The only level that moves the funnel.</dd>
              </div>
              <div>
                <dt><span className="stamp stamp--proposed">Bahasa too</span></dt>
                <dd><q>Hafiz cakap boleh mula dengan 20 kedai dulu.</q> Read in the language it was said.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 5 · Commitment: the page stops and responds. */}
        <section id="start" data-sc-act="pin" data-sc-span="1.1" data-sc-drift="#0b0f14" className="close">
          <div data-sc-stage className="close__stage" data-sc-spotlight>
            <div className="close__inner">
              <h2 data-sc-cue="0.04" data-sc-kinetic="lines">Bring the conversation you had last night.</h2>
              <p data-sc-cue="0.08">No sign-up. The sample deal runs in one click, or paste your own.</p>
              <div className="close__actions">
                <a className="btn btn--accent btn--lg" href={CTA_HREF} onClick={() => track("cta_click", { where: "close" })} data-sc-magnet="0.26" data-sc-cue="0.04" data-sc-rise="0">
                  {CTA}
                </a>
              </div>
              <form
                className="own"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim().length < 20) return;
                  try {
                    sessionStorage.setItem("hs:draft", draft.trim());
                  } catch {
                    return void (location.href = "/capture");
                  }
                  track("cta_click", { where: "own" });
                  location.href = "/capture?draft=1&run=1";
                }}
              >
                <label htmlFor="own-notes" className="own__label">Or audit your own notes. Any ASEAN language.</label>
                <textarea
                  id="own-notes"
                  className="own__box"
                  rows={3}
                  maxLength={20000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Paste last night's WhatsApp thread, an email, or your meeting notes"
                />
                <button type="submit" className="btn btn--ghost own__go" disabled={draft.trim().length < 20}>
                  Audit my notes
                </button>
              </form>
              {proof}
            </div>
            <footer className="foot">
              <span>HandshakeOS · built for the Cradle Outcome Conversion challenge</span>
              <span>Powered by Gemma 4</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
