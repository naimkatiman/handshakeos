import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

// Rendered from docs/versions.md at build time, so the page can never drift from the real release log.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "HandshakeOS · Every version, and why",
  description: "Each HandshakeOS release: what changed, why it mattered, and how it was verified.",
};

type Row = { v: string; change: string; why: string };

function rows(): Row[] {
  const md = readFileSync(join(process.cwd(), "docs", "versions.md"), "utf8");
  return md
    .split(/\r?\n/)
    .filter((l) => /^\|\s*v\d+/.test(l))
    .map((l) => {
      const [v, change, why] = l.replace(/^\||\|\s*$/g, "").split(" | ").map((c) => c.trim());
      return { v, change: change ?? "", why: why ?? "" };
    })
    .reverse();
}

/** Inline `code` from the markdown; everything else stays plain text. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded bg-paper px-1 py-0.5 font-mono text-[0.85em] text-accent">
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function Versions() {
  const all = rows();
  // Split "Judge: ..." out of the change text so the verification reads as its own line.
  const split = (s: string) => {
    const i = s.search(/\bJudge( \([^)]*\))?:/);
    return i < 0 ? { what: s, judge: "" } : { what: s.slice(0, i).trim(), judge: s.slice(i).replace(/^Judge( \([^)]*\))?:\s*/, "") };
  };
  return (
    <div className="space-y-8 pt-4">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">Built in public, one release at a time</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{all.length} releases, each one live.</h1>
        <p className="mt-3 text-muted">
          Each version shipped one change to the live site and the reason it mattered. {all.filter((r) => r.change.includes("Judge")).length} of them record
          the check that proved it worked. Newest first.
        </p>
      </div>
      <ol className="relative space-y-4 border-l border-line pl-6">
        {all.map((r) => {
          const { what, judge } = split(r.change);
          return (
            <li key={r.v + r.change.slice(0, 20)} className="relative rounded-xl border border-line bg-card p-4 sm:p-5">
              <span className="absolute -left-[31px] top-5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-sm font-semibold text-accent">{r.v}</span>
                {r.why && <span className="text-sm text-muted"><Inline text={r.why} /></span>}
              </div>
              <p className="mt-2 leading-relaxed"><Inline text={what} /></p>
              {judge && (
                <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm text-muted">
                  <span className="mr-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">Verified</span>
                  <Inline text={judge} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
