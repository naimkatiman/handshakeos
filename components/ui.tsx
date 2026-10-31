import { STAGES, STAGE_LABEL, type EngineInfo, type EvidenceLevel, type Stage } from "@/lib/types";

export function Card({ title, right, children, className = "" }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-card p-4 sm:p-5 ${className}`}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

const LEVEL_STYLE: Record<EvidenceLevel, string> = {
  proposed: "bg-line/60 text-muted border-line",
  committed: "bg-amber-soft text-amber border-amber/30",
  completed: "bg-accent-soft text-accent border-accent/30",
};

export function LevelBadge({ level }: { level: EvidenceLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${LEVEL_STYLE[level]}`}>
      {level}
    </span>
  );
}

export function StageTrack({ stage, pending }: { stage: Stage; pending?: Stage }) {
  const idx = STAGES.indexOf(stage);
  return (
    <ol className="grid grid-cols-4 gap-1.5">
      {STAGES.map((s, i) => {
        const done = i <= idx;
        const next = pending === s;
        return (
          <li key={s}>
            <div className={`h-1.5 rounded-full ${done ? "bg-accent" : next ? "bg-amber" : "bg-line"}`} />
            <div className={`mt-1.5 text-[11px] font-medium leading-tight sm:text-xs ${done ? "text-ink" : "text-muted"}`}>
              {STAGE_LABEL[s]}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EngineTag({ engine }: { engine: EngineInfo }) {
  const label =
    engine.mode === "live"
      ? `${engine.model} via ${engine.via ?? "OpenRouter"}${engine.ms ? ` · ${(engine.ms / 1000).toFixed(1)}s` : ""}`
      : engine.mode === "fallback"
        ? "Offline fallback (sample)"
        : "Demo output (no API key)";
  return <span className="text-xs text-muted">Analysed by {label}</span>;
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40",
  accent:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition hover:border-ink/30 disabled:opacity-40",
  chip: "rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/40",
};
