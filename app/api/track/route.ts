import { getCloudflareContext } from "@opennextjs/cloudflare";
import { EVENTS, type EventName } from "@/lib/track";

type Statement = { bind: (...v: unknown[]) => { run: () => Promise<unknown> } };
type DB = { prepare: (sql: string) => Statement };

// Anonymous funnel events into D1. Unknown names and oversized payloads are dropped, never stored.
export async function POST(req: Request) {
  let body: { name?: string; sid?: string; path?: string; meta?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { name, sid, path, meta } = body;
  if (!name || !EVENTS.includes(name as EventName) || typeof sid !== "string" || !/^[a-z0-9]{8,32}$/.test(sid)) {
    return new Response(null, { status: 400 });
  }
  const metaText = meta === undefined ? null : JSON.stringify(meta);
  if (metaText && metaText.length > 300) return new Response(null, { status: 413 });

  let db: DB | undefined;
  try {
    db = (getCloudflareContext().env as { DB?: DB }).DB;
  } catch {
    db = undefined; // `next dev`: no Cloudflare context
  }
  if (!db) return new Response(null, { status: 204 });
  try {
    await db
      .prepare("INSERT INTO events (name, sid, path, meta) VALUES (?, ?, ?, ?)")
      .bind(name, sid, typeof path === "string" ? path.slice(0, 120) : null, metaText)
      .run();
  } catch (e) {
    console.error("track insert failed", (e as Error).message);
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204 });
}
