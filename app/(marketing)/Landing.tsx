"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import HeroNetwork from "./HeroNetwork";
import { track } from "@/lib/track";
import { COPY, type Lang } from "./copy";

type ScrollCraftApi = { destroy: () => void };
declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => ScrollCraftApi };
  }
}

const CTA_HREF = "/capture?sample=en&run=1";

// One fictional deal, told in the four messages the samples in lib/samples.ts are built from.
const THREAD = [
  {
    before: "Met Singapore logistics team. They're interested in testing our AI route optimizer. ",
    quote: "Suggested starting with a 14-day pilot",
    after: " using 10 vehicles. Sarah will send the operational requirements next Friday.",
  },
  {
    before: "Thanks for ",
    quote: "walking our ops leads through the route optimizer on yesterday's call",
    after: ". We've agreed internally to proceed with the 14-day pilot on 10 vans, starting Monday.",
  },
  {
    before: "",
    quote: "Heard from someone at the mixer",
    after: " that LintasExpress might sign with us soon, they seemed really keen. Should be a done deal!",
  },
  {
    before: "Quick update: the 14-day pilot is ",
    quote: "now live on all 10 vans since Monday",
    after: ". Drivers are using the optimised routes daily.",
  },
];

const LEVELS = ["proposed", "completed", "rejected", "completed"] as const;

// Funnel position after each message is audited. Only completed, grounded evidence moves it.
const FUNNEL_AFTER = [0, 1, 1, 2];
// Act progress at which each message is stamped. The scan runs over the 0.09 before it.
const STAMP_AT = [0.14, 0.34, 0.58, 0.8];
const SCAN = 0.09;

export default function Landing({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const api = useRef<ScrollCraftApi | null>(null);
  const audit = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [draft, setDraft] = useState("");

  useEffect(() => () => api.current?.destroy(), []);
  useEffect(() => track("landing_view", { lang }), [lang]);
  // The marketing layout renders lang="en"; correct it for screen readers and translation tools on /ms.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
      {t.proof(stats.audited, stats.confirmed, stats.refused)}
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
          <a href={t.other.href} hrefLang={t.other.href === "/" ? "en" : "ms"} title={t.other.name} className="bar__lang">{t.other.label}</a>
          <a href="#audit">{t.navHow}</a>
          <a href="/dashboard">{t.navOutcomes}</a>
          <a className="bar__cta" href={CTA_HREF} onClick={() => track("cta_click", { where: "bar" })}>{t.cta}</a>
        </nav>
      </header>

      <main id="top">
        {/* 1 · Recognition: the scroll pushes the camera in toward last night's card while the noise falls away. */}
        <section data-sc-act="scrub" data-sc-span="1.6" data-sc-dwell="0.3" data-sc-drift="#0b0f14" className="hero">
          <div data-sc-stage className="hero__stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sc-stage__poster hero__media hero__poster" src="/landing/hero-plate.jpg" alt="" />
            <video className="hero__media hero__clip" data-sc-scrub data-sc-src="/landing/hero-dolly.mp4" data-sc-src-mobile="/landing/hero-dolly-portrait.mp4" muted playsInline />
            <div className="hero__scrim" aria-hidden="true" />
            <HeroNetwork />
            <div className="hero__copy" data-sc-cue="0 0.7 0">
              <p className="eyebrow">{t.eyebrow}</p>
              <h1 className="hero__title">{t.title}</h1>
              <p className="hero__lede">{t.lede}</p>
              <div className="hero__actions">
                <a className="btn btn--accent" href={CTA_HREF} onClick={() => track("cta_click", { where: "hero" })}>{t.cta}</a>
                <a className="btn btn--ghost" href="#audit">{t.watch}</a>
              </div>
              {proof}
            </div>
            <div className="hero__chips" aria-hidden="true">
              <div className="chip chip--a" data-sc-parallax="0.22">
                <span className="stamp stamp--committed">{t.committed}</span>
                <q>We&apos;ve agreed internally to proceed</q>
              </div>
            </div>
          </div>
        </section>

        {/* 2 · Tension: the copy assembles while the frame holds. */}
        <section data-sc-act="pin" data-sc-span="2.2" data-sc-drift="#10151d" className="tension">
          <div data-sc-stage className="tension__stage">
            <p data-sc-cue="0.02 0.34 0.1">{t.tension[0]}</p>
            <p data-sc-cue="0.24 0.58">{t.tension[1]}</p>
            <p data-sc-cue="0.5 0.84">{t.tension[2]}</p>
            <p className="tension__turn" data-sc-cue="0.76">{t.tension[3]}</p>
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
              <h2>{t.auditHead}</h2>
            </div>
            <ol className="thread">
              {THREAD.map((m, i) => {
                const state = i < stamped ? "done" : i === scanning ? "scan" : p >= STAMP_AT[i] - SCAN - 0.06 ? "next" : "hidden";
                const v = { level: LEVELS[i], ...t.verdicts[i] };
                return (
                  <li key={i} className={`msg msg--${state} msg--${v.level} ${i < stamped - 1 ? "msg--past" : ""}`}>
                    <div className="msg__meta">
                      <span>{t.from[i]}</span>
                      <span className="msg__via">{t.via[i]}</span>
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
              <p className="ledger__label">{t.ledger}</p>
              <ol className={`funnel ${stamped === 3 ? "funnel--refused" : ""}`}>
                {t.stages.map((s, i) => (
                  <li key={s} className={i <= funnel ? "is-on" : ""}>
                    <span className="funnel__bar" />
                    <span className="funnel__name">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="ledger__status" aria-live="polite">
                {t.status[stamped]}
              </p>
            </aside>
          </div>
        </section>

        {/* 4 · Substance: the three levels, as a document. */}
        <section className="rules" data-sc-act="flow" data-sc-drift="#f2efe8">
          <div className="rules__wrap">
            <div className="rules__lead" data-sc-in>
              <h2>{t.rulesHead}</h2>
              <p>{t.rulesBody}</p>
            </div>
            <dl className="levels" data-sc-in data-sc-stagger="90">
              {t.levels.map((l) => (
                <div key={l.tag}>
                  <dt><span className={`stamp stamp--${l.kind}`}>{l.tag}</span></dt>
                  <dd><q>{l.quote}</q> {l.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 5 · Commitment: the page stops and responds. */}
        <section id="start" data-sc-act="pin" data-sc-span="1.1" data-sc-drift="#0b0f14" className="close">
          <div data-sc-stage className="close__stage" data-sc-spotlight>
            <div className="close__inner">
              <h2 data-sc-cue="0.04" data-sc-kinetic="lines">{t.closeHead}</h2>
              <p data-sc-cue="0.08">{t.closeBody}</p>
              <div className="close__actions">
                <a className="btn btn--accent btn--lg" href={CTA_HREF} onClick={() => track("cta_click", { where: "close" })} data-sc-magnet="0.26" data-sc-cue="0.04" data-sc-rise="0">
                  {t.cta}
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
                <label htmlFor="own-notes" className="own__label">{t.ownLabel}</label>
                <textarea
                  id="own-notes"
                  className="own__box"
                  rows={3}
                  maxLength={20000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.ownPlaceholder}
                />
                <button type="submit" className="btn btn--ghost own__go" disabled={draft.trim().length < 20}>
                  {t.ownGo}
                </button>
              </form>
              {proof}
            </div>
            <footer className="foot">
              <span>{t.foot}</span>
              <span>{t.powered}</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
