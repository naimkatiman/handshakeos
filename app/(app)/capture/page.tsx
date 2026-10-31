"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Card, LevelBadge, Spinner, btn } from "@/components/ui";
import { fileToImageInput } from "@/lib/image";
import { SAMPLE_NOTES_EN, SAMPLE_NOTES_MS } from "@/lib/samples";
import { store, uid, useOpportunities } from "@/lib/store";
import { STAGE_LABEL, type Analysis, type EngineInfo, type Opportunity } from "@/lib/types";

type Img = { data: string; mimeType: string; preview: string } | null;

const STEPS = ["Reading the conversation", "Extracting parties, terms and commitments", "Checking every claim against the source", "Drafting next actions and follow-up"];

export default function CapturePage() {
  const router = useRouter();
  const all = useOpportunities();
  const mine = all.filter((o) => !o.illustrative).slice(0, 6);
  const [text, setText] = useState("");
  const [image, setImage] = useState<Img>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    setText("Met at Startup ASEAN mixer. Keen on a pilot, asked us to send a proposal by end of month.");
    pickFile(blob);
  }

  // Deep link from the landing page: /capture?sample=en|ms|card&run=1 preloads a sample and, with run=1, analyses it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sample = q.get("sample");
    if (sample === "card") return void loadCard();
    const notes = sample === "ms" ? SAMPLE_NOTES_MS : sample === "en" ? SAMPLE_NOTES_EN : "";
    if (!notes) return;
    setText(notes);
    if (q.get("run") === "1") analyse(notes, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function analyse(input = text, img: Img = image) {
    setBusy(true);
    setError("");
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400);
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
      router.push(`/opportunity/${opp.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl pt-4">
        <p className="text-sm font-medium text-accent">Startup ASEAN · Outcome Conversion</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Stop collecting contacts.
          <br />
          Start closing opportunities.
        </h1>
        <p className="mt-3 text-muted">
          Drop in meeting notes, a chat export or a business card. Gemma 4 extracts the deal, the commitments and the next
          steps, and every claim is checked against what was actually said.
        </p>
      </div>

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
          <span className="mr-1 text-xs text-muted">Try:</span>
          <button className={btn.chip} onClick={() => { setText(SAMPLE_NOTES_EN); setImage(null); }}>
            MY → SG logistics (EN)
          </button>
          <button className={btn.chip} onClick={() => { setText(SAMPLE_NOTES_MS); setImage(null); }}>
            Johor retail (Bahasa Melayu)
          </button>
          <button className={btn.chip} onClick={loadCard}>
            Business card (image)
          </button>
          <button className={`${btn.accent} ml-auto`} disabled={busy || (!text.trim() && !image)} onClick={() => analyse()}>
            {busy ? <Spinner /> : null}
            {busy ? "Analysing…" : "Analyse with Gemma"}
          </button>
        </div>

        {busy && (
          <ol className="mt-4 space-y-1 text-sm">
            {STEPS.map((s, i) => (
              <li key={s} className={i <= step ? "text-ink" : "text-muted/50"}>
                {i < step ? "✓" : i === step ? "→" : "·"} {s}
              </li>
            ))}
          </ol>
        )}
        {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      </Card>

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
