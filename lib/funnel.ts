import { STAGES, type Opportunity, type Stage } from "./types";

export const stageIndex = (s: Stage) => STAGES.indexOf(s);

/** Cumulative funnel: a deal at "poc" also counts as having reached "meeting". Only confirmed stages count. */
export function funnel(opps: Opportunity[]) {
  const counts = STAGES.map((s) => opps.filter((o) => stageIndex(o.stage) >= stageIndex(s)).length);
  const intro = counts[0] || 0;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
  return {
    counts: Object.fromEntries(STAGES.map((s, i) => [s, counts[i]])) as Record<Stage, number>,
    stepRates: STAGES.slice(1).map((s, i) => ({ from: STAGES[i], to: s, rate: pct(counts[i + 1], counts[i]) })),
    introToMeeting: pct(counts[1], intro),
    introToPartnership: pct(counts[3], intro),
    // Signal of quality: committed-but-unconfirmed evidence waiting on humans.
    pendingEvidence: opps.reduce((n, o) => n + o.evidence.filter((e) => e.status === "pending").length, 0),
    committedNotDone: opps.filter((o) =>
      o.evidence.some((e) => e.status !== "rejected" && e.findings.some((f) => f.level === "committed" && stageIndex(f.milestone) > stageIndex(o.stage))),
    ).length,
  };
}
