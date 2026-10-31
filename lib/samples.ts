import type { Analysis, EvidenceFinding } from "./types";

// ── Demo inputs (fictional scenario) ────────────────────────────────────────

export const SAMPLE_NOTES_EN = `Met Singapore logistics team. They're interested in testing our AI route optimizer. They have about 200 delivery vehicles. Suggested starting with a 14-day pilot using 10 vehicles. Sarah will send the operational requirements next Friday. Need to follow up.`;

export const SAMPLE_NOTES_MS = `Jumpa En. Hafiz dari Kedai Runcit Digital (Johor) masa sesi Startup ASEAN. Diorang ada 350 kedai runcit dalam rangkaian, nak cuba sistem e-invois kita sebab LHDN mandatory tahun depan. Hafiz cakap boleh mula dengan 20 kedai dulu, tapi kena present kat bos dia minggu depan. Dia minta deck + harga per kedai sebelum Isnin. Kena follow up cepat.`;

// Typed note that travels with the business card photo in public/samples/business-card.png.
export const SAMPLE_CARD_NOTE = "Met at Startup ASEAN mixer. Keen on a pilot, asked us to send a proposal by end of month.";
// Exactly what is printed on that card. Used as the canned image transcript so quotes stay grounded.
const SAMPLE_CARD_TEXT = `NUSANTARA AGRITECH
Smart irrigation for smallholder farms
Dewi Lestari
Head of Partnerships
dewi@nusantara-agri.example
+62 812 0000 1234
Bandung, Indonesia
Startup ASEAN 2026`;

export const SAMPLE_EVIDENCE_MEETING = `From: Sarah Tan (Head of Operations, LintasExpress SG)
Hi team, thanks for walking our ops leads through the route optimizer on yesterday's call — very useful session. We've agreed internally to proceed with the 14-day pilot on 10 vans, starting Monday. Ops requirements attached. Can you confirm onboarding by Friday?`;

export const SAMPLE_EVIDENCE_POC = `From: Sarah Tan (Head of Operations, LintasExpress SG)
Quick update: the 14-day pilot is now live on all 10 vans since Monday. Drivers are using the optimised routes daily and our dispatch team has signed off the setup. First weekly report shows fuel down 11%.`;

export const SAMPLE_EVIDENCE_WEAK = `Heard from someone at the mixer that LintasExpress might sign with us soon, they seemed really keen. Should be a done deal!`;

// ── Canned Gemma outputs for demo mode (no API key) ─────────────────────────

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

