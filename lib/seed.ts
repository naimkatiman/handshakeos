import type { Opportunity, Stage } from "./types";
import { STAGES } from "./types";
import rows from "../dataset/seed-partnerships.json";

// 19 illustrative deals from dataset/seed-partnerships.json.
// With the live demo deal added and advanced to "meeting",
// the funnel reads 20 → 8 → 3 → 1 (40% intro→meeting, 5% intro→partnership).
const ROWS = rows as [string, string, string, string, Stage][];

export function seedOpportunities(): Opportunity[] {
  const now = Date.now();
  return ROWS.map(([title, a, b, sector, stage], i) => {
    const [ours, theirs] = title.split(" × ");
    const created = new Date(now - (40 - i) * 86_400_000).toISOString();
    const reached = STAGES.slice(0, STAGES.indexOf(stage) + 1);
    return {
      id: `seed-${i}`,
      createdAt: created,
      updatedAt: created,
      sourceText: "",
      illustrative: true,
      engine: { mode: "demo", model: "seed" },
      analysis: {
        title,
        ourSide: { name: ours, country: a },
        counterparty: { name: theirs, country: b },
        contacts: [],
        opportunity: `${ours} and ${theirs} exploring a ${sector.toLowerCase()} collaboration.`,
        sector,
        corridor: a === b ? a : `${a} → ${b}`,
        keyTerms: [],
        commitments: [],
        actions: [],
        followUp: "",
        initialLevel: "proposed",
        evidence: [],
      },
      actions: [],
      followUp: "",
      stage,
      history: reached.map((s, k) => ({ stage: s, at: new Date(Date.parse(created) + k * 7 * 86_400_000).toISOString(), note: "Illustrative" })),
      evidence: [],
    };
  });
}
