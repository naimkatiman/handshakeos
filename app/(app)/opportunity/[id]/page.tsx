"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Card, EngineTag, LevelBadge, Spinner, StageTrack, btn } from "@/components/ui";
import { fileToImageInput } from "@/lib/image";
import { stageIndex } from "@/lib/funnel";
import { SAMPLE_EVIDENCE_MEETING, SAMPLE_EVIDENCE_POC, SAMPLE_EVIDENCE_WEAK } from "@/lib/samples";
import { store, uid, useOpportunity } from "@/lib/store";
import { track } from "@/lib/track";
import { STAGES, STAGE_LABEL, type EngineInfo, type EvidenceFinding, type EvidenceRecord, type Opportunity, type Stage } from "@/lib/types";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" }) : "";

/** Highest milestone above the current stage that the evidence proves as completed. */
function proposedAdvance(o: Opportunity, findings: EvidenceFinding[]): Stage | undefined {
  const done = findings.filter((f) => f.level === "completed" && f.grounded !== false && stageIndex(f.milestone) > stageIndex(o.stage));
  if (!done.length) return undefined;
  return done.sort((a, b) => stageIndex(b.milestone) - stageIndex(a.milestone))[0].milestone;
}

/** Sends evidence to the engine and stores the result as the one pending record. */
async function verifyEvidence(opp: Opportunity, text: string, image?: { data: string; mimeType: string } | null) {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      image: image ? { data: image.data, mimeType: image.mimeType } : undefined,
      context: { title: opp.analysis.title, opportunity: opp.analysis.opportunity, stage: STAGE_LABEL[opp.stage] },
    }),
  });
  const json = (await res.json()) as { findings: EvidenceFinding[]; summary: string; confidence: number; engine: EngineInfo; error?: string };
  if (!res.ok) throw new Error(json.error || "Verification failed");
  const rec: EvidenceRecord = {
    id: uid(),
    createdAt: new Date().toISOString(),
    sourceText: text,
    hadImage: !!image,
    findings: json.findings,
    summary: json.summary,
    confidence: json.confidence,
    status: "pending",
  };
  store.update(opp.id, (o) => ({ ...o, evidence: [rec, ...o.evidence.filter((e) => e.status !== "pending")] }));
  return rec;
}

/** A human accepts or rejects pending evidence. Only accepted, completed, grounded evidence moves the stage. */
function decideEvidence(opp: Opportunity, rec: EvidenceRecord, accept: boolean) {
  const target = accept ? proposedAdvance(opp, rec.findings) : undefined;
  const now = new Date().toISOString();
  store.update(opp.id, (o) => {
    const history = [...o.history];
    if (target) {
      // A launched POC implies a meeting happened: fill skipped stages, marked as implied.
      for (let i = stageIndex(o.stage) + 1; i <= stageIndex(target); i++) {
        const s = STAGES[i];
        history.push({ stage: s, at: now, evidenceId: rec.id, note: s === target ? "Confirmed with evidence" : "Implied by later evidence" });
      }
    }
    return {
      ...o,
      stage: target ?? o.stage,
      history,
      evidence: o.evidence.map((e) => (e.id === rec.id ? { ...e, status: accept ? "confirmed" : "rejected", advancedTo: target } : e)),
    };
  });
}

