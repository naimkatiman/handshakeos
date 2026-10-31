import { getCloudflareContext } from "@opennextjs/cloudflare";

type DB = { prepare: (sql: string) => { first: <T>() => Promise<T | null> } };

// Public, aggregate-only counters from the anonymous funnel events. No per-visitor data leaves the database.
export async function GET() {
  let db: DB | undefined;
  try {
    db = (getCloudflareContext().env as { DB?: DB }).DB;
  } catch {
    db = undefined;
  }
  if (!db) return Response.json({ available: false });
  try {
    const row = await db
      .prepare(
        `SELECT
           SUM(name = 'plan_created') AS audited,
           SUM(name = 'guide_confirm') AS confirmed,
           SUM(name = 'guide_done') AS refused,
           MIN(at) AS since
         FROM events`,
      )
      .first<{ audited: number | null; confirmed: number | null; refused: number | null; since: string | null }>();
    return Response.json(
      { available: true, audited: row?.audited ?? 0, confirmed: row?.confirmed ?? 0, refused: row?.refused ?? 0, since: row?.since ?? null },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  } catch (e) {
    console.error("stats query failed", (e as Error).message);
    return Response.json({ available: false });
  }
}
