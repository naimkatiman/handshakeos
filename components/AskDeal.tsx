"use client";
import { useState } from "react";
import { Card, Spinner, btn } from "@/components/ui";
import type { Opportunity } from "@/lib/types";

const SUGGESTED = ["What has each side promised to do?", "Who has to sign off?", "What is the next deadline?"];

type Reply = { answer: string; quotes: { quote: string; grounded: boolean }[]; grounded: boolean; engine?: { model: string; ms: number } };

/** Ask a question about this deal. Answers come only from its own conversation and evidence, quoted and checked. */
export default function AskDeal({ opp }: { opp: Opportunity }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<Reply | null>(null);
  const [error, setError] = useState("");
  const source = [opp.sourceText, ...opp.evidence.map((e) => e.sourceText)].filter(Boolean).join("\n\n");

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setQ(question);
    setBusy(true);
    setError("");
    setReply(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, source, title: opp.analysis.title }),
      });
      const json = (await res.json()) as Reply & { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not answer that");
      setReply(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!source.trim()) return null;
  return (
    <Card icon="search" className="no-print" title="Ask this deal" right={<span className="text-xs text-muted">Answers only from what was said</span>}>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={300}
          placeholder="e.g. Did they agree to a start date?"
          aria-label="Question about this deal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper/50 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <button className={btn.accent} disabled={busy || !q.trim()}>
          {busy ? <Spinner /> : "Ask"}
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTED.map((s) => (
          <button key={s} type="button" className={btn.chip} disabled={busy} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      {reply && (
        <div className="mt-4 rounded-lg border border-line bg-paper/40 p-3" aria-live="polite">
          <p className={`text-sm font-medium ${reply.grounded ? "" : "text-muted"}`}>{reply.answer}</p>
          {reply.quotes.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {reply.quotes.map((x, i) => (
                <li key={i} className="text-sm">
                  <blockquote className={`border-l-2 pl-3 italic ${x.grounded ? "border-accent text-ink/80" : "border-danger text-muted line-through"}`}>
                    “{x.quote}”
                  </blockquote>
                  {!x.grounded && <span className="text-xs font-medium text-danger">Not found in the source, so not used</span>}
                </li>
              ))}
            </ul>
          )}
          {reply.engine && <p className="mt-2 font-mono text-[11px] text-muted">{reply.engine.model} · {(reply.engine.ms / 1000).toFixed(1)}s</p>}
        </div>
      )}
      {error && <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
