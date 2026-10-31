import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Limiter = { limit: (o: { key: string }) => Promise<{ success: boolean }> };

/**
 * Per-visitor cap on paid model calls (Workers Rate Limiting binding MODEL_LIMIT, see wrangler.jsonc).
 * Fails open: with no binding (local `next start`) or a limiter error, the call is allowed.
 */
export async function modelCallAllowed(req: Request): Promise<boolean> {
  let limiter: Limiter | undefined;
  try {
    limiter = (getCloudflareContext().env as { MODEL_LIMIT?: Limiter }).MODEL_LIMIT;
  } catch {
    return true;
  }
  if (!limiter) return true;
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    return (await limiter.limit({ key: ip })).success;
  } catch (e) {
    console.error("rate limiter failed open", (e as Error).message);
    return true;
  }
}

export const RATE_LIMITED = "Too many analyses from your network in the last minute. Try again shortly, or run one of the built-in samples.";
