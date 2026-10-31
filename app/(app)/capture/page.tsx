"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuditOverlay from "@/components/AuditOverlay";
import { Visual, type VisualName } from "@/components/Visual";
import { Card, LevelBadge, Spinner, btn } from "@/components/ui";
import { fileToImageInput } from "@/lib/image";
import { SAMPLE_CARD_NOTE, SAMPLE_NOTES_EN, SAMPLE_NOTES_MS } from "@/lib/samples";
import { store, uid, useOpportunities } from "@/lib/store";
import { track } from "@/lib/track";
import { parseWhatsApp } from "@/lib/whatsapp";
import { STAGE_LABEL, type Analysis, type EngineInfo, type Opportunity } from "@/lib/types";

type Img = { data: string; mimeType: string; preview: string } | null;


export default function CapturePage() {
  const router = useRouter();
  const all = useOpportunities();
  const mine = all.filter((o) => !o.illustrative).slice(0, 6);
  const [text, setText] = useState("");
  const [image, setImage] = useState<Img>(null);
  const [busy, setBusy] = useState(false);
  // The running analysis shown full screen, and the quotes the model cited once it answers.
  const [job, setJob] = useState<{ text: string; preview?: string; startedAt: number } | null>(null);
  const [found, setFound] = useState<string[] | null>(null);
  const [model, setModel] = useState("Gemma 4");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState("");

  // A WhatsApp "Export chat" .txt becomes clean conversation text; anything else is pasted as-is.
  async function importChat(f?: File | null) {
    if (!f) return;
    setError("");
    if (f.size > 5_000_000) return setError("That file is over 5 MB. Export the chat without media and try again.");
    const raw = await f.text();
    const chat = parseWhatsApp(raw);
    if (!chat) {
      setText(raw.slice(0, 20_000));
      setImported(`Imported ${f.name} as plain text.`);
      return;
    }
    setText(chat.text);
    setImported(
      `Imported ${chat.messages} WhatsApp messages from ${chat.people.join(", ")}${chat.truncated ? " (the most recent ones that fit)" : ""}.`,
    );
  }
  // null until /api/status answers. Without a key only the built-in samples can be analysed.
  const [live, setLive] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s: { live: boolean; model?: string }) => {
        setLive(s.live);
        if (s.model) setModel(s.model);
      })
      .catch(() => setLive(null));
  }, []);

  // One click from a sample to a finished plan. Only the English deal has the guided Prove-it follow-up.
  async function runSample(kind: "en" | "ms" | "card") {
    track("sample_run", { kind });
    if (kind === "card") {
      const img = await fileToImageInput(await fetch("/samples/business-card.png").then((r) => r.blob()));
      setText(SAMPLE_CARD_NOTE);
      setImage(img);
      return analyse(SAMPLE_CARD_NOTE, img);
    }
    const notes = kind === "en" ? SAMPLE_NOTES_EN : SAMPLE_NOTES_MS;
    setText(notes);
    setImage(null);
    return analyse(notes, null, kind === "en");
  }

  async function pickFile(f?: File | Blob | null) {
    if (!f) return;
    setError("");
    try {
      setImage(await fileToImageInput(f));
    } catch {
      setError("Couldn't read that image. Try a JPG or PNG.");
    }
  }

  async function loadCard() {
    const blob = await fetch("/samples/business-card.png").then((r) => r.blob());
    setText(SAMPLE_CARD_NOTE);
    pickFile(blob);
  }

  useEffect(() => track("capture_view"), []);

  // Deep link from the landing page: /capture?sample=en|ms|card&run=1 preloads a sample and, with run=1, analyses it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // Own notes handed over from the landing page through sessionStorage, never the URL.
    if (q.get("draft") === "1") {
      let notes = "";
      try {
        notes = sessionStorage.getItem("hs:draft") ?? "";
        sessionStorage.removeItem("hs:draft");
      } catch {}
      if (notes) {
        setText(notes);
        if (q.get("run") === "1") {
          track("own_analyse", { from: "landing" });
          analyse(notes, null);
        }
      }
      return;
    }
    const sample = q.get("sample");
    if (sample === "card") return void loadCard();
    const notes = sample === "ms" ? SAMPLE_NOTES_MS : sample === "en" ? SAMPLE_NOTES_EN : "";
    if (!notes) return;
    setText(notes);
    if (q.get("run") === "1") analyse(notes, null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function analyse(input = text, img: Img = image, guided = false) {
    setBusy(true);
    setError("");
    setFound(null);
    setJob({ text: input, preview: img?.preview, startedAt: Date.now() });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, image: img ? { data: img.data, mimeType: img.mimeType } : undefined }),
      });
      const json = (await res.json()) as { analysis?: Analysis; engine?: EngineInfo; error?: string };
      if (!res.ok || !json.analysis) throw new Error(json.error || "Analysis failed");
      const a = json.analysis;
      const now = new Date().toISOString();
      const opp: Opportunity = {
        id: uid(),
        createdAt: now,
        updatedAt: now,
        sourceText: [input, a.transcript ? `[Image text]\n${a.transcript}` : ""].filter(Boolean).join("\n\n"),
        analysis: a,
        actions: a.actions.map((x) => ({ ...x, id: uid(), done: false })),
        followUp: a.followUp,
        stage: "introduced",
        history: [{ stage: "introduced", at: now, note: "Captured from conversation" }],
        evidence: [],
        engine: json.engine!,
      };
      store.add(opp);
      track("plan_created", { mode: opp.engine.mode, guided });
      // Let the visitor see their own words being cited before the plan opens.
      setFound([...a.evidence, ...a.commitments].map((c) => c.quote).filter(Boolean));
      await new Promise((r) => setTimeout(r, matchMedia("(prefers-reduced-motion: reduce)").matches ? 700 : 1600));
      router.push(`/opportunity/${opp.id}${guided ? "?guide=1" : ""}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      setJob(null);
    }
  }

  return (
    <div className="space-y-8">
      {job && <AuditOverlay text={job.text} preview={job.preview} model={model} startedAt={job.startedAt} found={found} />}
      <div className="visual-intro">
      <div className="max-w-2xl pt-4">
        <p className="text-sm font-medium text-accent">Startup ASEAN · Outcome Conversion</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Run a real conversation.</h1>
        <p className="mt-3 text-muted">
          Pick one of these, the way they actually arrive after an event. Gemma 4 extracts the deal, the commitments and the next
          steps, and every claim is checked against what was actually said.
        </p>
      </div>

      <Visual name="proof" size={225} className="visual-intro__art" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SampleTile icon="capture" disabled={busy} onClick={() => runSample("en")} label="Meeting notes · English" tag="Guided walkthrough">
          <p className="line-clamp-5 font-mono text-[12.5px] leading-relaxed text-ink/80">{SAMPLE_NOTES_EN}</p>
        </SampleTile>
        <SampleTile icon="conversation" disabled={busy} onClick={() => runSample("ms")} label="WhatsApp note · Bahasa Melayu" tag="Johor retail">
          <span className="block rounded-lg rounded-tl-none bg-[#dcf8c6] px-3 py-2 shadow-sm">
            <span className="line-clamp-5 text-[13px] leading-relaxed text-[#1f2c22]">{SAMPLE_NOTES_MS}</span>
          </span>
        </SampleTile>
        <SampleTile icon="network" disabled={busy} onClick={() => runSample("card")} label="Business card · photo" tag="Image input">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/samples/business-card.png" alt="Sample business card" className="mx-auto h-28 -rotate-2 rounded-md object-contain shadow-[0_12px_24px_-12px_rgba(0,0,0,0.45)]" />
        </SampleTile>
      </div>

      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted">Or paste your own</h2>
        {live === false && (
          <p className="mb-3 rounded-lg border border-amber/30 bg-amber-soft px-3 py-2 text-sm text-amber">
            This demo has no OpenRouter key, so it can only analyse the three conversations above. Your own notes work once
            HandshakeOS has a key for open-weight Gemma 4.
          </p>
        )}
      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold">
              Conversation
            </label>
            <textarea
              id="notes"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const f = e.dataTransfer.files[0];
                if (!f) return;
                e.preventDefault();
                if (f.type.startsWith("image/")) pickFile(f);
                else importChat(f);
              }}
              onPaste={(e) => {
                const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
                if (f) {
                  e.preventDefault();
                  pickFile(f);
                }
              }}
              placeholder="Paste meeting notes, WhatsApp messages, or an email thread. Any ASEAN language works. You can also paste a screenshot."
              className="h-48 w-full resize-y rounded-lg border border-line bg-paper/50 p-3 text-[15px] leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold">Image (optional)</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files[0]);
              }}
              className="relative grid h-48 w-full place-items-center overflow-hidden rounded-lg border border-dashed border-line bg-paper/50 text-center text-sm text-muted transition hover:border-accent"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.preview} alt="Uploaded" className="h-full w-full object-contain" />
              ) : (
                <span className="px-4">
                  <Visual name="capture" size={72} className="mb-2" />
                  <br />
                  Business card, screenshot or handwritten notes
                  <br />
                  <span className="text-xs">Click or drop</span>
                </span>
              )}
            </button>
            {image && (
              <button onClick={() => setImage(null)} className="mt-1 text-xs text-muted underline">
                Remove image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className={btn.ghost} onClick={() => chatRef.current?.click()}>
            Import WhatsApp chat (.txt)
          </button>
          <input ref={chatRef} type="file" accept=".txt,text/plain" hidden onChange={(e) => importChat(e.target.files?.[0])} />
          {imported && <span className="text-xs text-muted">{imported}</span>}
          <button className={`${btn.accent} ml-auto`} disabled={busy || (!text.trim() && !image)} onClick={() => {
            track("own_analyse");
            analyse();
          }}>
            {busy ? <Spinner /> : null}
            {busy ? "Analysing…" : live === false ? "Analyse (samples only)" : "Analyse with Gemma"}
          </button>
        </div>

        {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      </Card>
      </div>

      {mine.length > 0 && (
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted">Your opportunities</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((o) => (
              <Link key={o.id} href={`/opportunity/${o.id}`} className="rounded-xl border border-line bg-card p-4 transition hover:border-ink/30">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold leading-snug">{o.analysis.title}</span>
                  {o.stage === "introduced" && <LevelBadge level={o.analysis.initialLevel} />}
                </div>
                <div className="mt-1 text-sm text-muted">{o.analysis.corridor || o.analysis.counterparty.name}</div>
                <div className="mt-3 text-xs font-medium text-accent">{STAGE_LABEL[o.stage]}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SampleTile({ icon, label, tag, onClick, disabled, children }: { icon: VisualName; label: string; tag: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col rounded-xl border border-line bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_40px_-24px_rgba(15,110,92,0.55)] disabled:opacity-50"
    >
      <Visual name={icon} size={64} className="visual-sample" />
      <span className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{tag}</span>
      </span>
      <span className="flex min-h-28 flex-1 items-center">{children}</span>
      <span className="mt-4 text-sm font-semibold text-accent">Run this deal <span className="inline-block transition group-hover:translate-x-1">→</span></span>
    </button>
  );
}
