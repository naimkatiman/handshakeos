// WhatsApp "Export chat" (.txt, without media) to plain conversation text.
// Android: "31/10/2026, 21:04 - Sarah Tan: message"   iOS: "[31/10/2026, 9:04:12 PM] Sarah Tan: message"
const LINE =
  /^‎?\[?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?(?:\s?[APap]\.?\s?[Mm]\.?)?)\]?\s*(?:-\s*)?([^:\n]{1,60}):\s?([\s\S]*)$/;
const NOISE = /^(?:<Media omitted>|<attached:.*>|image omitted|video omitted|audio omitted|sticker omitted|GIF omitted|document omitted|This message was deleted|You deleted this message|Null|Missed (?:voice|video) call)$/i;

export interface ParsedChat {
  text: string;
  messages: number;
  people: string[];
  truncated: boolean;
}

/** Returns null when the file does not look like a WhatsApp export. Keeps the most recent messages within `limit` chars. */
export function parseWhatsApp(raw: string, limit = 18_000): ParsedChat | null {
  const msgs: { date: string; name: string; body: string }[] = [];
  for (const line of raw.replace(/\r\n?/g, "\n").split("\n")) {
    const m = line.match(LINE);
    if (m) msgs.push({ date: m[1], name: m[3].trim(), body: m[4].trim() });
    else if (msgs.length && line.trim()) msgs[msgs.length - 1].body += "\n" + line.trim(); // continuation of a multi-line message
  }
  const kept = msgs.filter((x) => x.body && !NOISE.test(x.body.replace(/‎/g, "").trim()));
  if (kept.length < 2) return null;

  const out: string[] = [];
  let size = 0;
  for (let i = kept.length - 1; i >= 0; i--) {
    const row = `${kept[i].date} ${kept[i].name}: ${kept[i].body}`;
    if (size + row.length + 1 > limit) break;
    out.unshift(row);
    size += row.length + 1;
  }
  return {
    text: out.join("\n"),
    messages: out.length,
    people: [...new Set(kept.slice(kept.length - out.length).map((x) => x.name))],
    truncated: out.length < kept.length,
  };
}
