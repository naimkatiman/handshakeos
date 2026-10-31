"use client";
import Link from "next/link";
import { useState } from "react";
import { stageIndex } from "@/lib/funnel";
import { STAGE_LABEL, type Opportunity } from "@/lib/types";

type Item =
  | { kind: "promise"; quote: string; milestone: string }
  | { kind: "due"; title: string; dueDate: string; dueText?: string; theirs: boolean; overdue: boolean };

const DAY = 86_400_000;
const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });

/** What is owed on each deal this week: promises not yet delivered, and actions due within 7 days or overdue. */
function chase(opps: Opportunity[], today = new Date()) {
  const horizon = new Date(today.getTime() + 7 * DAY).toISOString().slice(0, 10);
  const todayIso = today.toISOString().slice(0, 10);
  return opps
    .filter((o) => !o.illustrative)
    .map((o) => {
      const contact = o.analysis.contacts[0]?.name;
      const items: Item[] = [];
      for (const e of o.evidence.filter((e) => e.status !== "rejected"))
        for (const f of e.findings)
          if (f.level === "committed" && stageIndex(f.milestone) > stageIndex(o.stage))
            items.push({ kind: "promise", quote: f.quote, milestone: STAGE_LABEL[f.milestone] });
      for (const a of o.actions)
        if (!a.done && a.dueDate && a.dueDate <= horizon) {
          const owner = (a.owner ?? "").toLowerCase();
          const theirs = owner.includes("counterparty") || (!!contact && owner.includes(contact.toLowerCase()));
          items.push({ kind: "due", title: a.title, dueDate: a.dueDate, dueText: a.dueText, theirs, overdue: a.dueDate < todayIso });
        }
      const first = items.map((i) => (i.kind === "due" ? i.dueDate : "9999")).sort()[0] ?? "9999";
      return { o, contact, items, first };
    })
    .filter((x) => x.items.length)
    .sort((a, b) => a.first.localeCompare(b.first));
}

function nudge(name: string | undefined, item: Item) {
  const hi = `Hi ${name?.split(" ")[0] ?? "there"},`;
  if (item.kind === "promise") return `${hi} following up on what we agreed: "${item.quote}". Anything you need from us to get it moving?`;
  return `${hi} a quick check-in on the next step we agreed: ${item.title}${item.dueText ? `, ${item.dueText}` : ""}. Anything you need from us?`;
}

export default function ChaseList({ opps }: { opps: Opportunity[] }) {
  const rows = chase(opps);
  const [copied, setCopied] = useState<string | null>(null);

  if (!rows.length)
    return (
      <p className="text-sm text-muted">
        Nothing owed this week. When you capture a deal, its promises and deadlines land here.{" "}
        <Link href="/capture" className="font-medium text-accent underline">Capture one</Link>
      </p>
    );

  return (
    <ul className="divide-y divide-line">
      {rows.map(({ o, contact, items }) => (
        <li key={o.id} className="py-3 first:pt-0 last:pb-0">
          <Link href={`/opportunity/${o.id}`} className="font-semibold hover:text-accent">{o.analysis.title}</Link>
          <span className="ml-2 text-xs text-muted">{contact ?? o.analysis.counterparty.name}</span>
          <ul className="mt-2 space-y-2">
            {items.map((it, i) => {
              const key = `${o.id}-${i}`;
              const text = nudge(contact, it);
              const askThem = it.kind === "promise" || it.theirs;
              return (
                <li key={key} className="flex flex-wrap items-start gap-x-3 gap-y-1.5 text-sm">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      it.kind === "due" && it.overdue ? "border-danger/30 bg-danger-soft text-danger" : it.kind === "promise" ? "border-amber/30 bg-amber-soft text-amber" : "border-line bg-paper text-muted"
                    }`}
                  >
                    {it.kind === "promise" ? "Promised" : it.overdue ? `Overdue · ${fmt(it.dueDate)}` : fmt(it.dueDate)}
                  </span>
                  <span className="min-w-0 flex-1">
                    {it.kind === "promise" ? <q className="italic">{it.quote}</q> : it.title}
                    <span className="ml-2 text-xs text-muted">{askThem ? "They owe this" : "Your move"}</span>
                  </span>
                  {askThem && (
                    <span className="flex shrink-0 gap-1.5">
                      <button
                        className="rounded-md border border-line px-2 py-1 text-xs font-medium hover:border-ink/40"
                        onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(key))}
                      >
                        {copied === key ? "Copied" : "Copy nudge"}
                      </button>
                      <a
                        className="rounded-md border border-line px-2 py-1 text-xs font-medium hover:border-ink/40"
                        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
