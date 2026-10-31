// Funnel stages. An opportunity only moves forward on human-confirmed, completed evidence.
export const STAGES = ["introduced", "meeting", "poc", "partnership"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  introduced: "Introduced",
  meeting: "Meeting held",
  poc: "POC launched",
  partnership: "Partnership signed",
};

// Outcome Evidence Engine levels.
export type EvidenceLevel = "proposed" | "committed" | "completed";

export interface Party {
  name: string;
  country?: string;
}

export interface Contact {
  name: string;
  organisation?: string;
  role?: string;
}

export interface Action {
  id: string;
  title: string;
  detail?: string;
  owner?: string;
  dueText?: string; // exactly as said in the source ("next Friday")
  dueDate?: string; // ISO date Gemma resolved, always shown as "to verify"
  done: boolean;
}

export interface SourceClaim {
  claim: string;
  quote: string; // verbatim snippet from the source
  grounded?: boolean; // true if the quote was found in the source text
}

/** Raw shape Gemma returns from /api/analyze. */
export interface Analysis {
  title: string;
  ourSide: Party;
  counterparty: Party;
  contacts: Contact[];
  opportunity: string;
  sector?: string;
  corridor?: string; // e.g. "Malaysia → Singapore"
  language?: string;
  keyTerms: { label: string; value: string }[];
  commitments: SourceClaim[];
  actions: Omit<Action, "id" | "done">[];
  followUp: string;
  initialLevel: EvidenceLevel;
  evidence: SourceClaim[];
  risks?: string[];
  transcript?: string;
}

export interface EvidenceFinding {
  milestone: Stage;
  level: EvidenceLevel;
  quote: string;
  rationale: string;
  grounded?: boolean;
}

export interface EvidenceRecord {
  id: string;
  createdAt: string;
  sourceText: string;
  hadImage: boolean;
  findings: EvidenceFinding[];
  summary: string;
  confidence: number; // 0..1
  status: "pending" | "confirmed" | "rejected";
  advancedTo?: Stage;
}

export interface Opportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceText: string;
  analysis: Analysis;
  actions: Action[];
  followUp: string;
  stage: Stage;
  history: { stage: Stage; at: string; evidenceId?: string; note?: string }[];
  evidence: EvidenceRecord[];
  illustrative?: boolean; // seeded demo data
  engine: EngineInfo;
}

export interface EngineInfo {
  mode: "live" | "demo" | "fallback";
  model: string;
  via?: "OpenRouter" | "Gemini";
  ms?: number;
}
