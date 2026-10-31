import type { Analysis, EvidenceFinding } from "./types";

// ── Demo inputs (fictional scenario) ────────────────────────────────────────

// Canonical copy: dataset/meeting-notes-my-sg.txt (Farhan's checklist quotes this text).
export const SAMPLE_NOTES_EN = `Isaac meets Naim about KitaKantin, his app for small local food vendors. An indication of interest from both sides. They exchange numbers and agree to follow up. No date confirmed.

Startup ASEAN networking event. Isaac runs KitaKantin. Naim is a potential partner. They talk about putting KitaKantin in front of Naim's food vendors. This is interest, not an agreement. No start date, no price, no signer.

Open points, all still open:
- Isaac will walk Naim's ops team through KitaKantin.
- Isaac will send a one-page pilot scope.
- Both sides will name an owner before any vendor goes live.

No date was confirmed. Follow up this week or this goes cold like the other handshakes.`;

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

export const SAMPLE_EVIDENCE_MEETING = `From: Naim
Thanks for walking our ops team through KitaKantin yesterday. We've agreed internally to proceed with the pilot, starting Monday.`;

export const SAMPLE_EVIDENCE_POC = `From: Naim
Quick update: the KitaKantin pilot is now live with the first vendors since Monday. The first stalls are taking orders on it.`;

export const SAMPLE_EVIDENCE_WEAK = `Heard from someone at the mixer that KitaKantin already signed with Naim. Should be a done deal!`;

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
      title: "KitaKantin partnership",
      ourSide: { name: "Isaac, KitaKantin", country: "Malaysia" },
      counterparty: { name: "Naim", country: "Malaysia" },
      contacts: [{ name: "Naim", organisation: "", role: "Potential partner" }],
      opportunity:
        "A possible partnership to bring KitaKantin to Naim's food vendors. Interest only. No date.",
      sector: "Food / Marketplace",
      corridor: "Malaysia",
      language: "English",
      keyTerms: [
        { label: "App", value: "KitaKantin" },
        { label: "Interest", value: "Both sides" },
        { label: "Date", value: "None confirmed" },
      ],
      commitments: [
        { claim: "They agree to follow up", quote: "agree to follow up" },
        { claim: "Isaac will walk the ops team through KitaKantin", quote: "Isaac will walk Naim's ops team through KitaKantin" },
        { claim: "Isaac will send a one-page pilot scope", quote: "Isaac will send a one-page pilot scope" },
      ],
      actions: [
        { title: "Set a date with Naim", detail: "The follow-up was agreed and no date was confirmed.", owner: "Isaac", dueText: "this week" },
        { title: "Walk Naim's ops team through KitaKantin", detail: "Do this before anyone calls it a pilot.", owner: "Isaac" },
        { title: "Send the one-page pilot scope", detail: "Name the first vendors and what done means.", owner: "Isaac" },
        { title: "Send the follow-up message", detail: "Review the draft below before sending.", owner: "Isaac", dueText: "this week" },
      ],
      followUp:
        "Hi Naim, good to meet you. We agreed to follow up on KitaKantin and no date was confirmed. Can we set a time for me to walk your ops team through the app?",
      initialLevel: "proposed",
      evidence: [
        { claim: "Interest from both sides", quote: "An indication of interest from both sides" },
        { claim: "Follow-up has no date", quote: "No date confirmed" },
        { claim: "They agree only to follow up", quote: "agree to follow up" },
      ],
      risks: ["No date confirmed", "Interest only, nothing signed"],
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
        { milestone: "meeting", level: "completed", quote: "walking our ops team through KitaKantin", rationale: "Naim confirms the walkthrough happened." },
        { milestone: "poc", level: "committed", quote: "We've agreed internally to proceed with the pilot, starting Monday", rationale: "Explicit agreement with a start date, but the pilot hasn't started." },
      ],
      summary: "Proves the meeting happened and the pilot is committed. Does not prove the pilot has launched.",
      confidence: 0.92,
    };
  }
  if (t === norm(SAMPLE_EVIDENCE_POC)) {
    return {
      findings: [
        { milestone: "poc", level: "completed", quote: "now live with the first vendors since Monday", rationale: "Naim confirms the pilot is running." },
      ],
      summary: "Proves the POC launched. No signed agreement yet.",
      confidence: 0.9,
    };
  }
  if (t === norm(SAMPLE_EVIDENCE_WEAK)) {
    return {
      findings: [
        { milestone: "partnership", level: "proposed", quote: "KitaKantin already signed with Naim", rationale: "Second-hand rumour from someone without authority." },
      ],
      summary: "Hearsay. Proves nothing; do not advance the deal.",
      confidence: 0.95,
    };
  }
  return null;
}
