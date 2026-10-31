"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * Full-screen view of a running analysis. While the model works, the visitor reads their own conversation with a
 * sweep across it and a real elapsed clock. When the result lands, the quotes the model cited light up in place.
 */
export default function AuditOverlay({
  text,
  preview,
  model,
  startedAt,
  found,
}: {
  text: string;
  preview?: string;
  model: string;
  startedAt: number;
  found: string[] | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  const reduce = useMemo(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  useEffect(() => {
    if (found) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [found]);

  const sentences = useMemo(() => text.match(/[^.!?\n]+[.!?]?\s*/g)?.filter((s) => s.trim()) ?? [text], [text]);
  const reading = reduce || found ? -1 : Math.floor((now - startedAt) / 1300) % Math.max(sentences.length, 1);
  const seconds = (now - startedAt) / 1000;

  // Mark every exact (case-insensitive) occurrence of a cited quote inside the source text.
  const marked = useMemo(() => {
    if (!found?.length) return null;
    const lower = text.toLowerCase();
    const ranges: [number, number][] = [];
    for (const q of found) {
      const i = lower.indexOf(q.toLowerCase().trim());
      if (i >= 0 && q.trim()) ranges.push([i, i + q.trim().length]);
    }
    ranges.sort((a, b) => a[0] - b[0]);
    const parts: { t: string; hit: boolean }[] = [];
    let at = 0;
    for (const [s, e] of ranges) {
      if (s < at) continue;
      parts.push({ t: text.slice(at, s), hit: false }, { t: text.slice(s, e), hit: true });
      at = e;
    }
    parts.push({ t: text.slice(at), hit: false });
    return { parts, hits: ranges.length };
  }, [found, text]);

  return (
    <div role="status" aria-live="polite" className="fixed left-0 top-0 z-50 grid h-[100dvh] w-full place-items-center bg-[#0b0f14]/95 p-4 text-[#f2efe8] backdrop-blur-sm">
      <div className="w-full max-w-3xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs text-white/60">
          <span>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${found ? "bg-[#4fd1ae]" : "animate-pulse bg-[#f0b14a]"}`} />
            {model}
          </span>
          <span className="tabular-nums">{seconds.toFixed(1)}s</span>
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          {found
            ? marked?.hits
              ? `${marked.hits} claim${marked.hits === 1 ? "" : "s"} found, every one quoted from your words.`
              : "Done. Building your action plan."
            : "Reading every word before it believes any of them."}
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto]">
          <p className="max-h-[50vh] overflow-auto whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.04] p-5 text-lg leading-relaxed text-white/75">
            {marked
              ? marked.parts.map((p, i) =>
                  p.hit ? (
                    <mark key={i} className="rounded bg-[#4fd1ae]/25 px-0.5 text-white shadow-[inset_0_-2px_0_#4fd1ae]">
                      {p.t}
                    </mark>
                  ) : (
                    <span key={i}>{p.t}</span>
                  ),
                )
              : sentences.map((s, i) => (
                  <span key={i} className={`transition-colors duration-500 ${i === reading ? "bg-white/10 text-white" : ""}`}>
                    {s}
                  </span>
                ))}
          </p>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Image being read" className="h-36 w-auto -rotate-2 self-start rounded-md object-contain shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]" />
          )}
        </div>

        <p className="mt-5 text-sm text-white/50">
          {found ? "Opening the plan." : "Open-weight Gemma 4 is extracting the deal. Any quote it cannot find in this text will be downgraded."}
        </p>
      </div>
    </div>
  );
}
