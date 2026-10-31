import { stageIndex } from "./funnel";
import { STAGE_LABEL, type Opportunity } from "./types";

export interface NextMove {
  title: string;
  why: string;
  /** Section on the opportunity page the button jumps to. */
  target: "engine" | "followup" | "actions";
  cta: string;
}

const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });

/** The single most useful thing to do on this deal right now, with the reason. Rules only, no model call. */
export function nextMove(o: Opportunity, today = new Date()): NextMove {
  const todayIso = today.toISOString().slice(0, 10);
  const contact = o.analysis.contacts[0]?.name?.split(" ")[0];
  const pending = o.evidence.find((e) => e.status === "pending");
  if (pending)
    return { title: "Review the evidence waiting for you", why: pending.summary || "A reply was checked and needs your decision.", target: "engine", cta: "Review it" };

  const overdue = o.actions.filter((a) => !a.done && a.dueDate && a.dueDate < todayIso).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  if (overdue.length) {
    const a = overdue[0];
    const owner = (a.owner ?? "").toLowerCase();
    const theirs = owner.includes("counterparty") || (!!contact && owner.includes(contact.toLowerCase()));
    return theirs
      ? { title: `Chase ${contact ?? "them"}: ${a.title}`, why: `It was due ${fmt(a.dueDate!)} and nothing has arrived.`, target: "followup", cta: "Write the nudge" }
      : { title: `Do it now: ${a.title}`, why: `You said ${a.dueText ?? "you would"}, and it was due ${fmt(a.dueDate!)}.`, target: "actions", cta: "Open the actions" };
  }

  if (o.stage === "partnership") return { title: "Signed. Keep the proof with the deal", why: "The partnership is confirmed with evidence; attach the signed copy so it stays auditable.", target: "engine", cta: "Add the signed copy" };

  const promise = o.evidence
    .filter((e) => e.status !== "rejected")
    .flatMap((e) => e.findings)
    .find((f) => f.level === "committed" && stageIndex(f.milestone) > stageIndex(o.stage));
  if (promise)
    return { title: `Get proof that ${STAGE_LABEL[promise.milestone].toLowerCase()} happened`, why: `They committed: "${promise.quote}". Paste their update when it lands.`, target: "engine", cta: "Paste their update" };

  if (o.stage === "introduced" && !o.evidence.length)
    return { title: "Send the follow-up while it is warm", why: "Nothing is agreed yet. A specific follow-up turns interest into a meeting.", target: "followup", cta: "Review the follow-up" };

  return { title: "Paste their latest reply", why: `The deal is at ${STAGE_LABEL[o.stage]}. Only evidence moves it forward.`, target: "engine", cta: "Paste a reply" };
}
