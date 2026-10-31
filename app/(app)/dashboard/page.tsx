"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ChaseList from "@/components/ChaseList";
import CorridorMap, { HUBS, parseCorridor, type Corridor } from "@/components/CorridorMap";
import { Card, btn } from "@/components/ui";
import { Visual } from "@/components/Visual";
import { funnel, stageIndex } from "@/lib/funnel";
import { store, useOpportunities } from "@/lib/store";
import { track } from "@/lib/track";
import { STAGES, STAGE_LABEL, type Opportunity } from "@/lib/types";

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(opps: Opportunity[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["title", "corridor", "sector", "stage", "created", "illustrative", "evidence_confirmed"];
  const rows = opps.map((o) =>
    [o.analysis.title, o.analysis.corridor ?? "", o.analysis.sector ?? "", o.stage, o.createdAt.slice(0, 10), String(!!o.illustrative), String(o.evidence.filter((e) => e.status === "confirmed").length)].map(esc).join(","),
  );
  return [head.join(","), ...rows].join("\n");
}

export default function Dashboard() {
  const all = useOpportunities();
  const [mounted, setMounted] = useState(false);
  // null = automatic: show the illustrative deals only until the visitor has captured one of their own.
  const [seedChoice, setSeedChoice] = useState<boolean | null>(null);
  const realCount = all.filter((o) => !o.illustrative).length;
  const includeSeed = seedChoice ?? realCount === 0;
  // A country ("Malaysia") or an exact corridor ("Malaysia → Singapore"); matches by substring of the corridor.
  const [filter, setFilter] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
    track("dashboard_view");
  }, []);

  const opps = useMemo(() => (includeSeed ? all : all.filter((o) => !o.illustrative)), [all, includeSeed]);
  const f = funnel(opps);
  const max = Math.max(1, f.counts.introduced);
  const hasSeed = all.some((o) => o.illustrative);

  const corridors = useMemo(() => {
    const m = new Map<string, { n: number; meet: number; part: number }>();
    for (const o of opps) {
      const k = o.analysis.corridor || "Unspecified";
      const r = m.get(k) ?? { n: 0, meet: 0, part: 0 };
      r.n++;
      if (stageIndex(o.stage) >= 1) r.meet++;
      if (stageIndex(o.stage) >= 3) r.part++;
      m.set(k, r);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  }, [opps]);

  const mapCorridors = useMemo(() => {
    const m = new Map<string, Corridor>();
    for (const o of opps) {
      const pair = parseCorridor(o.analysis.corridor);
      if (!pair) continue;
      const k = pair.join("|");
      const c = m.get(k) ?? { from: pair[0], to: pair[1], n: 0, maxStage: 0, moved: 0 };
      const i = stageIndex(o.stage);
      m.set(k, { ...c, n: c.n + 1, maxStage: Math.max(c.maxStage, i), moved: c.moved + (i >= 1 ? 1 : 0) });
    }
    return [...m.values()];
  }, [opps]);

  const shown = filter ? opps.filter((o) => (o.analysis.corridor ?? "").includes(filter)) : opps;

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="visual-heading">
          <Visual name="outcomes" size={84} />
          <div>
          <p className="print-only font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
            HandshakeOS ecosystem report · {new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ASEAN Partnership Funnel</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Only evidence-backed, human-confirmed milestones count. Drafts, proposed pilots and hearsay don&apos;t.
          </p>
          <p className="mt-2 text-sm font-medium">
            {realCount === 0 ? (
              <>
                You are looking at illustrative ASEAN deals.{" "}
                <Link href="/capture" className="text-accent underline">Run one of your own</Link> and this funnel switches to yours.
              </>
            ) : includeSeed ? (
              <>Your {realCount} deal{realCount === 1 ? "" : "s"} plus the illustrative set.</>
            ) : (
              <>Your {realCount} deal{realCount === 1 ? "" : "s"} only.</>
            )}
          </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className={`${btn.ghost} no-print`} onClick={() => window.print()}>
            Print report
          </button>
        {hasSeed && (
          <label className="no-print flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeSeed} onChange={(e) => setSeedChoice(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
            Include illustrative deals
          </label>
        )}
        </div>
      </div>

      <Card icon="calendar" title="Chase this week" right={<span className="text-xs text-muted">Promises and deadlines from your deals</span>}>
        <ChaseList opps={all} />
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAGES.map((s, i) => (
            <div key={s}>
              <Visual name={(["conversation", "network", "launch", "partnership"] as const)[i]} size={60} className="visual-stage" />
              <div className="text-xs font-medium text-muted">{STAGE_LABEL[s]}</div>
              <div className="num mt-1 text-4xl font-semibold">{f.counts[s]}</div>
              <div className="mt-2 h-2 rounded-full bg-paper">
                <div className="h-2 rounded-full bg-accent transition-all duration-700" style={{ width: `${(f.counts[s] / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4">
          <Metric label="Intro → Meeting" value={`${f.introToMeeting}%`} strong />
          <Metric label="Intro → Partnership" value={`${f.introToPartnership}%`} strong />
          <Metric label="Committed, not yet delivered" value={String(f.committedNotDone)} hint="Deals with a promise outstanding" />
          <Metric label="Evidence awaiting review" value={String(f.pendingEvidence)} hint="Needs a human decision" />
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          {f.stepRates.map((r) => (
            <span key={r.to} className="num">
              {STAGE_LABEL[r.from]} → {STAGE_LABEL[r.to]}: {r.rate}%
            </span>
          ))}
        </div>
      </Card>

      <Card
        icon="network"
        className="no-print"
        title="Where deals actually move"
        right={filter ? <button className="text-xs font-medium text-accent underline" onClick={() => setFilter(null)}>Clear filter: {filter}</button> : <span className="text-xs text-muted">Pick a country to filter</span>}
      >
        <CorridorMap corridors={mapCorridors} selected={filter && HUBS[filter] ? filter : null} onSelect={setFilter} />
        <p className="mt-3 text-xs text-muted">
          Each arc is coloured by the furthest stage a deal on it has reached with confirmed evidence. Particles flow only where a deal moved past Introduced. Rings are deals inside one country.
        </p>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title={filter ? `Opportunities · ${filter}` : "Opportunities"} right={<span className="num text-xs text-muted">{shown.length}</span>}>
          {shown.length === 0 && <Visual name="archive" size={112} className="visual-empty-art" />}
          <ul className="divide-y divide-line">
            {[...shown]
              .sort((a, b) => stageIndex(b.stage) - stageIndex(a.stage) || b.updatedAt.localeCompare(a.updatedAt))
              .map((o) => (
                <li key={o.id}>
                  <Link href={`/opportunity/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-paper/60">
                    <div className="flex w-16 shrink-0 gap-0.5">
                      {STAGES.map((s, i) => (
                        <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= stageIndex(o.stage) ? "bg-accent" : "bg-line"}`} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {o.analysis.title}
                        {o.illustrative ? (
                          <span className="ml-2 rounded bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-muted">ILLUSTRATIVE</span>
                        ) : (
                          <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">YOURS</span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted">{o.analysis.corridor}</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{STAGE_LABEL[o.stage]}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card icon="compass" title="By corridor">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Corridor</th>
                  <th className="pb-2 text-right font-medium">Intros</th>
                  <th className="pb-2 text-right font-medium">→ Meeting</th>
                </tr>
              </thead>
              <tbody className="num">
                {corridors.map(([k, r]) => (
                  <tr key={k} className={`border-t border-line ${filter === k ? "bg-accent-soft" : ""}`}>
                    <td className="py-1.5 font-sans">
                      <button className="text-left hover:text-accent hover:underline" aria-pressed={filter === k} onClick={() => setFilter(filter === k ? null : k)}>{k}</button>
                    </td>
                    <td className="py-1.5 text-right">{r.n}</td>
                    <td className="py-1.5 text-right">{Math.round((r.meet / r.n) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card icon="archive" className="no-print" title="Data">
            <div className="flex flex-wrap gap-2">
              <button className={btn.ghost} onClick={() => download("handshakeos.csv", toCSV(opps), "text/csv")}>Export CSV</button>
              <button className={btn.ghost} onClick={() => download("handshakeos.json", JSON.stringify(all, null, 2), "application/json")}>Export JSON</button>
              <button className={btn.ghost} onClick={() => confirm("Reset to illustrative demo data? Your captured deals will be removed.") && store.reset(true)}>Reset demo</button>
              <button className={btn.ghost} onClick={() => confirm("Remove everything, including illustrative data?") && store.reset(false)}>Start empty</button>
            </div>
            <p className="mt-3 text-xs text-muted">Stored in this browser. Connect Supabase to aggregate across the Startup ASEAN ecosystem.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={`num mt-0.5 font-semibold ${strong ? "text-2xl text-accent" : "text-xl"}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted">{hint}</div>}
    </div>
  );
}
