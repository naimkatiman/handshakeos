import type { Analysis, EvidenceFinding, EvidenceLevel, Stage } from "./types";
import { isGrounded } from "./gemma";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
const str = (x: unknown) => (typeof x === "string" ? x.trim() : "");
const LEVELS: EvidenceLevel[] = ["proposed", "committed", "completed"];
const MILESTONES: Stage[] = ["meeting", "poc", "partnership"];

/** Coerce model output into a safe Analysis and mark which quotes are grounded in the source. */
export function normalizeAnalysis(raw: Partial<Analysis>, source: string): Analysis {
  const ground = source + "\n" + str(raw.transcript);
  const claims = (x: unknown) =>
    arr<{ claim?: string; quote?: string }>(x)
      .filter((c) => str(c?.quote))
      .map((c) => ({ claim: str(c.claim), quote: str(c.quote), grounded: isGrounded(str(c.quote), ground) }));
  const level = LEVELS.includes(raw.initialLevel as EvidenceLevel) ? (raw.initialLevel as EvidenceLevel) : "proposed";
  return {
    title: str(raw.title) || "Untitled opportunity",
    ourSide: { name: str(raw.ourSide?.name) || "Our team", country: str(raw.ourSide?.country) },
    counterparty: { name: str(raw.counterparty?.name) || "Unknown counterparty", country: str(raw.counterparty?.country) },
    contacts: arr<{ name?: string; organisation?: string; role?: string }>(raw.contacts)
      .filter((c) => str(c?.name))
      .map((c) => ({ name: str(c.name), organisation: str(c.organisation), role: str(c.role) })),
    opportunity: str(raw.opportunity),
    sector: str(raw.sector),
    corridor: str(raw.corridor),
    language: str(raw.language),
    keyTerms: arr<{ label?: string; value?: string }>(raw.keyTerms)
      .filter((k) => str(k?.label) && str(k?.value))
      .map((k) => ({ label: str(k.label), value: str(k.value) }))
      .slice(0, 6),
    commitments: claims(raw.commitments),
    actions: arr<Record<string, unknown>>(raw.actions)
      .filter((a) => str(a?.title))
      .slice(0, 6)
      .map((a) => ({
        title: str(a.title),
        detail: str(a.detail),
        owner: str(a.owner),
        dueText: str(a.dueText),
        dueDate: /^\d{4}-\d{2}-\d{2}$/.test(str(a.dueDate)) ? str(a.dueDate) : "",
      })),
    followUp: str(raw.followUp),
    // Never let the model claim more than the evidence it quoted supports.
    initialLevel: level,
    evidence: claims(raw.evidence),
    risks: arr<string>(raw.risks).map(str).filter(Boolean).slice(0, 4),
    transcript: str(raw.transcript),
  };
}

export function normalizeFindings(raw: unknown, source: string): EvidenceFinding[] {
  return arr<Record<string, unknown>>(raw)
    .filter((f) => MILESTONES.includes(f?.milestone as Stage) && LEVELS.includes(f?.level as EvidenceLevel))
    .map((f) => {
      const quote = str(f.quote);
      const grounded = isGrounded(quote, source);
      let level = f.level as EvidenceLevel;
      // An ungrounded quote can never prove completion.
      if (!grounded && level === "completed") level = "committed";
      return { milestone: f.milestone as Stage, level, quote, rationale: str(f.rationale), grounded };
    });
}