export default function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const opp = useOpportunity(id);
  const [mounted, setMounted] = useState(false);
  const [guide, setGuide] = useState(false);
  useEffect(() => {
    setMounted(true);
    setGuide(new URLSearchParams(window.location.search).get("guide") === "1");
  }, []);

  if (!mounted) return null;
  if (!opp)
    return (
      <div className="py-20 text-center text-muted">
        Opportunity not found. <Link href="/capture" className="text-accent underline">Capture one</Link>
      </div>
    );

  const a = opp.analysis;
  const pendingRecord = opp.evidence.find((e) => e.status === "pending");
  const pendingStage = pendingRecord ? proposedAdvance(opp, pendingRecord.findings) : undefined;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/capture" className="text-sm text-muted hover:text-ink">← Capture</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{a.title}</h1>
          <p className="mt-1 text-muted">
            {[a.corridor, a.sector].filter(Boolean).join(" · ")}
            {opp.illustrative && <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-xs">Illustrative</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {opp.stage === "introduced" && <LevelBadge level={a.initialLevel} />}
          <EngineTag engine={opp.engine} />
        </div>
      </div>

      {guide && <ProveIt opp={opp} onClose={() => setGuide(false)} />}

      <Card>
        <StageTrack stage={opp.stage} pending={pendingStage} />
        {opp.stage === "introduced" && a.initialLevel !== "completed" && (
          <p className="mt-3 text-sm text-muted">
            This deal is <strong className="text-ink">{a.initialLevel}</strong>, not confirmed. It only advances on evidence you confirm below.
          </p>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <Card title="Opportunity">
            <p className="text-[15px] leading-relaxed">{a.opportunity}</p>
            {a.keyTerms.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {a.keyTerms.map((k) => (
                  <div key={k.label} className="rounded-lg bg-paper px-3 py-2.5">
                    <div className="text-xs text-muted">{k.label}</div>
                    <div className="num mt-0.5 text-lg font-semibold">{k.value}</div>
                  </div>
                ))}
              </div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Us</dt>
              <dd>{[a.ourSide.name, a.ourSide.country].filter(Boolean).join(", ")}</dd>
              <dt className="text-muted">Counterparty</dt>
              <dd>{[a.counterparty.name, a.counterparty.country].filter(Boolean).join(", ")}</dd>
              {a.contacts.map((c) => (
                <div key={c.name} className="contents">
                  <dt className="text-muted">Contact</dt>
                  <dd>{c.name}{c.role ? <span className="text-muted"> · {c.role}</span> : null}</dd>
                </div>
              ))}
              {a.language && (
                <>
                  <dt className="text-muted">Language</dt>
                  <dd>{a.language}</dd>
                </>
              )}
            </dl>
          </Card>

          {opp.actions.length > 0 && (
            <Card title="Next actions" right={<span className="num text-xs text-muted">{opp.actions.filter((x) => x.done).length}/{opp.actions.length}</span>}>
              <ul className="divide-y divide-line">
                {opp.actions.map((act) => (
                  <li key={act.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() =>
                        store.update(opp.id, (o) => ({ ...o, actions: o.actions.map((x) => (x.id === act.id ? { ...x, done: !x.done } : x)) }))
                      }
                      className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                      aria-label={act.title}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium ${act.done ? "text-muted line-through" : ""}`}>{act.title}</div>
                      {act.detail && <div className="text-sm text-muted">{act.detail}</div>}
                      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                        {act.owner && <span>Owner: {act.owner}</span>}
                        {(act.dueText || act.dueDate) && (
                          <span className="text-amber">
                            Due: {act.dueText}
                            {act.dueDate && ` → ${fmtDate(act.dueDate)} (verify)`}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(a.evidence.length > 0 || a.commitments.length > 0) && (
            <Card title="Source evidence" right={<span className="text-xs text-muted">Every claim, quoted</span>}>
              <ul className="space-y-3">
                {[...a.commitments.map((c) => ({ ...c, tag: "Commitment" })), ...a.evidence.map((c) => ({ ...c, tag: "" }))].map((c, i) => (
                  <li key={i} className="text-sm">
                    <div className="font-medium">
                      {c.tag && <span className="mr-1.5 text-xs font-semibold text-amber">{c.tag}</span>}
                      {c.claim}
                    </div>
                    <blockquote className="mt-1 border-l-2 border-line pl-3 italic text-muted">“{c.quote}”</blockquote>
                    {c.grounded === false && (
                      <div className="mt-1 text-xs font-medium text-danger">⚠ Quote not found in source — treat as unverified</div>
                    )}
                  </li>
                ))}
              </ul>
              {!!a.risks?.length && (
                <div className="mt-4 rounded-lg bg-amber-soft p-3 text-sm">
                  <div className="mb-1 font-semibold text-amber">What could stall this</div>
                  <ul className="list-disc space-y-0.5 pl-5">{a.risks.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {opp.followUp !== "" || !opp.illustrative ? <FollowUp opp={opp} /> : null}
          <EvidenceEngine opp={opp} />
          <History opp={opp} />
          <button
            className="text-sm text-muted underline hover:text-danger"
            onClick={() => {
              if (confirm("Delete this opportunity?")) {
                store.remove(opp.id);
                router.push("/capture");
              }
            }}
          >
            Delete opportunity
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowUp({ opp }: { opp: Opportunity }) {
  const [copied, setCopied] = useState(false);
  const msg = opp.followUp;
  return (
    <Card title="Follow-up message" right={<span className="text-xs text-muted">Review before sending</span>}>
      <textarea
        value={msg}
        onChange={(e) => store.update(opp.id, (o) => ({ ...o, followUp: e.target.value }))}
        className="h-36 w-full resize-y rounded-lg border border-line bg-paper/50 p-3 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={btn.primary}
          onClick={async () => {
            await navigator.clipboard.writeText(msg);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied ✓" : "Copy follow-up"}
        </button>
        <a className={btn.ghost} href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className={btn.ghost} href={`mailto:?subject=${encodeURIComponent(opp.analysis.title)}&body=${encodeURIComponent(msg)}`}>
          Email
        </a>
      </div>
      <p className="mt-2 text-xs text-muted">HandshakeOS never sends anything on its own. You stay in control.</p>
    </Card>
  );
}

function EvidenceEngine({ opp }: { opp: Opportunity }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = opp.evidence.find((e) => e.status === "pending");

  async function verify() {
    setBusy(true);
    setError("");
    try {
      await verifyEvidence(opp, text, image);
      setText("");
      setImage(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const decide = (rec: EvidenceRecord, accept: boolean) => decideEvidence(opp, rec, accept);

  return (
    <Card title="Outcome Evidence Engine" right={<span className="text-xs text-muted">Prove progress</span>}>
      {pending ? (
        <PendingReview opp={opp} rec={pending} onDecide={decide} />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            Paste a reply, email or upload a screenshot / signed document. Gemma classifies it as proposed, committed or completed.
            Only completed + your confirmation moves the deal.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={async (e) => {
              const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
              if (f) {
                e.preventDefault();
                setImage(await fileToImageInput(f));
              }
            }}
            placeholder="e.g. Sarah's reply confirming the pilot…"
            className="h-28 w-full resize-y rounded-lg border border-line bg-paper/50 p-3 text-sm leading-relaxed outline-none focus:border-accent"
          />
          {image && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.preview} alt="" className="h-10 w-10 rounded object-cover" /> Image attached
              <button className="underline" onClick={() => setImage(null)}>remove</button>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button className={btn.chip} onClick={() => setText(SAMPLE_EVIDENCE_MEETING)}>Sample: meeting + pilot agreed</button>
            <button className={btn.chip} onClick={() => setText(SAMPLE_EVIDENCE_POC)}>Sample: pilot live</button>
            <button className={btn.chip} onClick={() => setText(SAMPLE_EVIDENCE_WEAK)}>Sample: hearsay</button>
          </div>
          <div className="mt-3 flex gap-2">
            <button className={btn.ghost} onClick={() => fileRef.current?.click()}>Attach image</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setImage(await fileToImageInput(e.target.files[0]))} />
            <button className={`${btn.accent} flex-1`} disabled={busy || (!text.trim() && !image)} onClick={verify}>
              {busy && <Spinner />} {busy ? "Verifying…" : "Verify evidence"}
            </button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </>
      )}
    </Card>
  );
}

function PendingReview({ opp, rec, onDecide }: { opp: Opportunity; rec: EvidenceRecord; onDecide: (r: EvidenceRecord, accept: boolean) => void }) {
  const target = proposedAdvance(opp, rec.findings);
  return (
    <div>
      <p className="text-sm font-medium">{rec.summary}</p>
      <p className="num mt-1 text-xs text-muted">Confidence {Math.round(rec.confidence * 100)}%</p>
      <ul className="mt-3 space-y-2.5">
        {rec.findings.length === 0 && <li className="text-sm text-muted">No milestone evidence found.</li>}
        {rec.findings.map((f, i) => (
          <li key={i} className="rounded-lg border border-line p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{STAGE_LABEL[f.milestone]}</span>
              <LevelBadge level={f.level} />
            </div>
            <blockquote className="mt-1.5 border-l-2 border-line pl-3 italic text-muted">“{f.quote}”</blockquote>
            <div className="mt-1 text-xs text-muted">{f.rationale}</div>
            {f.grounded === false && <div className="mt-1 text-xs font-medium text-danger">⚠ Quote not found in evidence — cannot count as completed</div>}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg bg-paper p-3 text-sm">
        {target ? (
          <>
            Evidence proves <strong>{STAGE_LABEL[target]}</strong>. Confirm to advance this deal and update conversion metrics.
          </>
        ) : (
          <>
            Nothing here proves a new milestone. The deal stays at <strong>{STAGE_LABEL[opp.stage]}</strong>.
          </>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button className={`${btn.accent} flex-1`} onClick={() => onDecide(rec, true)}>
          {target ? `Confirm → ${STAGE_LABEL[target]}` : "Log evidence"}
        </button>
        <button className={btn.ghost} onClick={() => onDecide(rec, false)}>Reject</button>
      </div>
    </div>
  );
}

function History({ opp }: { opp: Opportunity }) {
  const items = [
    ...opp.history.map((h) => ({ at: h.at, text: STAGE_LABEL[h.stage], sub: h.note, kind: "stage" as const })),
    ...opp.evidence
      .filter((e) => e.status !== "pending")
      .map((e) => ({ at: e.createdAt, text: e.status === "rejected" ? "Evidence rejected" : "Evidence logged", sub: e.summary, kind: "ev" as const })),
  ].sort((x, y) => y.at.localeCompare(x.at));
  return (
    <Card title="Audit trail">
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${it.kind === "stage" ? "bg-accent" : "bg-line"}`} />
            <div>
              <div className="font-medium">{it.text}</div>
              {it.sub && <div className="text-xs text-muted">{it.sub}</div>}
              <div className="num text-[11px] text-muted">{new Date(it.at).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** First-run guide from the landing page: verify a real reply, confirm it, then try to fool the engine with hearsay. */
function ProveIt({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trickId, setTrickId] = useState<string | null>(null);
  const pending = opp.evidence.find((e) => e.status === "pending");
  const target = pending ? proposedAdvance(opp, pending.findings) : undefined;
  const trick = trickId ? opp.evidence.find((e) => e.id === trickId) : undefined;
  const advanced = opp.stage !== "introduced";

  async function send(text: string, isTrick = false) {
    setBusy(true);
    setError("");
    try {
      const rec = await verifyEvidence(opp, text);
      if (isTrick) setTrickId(rec.id);
      else track("guide_verify");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const step = !advanced ? (pending ? 2 : 1) : !trick ? 3 : trick.status === "pending" ? 4 : 5;
  useEffect(() => {
    if (step === 5) track("guide_done");
  }, [step]);
  const quote = (t: string) => <blockquote className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white/80">{t}</blockquote>;
  const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#4fd1ae] px-4 py-2.5 text-sm font-semibold text-[#06231c] transition hover:brightness-110 disabled:opacity-50";

  return (
    <section aria-live="polite" className="relative overflow-hidden rounded-xl border border-[#4fd1ae]/25 bg-[#0f1d22] p-5 text-[#f2efe8] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <ol className="flex gap-1.5" aria-label={`Step ${Math.min(step, 4)} of 4`}>
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className={`h-1.5 w-8 rounded-full ${n < step || step === 5 ? "bg-[#4fd1ae]" : n === step ? "bg-white/60" : "bg-white/15"}`} />
          ))}
        </ol>
        <button onClick={onClose} className="text-xs text-white/50 hover:text-white">Skip the guide</button>
      </div>

      {step === 1 && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Sarah just replied. Does it prove anything?</h2>
          {quote(SAMPLE_EVIDENCE_POC)}
          <button className={`${primary} mt-4`} disabled={busy} onClick={() => send(SAMPLE_EVIDENCE_POC)}>
            {busy && <Spinner />} {busy ? "Checking every claim…" : "Verify Sarah's reply"}
          </button>
        </div>
      )}

      {step === 2 && pending && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {target ? <>Completed evidence. The quote is in her words.</> : <>Nothing here proves a new step.</>}
          </h2>
          <ul className="mt-3 space-y-2">
            {pending.findings.map((f, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${f.level === "completed" ? "text-[#4fd1ae]" : f.level === "committed" ? "text-[#f0b14a]" : "text-white/50"}`}>{f.level}</span>
                <span className="font-semibold">{STAGE_LABEL[f.milestone]}</span>
                <q className="text-white/70">{f.quote}</q>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-white/60">The model never moves a deal. You do.</p>
          <button
            className={`${primary} mt-4`}
            onClick={() => {
              decideEvidence(opp, pending, true);
              track("guide_confirm");
            }}
          >
            {target ? `Confirm: ${STAGE_LABEL[target]}` : "Log it"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Verified: {STAGE_LABEL[opp.stage]}. Now try to fool it.</h2>
          <p className="mt-2 text-sm text-white/60">Every pipeline is full of this. Send it and watch what the engine does.</p>
          {quote(SAMPLE_EVIDENCE_WEAK)}
          <button className={`${primary} mt-4 !bg-[#ff7a6b] !text-[#2a0d09]`} disabled={busy} onClick={() => send(SAMPLE_EVIDENCE_WEAK, true)}>
            {busy && <Spinner />} {busy ? "Checking…" : "Send the rumour"}
          </button>
        </div>
      )}

      {step === 4 && trick && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-[#ff7a6b] sm:text-2xl">Caught. A rumour does not move the deal.</h2>
          <p className="mt-2 text-sm text-white/70">{trick.summary}</p>
          <p className="mt-1 text-sm text-white/60">The deal stays at {STAGE_LABEL[opp.stage]}.</p>
          <button className={`${primary} mt-4`} onClick={() => decideEvidence(opp, trick, false)}>Reject it</button>
        </div>
      )}

      {step === 5 && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">That is a pipeline you can trust.</h2>
          <p className="mt-2 text-sm text-white/60">One verified step, one rumour refused, every decision in the audit trail below.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/capture" className={primary}>Capture your own conversation</Link>
            <Link href="/dashboard" className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold hover:border-white/50">See the outcomes funnel</Link>
          </div>
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-[#ff7a6b]/15 px-3 py-2 text-sm text-[#ff7a6b]">{error}</p>}
    </section>
  );
}