// Next occurrence of a weekday (0=Sun). "Next Friday" is ambiguous, which is why the UI marks it "to verify".
function nextWeekday(from: Date, weekday: number) {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Last day of the month `from` falls in, as YYYY-MM-DD ("end of month" in the card note).
function endOfMonth(from: Date) {
  return new Date(Date.UTC(from.getFullYear(), from.getMonth() + 1, 0)).toISOString().slice(0, 10);
}

export function cannedAnalysis(text: string, today: Date, hasImage = false): Analysis | null {
  if (hasImage) {
    if (norm(text) !== norm(SAMPLE_CARD_NOTE)) return null;
    return {
      title: "Nusantara Agritech Irrigation Pilot",
      ourSide: { name: "Our team", country: "Malaysia" },
      counterparty: { name: "Nusantara Agritech", country: "Indonesia" },
      contacts: [{ name: "Dewi Lestari", organisation: "Nusantara Agritech", role: "Head of Partnerships" }],
      opportunity: "A pilot with Nusantara Agritech, a Bandung smart-irrigation company for smallholder farms, starting from a proposal due by month end.",
      sector: "Agritech",
      corridor: "Malaysia → Indonesia",
      language: "English",
      keyTerms: [
        { label: "Ask", value: "Proposal" },
        { label: "Deadline", value: "End of month" },
        { label: "Their focus", value: "Smallholder irrigation" },
      ],
      commitments: [{ claim: "We owe Dewi a proposal", quote: "asked us to send a proposal by end of month" }],
      actions: [
        { title: "Send Dewi the pilot proposal", detail: "Scope, timeline and price for a small first pilot.", owner: "Our team", dueText: "end of month", dueDate: endOfMonth(today) },
        { title: "Confirm who signs off", detail: "Dewi leads partnerships; ask who approves a pilot budget.", owner: "Our team" },
        { title: "Send the follow-up message", detail: "Review the draft below before sending.", owner: "Our team", dueText: "within 24h" },
      ],
      followUp:
        "Hi Dewi, great meeting you at the Startup ASEAN mixer. Thanks for your interest in a pilot. We'll send a proposal before the end of the month. Is there anything about your smallholder irrigation setup we should design around?",
      initialLevel: "proposed",
      evidence: [
        { claim: "Interest in a pilot", quote: "Keen on a pilot" },
        { claim: "Contact leads partnerships", quote: "Head of Partnerships" },
        { claim: "Based in Bandung, Indonesia", quote: "Bandung, Indonesia" },
      ],
      risks: ["Interest only: nothing agreed beyond a proposal", "Budget owner unknown"],
      transcript: SAMPLE_CARD_TEXT,
    };
  }
  if (norm(text) === norm(SAMPLE_NOTES_EN)) {
    return {
      title: "Singapore Logistics Partnership",
      ourSide: { name: "Our team", country: "Malaysia" },
      counterparty: { name: "Singapore logistics company", country: "Singapore" },
      contacts: [{ name: "Sarah", organisation: "Singapore logistics company", role: "Operations contact" }],
      opportunity:
        "Pilot our AI route optimizer on a Singapore delivery fleet of ~200 vehicles to cut route cost and time.",
      sector: "Logistics / AI",
      corridor: "Malaysia → Singapore",
      language: "English",
      keyTerms: [
        { label: "Potential pilot", value: "14 days" },
        { label: "Initial vehicles", value: "10" },
        { label: "Fleet size", value: "~200" },
      ],
      commitments: [{ claim: "Sarah will send operational requirements", quote: "Sarah will send the operational requirements next Friday" }],
      actions: [
        { title: "Confirm Sarah's operational requirements", detail: "Chase if not received by the deadline.", owner: "Sarah (counterparty)", dueText: "next Friday", dueDate: nextWeekday(today, 5) },
        { title: "Prepare a pilot proposal", detail: "Scope 10 vehicles × 14 days, name owners on both sides, define success criteria (km saved, on-time %).", owner: "Our team" },
        { title: "Send the follow-up message", detail: "Review the draft below before sending.", owner: "Our team", dueText: "within 24h" },
        { title: "Agree pilot success metrics", detail: "Baseline current route cost so the pilot result is measurable.", owner: "Both sides" },
      ],
      followUp:
        "Hi Sarah, great meeting you at Startup ASEAN. Following our discussion, we'd love to explore the 14-day route optimization pilot with 10 vehicles. Could you share your operational requirements so we can prepare a proposal?",
      initialLevel: "proposed",
      evidence: [
        { claim: "Counterparty is interested in a trial", quote: "They're interested in testing our AI route optimizer" },
        { claim: "Fleet of ~200 vehicles", quote: "They have about 200 delivery vehicles" },
        { claim: "Pilot is only suggested, not agreed", quote: "Suggested starting with a 14-day pilot using 10 vehicles" },
      ],
      risks: ["Pilot is only suggested — no named decision-maker yet", "Company name not captured; confirm legal entity"],
    };
  }
  if (norm(text) === norm(SAMPLE_NOTES_MS)) {
    return {
      title: "Johor Retail e-Invoicing Rollout",
      ourSide: { name: "Our team", country: "Malaysia" },
      counterparty: { name: "Kedai Runcit Digital", country: "Malaysia" },
      contacts: [{ name: "En. Hafiz", organisation: "Kedai Runcit Digital", role: "Contact (needs boss approval)" }],
      opportunity: "Roll out our e-invoicing system across a 350-store retail network ahead of mandatory LHDN e-invoicing.",
      sector: "Retail / Fintech",
      corridor: "Malaysia (Johor)",
      language: "Bahasa Melayu (informal)",
      keyTerms: [
        { label: "Network size", value: "350 stores" },
        { label: "Proposed start", value: "20 stores" },
        { label: "Driver", value: "LHDN e-invoice mandate" },
      ],
      commitments: [{ claim: "Hafiz will present to his boss", quote: "kena present kat bos dia minggu depan" }],
      actions: [
        { title: "Send deck and per-store pricing", detail: "Hafiz needs it for his internal pitch.", owner: "Our team", dueText: "sebelum Isnin", dueDate: nextWeekday(today, 1) },
        { title: "Arm Hafiz for the boss meeting", detail: "One-page summary: LHDN deadline, cost per store, 20-store pilot plan.", owner: "Our team" },
        { title: "Ask for a slot with the decision-maker", detail: "Hafiz is the champion, not the signer.", owner: "Our team", dueText: "minggu depan" },
      ],
      followUp:
        "Salam En. Hafiz, seronok jumpa di Startup ASEAN tadi. Seperti yang dibincang, saya akan hantar deck dan harga per kedai sebelum Isnin untuk pembentangan kepada bos En. Hafiz. Kalau sesuai, kami boleh mula dengan 20 kedai dulu. Ada apa-apa lagi yang En. Hafiz perlukan?",
      initialLevel: "proposed",
      evidence: [
        { claim: "350-store network", quote: "Diorang ada 350 kedai runcit dalam rangkaian" },
        { claim: "Could start with 20 stores", quote: "boleh mula dengan 20 kedai dulu" },
        { claim: "Needs boss approval", quote: "kena present kat bos dia minggu depan" },
      ],
      risks: ["Contact is not the decision-maker", "Tight turnaround: materials due before Monday"],
    };
  }
  return null;
}

export function cannedVerify(text: string): { findings: EvidenceFinding[]; summary: string; confidence: number } | null {
  const t = norm(text);
  if (t === norm(SAMPLE_EVIDENCE_MEETING)) {
    return {
      findings: [
        { milestone: "meeting", level: "completed", quote: "thanks for walking our ops leads through the route optimizer on yesterday's call", rationale: "Counterparty confirms a working session took place." },
        { milestone: "poc", level: "committed", quote: "We've agreed internally to proceed with the 14-day pilot on 10 vans, starting Monday", rationale: "Explicit agreement with scope and start date, but the pilot hasn't started." },
      ],
      summary: "Proves the meeting happened and the pilot is committed. Does not prove the pilot has launched.",
      confidence: 0.92,
    };
  }
  if (t === norm(SAMPLE_EVIDENCE_POC)) {
    return {
      findings: [
        { milestone: "poc", level: "completed", quote: "the 14-day pilot is now live on all 10 vans since Monday", rationale: "Head of Operations confirms the pilot is running." },
        { milestone: "partnership", level: "proposed", quote: "First weekly report shows fuel down 11%", rationale: "Positive results, but no contract discussed yet." },
      ],
      summary: "Proves the POC launched. No signed agreement yet.",
      confidence: 0.9,
    };
  }
  if (t === norm(SAMPLE_EVIDENCE_WEAK)) {
    return {
      findings: [
        { milestone: "partnership", level: "proposed", quote: "might sign with us soon, they seemed really keen", rationale: "Second-hand rumour in future tense from someone without authority." },
      ],
      summary: "Hearsay. Proves nothing; do not advance the deal.",
      confidence: 0.95,
    };
  }
  return null;
}
