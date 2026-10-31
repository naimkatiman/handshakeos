import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const API = "https://openrouter.ai/api/v1/chat/completions";

/** Paid OpenRouter id. The :free pool answers 429 under load, which would kill a live judging session. */
export const DEFAULT_GEMMA_MODEL = "google/gemma-4-26b-a4b-it";

export interface ImageInput {
  data: string; // base64, no data: prefix
  mimeType: string;
}

/**
 * Worker secrets are not on process.env at build time. Read them per request,
 * and fall back to .env.local when this runs under `next dev`.
 */
function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  try {
    const value = (getCloudflareContext().env as Record<string, unknown>)[name];
    return typeof value === "string" && value ? value : undefined;
  } catch {
    return undefined;
  }
}

export const hasKey = () => Boolean(readEnv("OPENROUTER_API_KEY"));

export function modelName(): string {
  return readEnv("GEMMA_MODEL") || DEFAULT_GEMMA_MODEL;
}

function messageText(message: { content?: unknown } | undefined): string {
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : ""))
      .join("");
  }
  return "";
}

/**
 * Calls open-weight Gemma 4 through OpenRouter and returns parsed JSON.
 * Reasoning is off so the token budget is the JSON, not a thought trace.
 * Instructions stay in the user turn, and the response is parsed defensively
 * because Gemma sometimes wraps JSON in fences.
 */
export async function gemmaJSON<T>(prompt: string, image?: ImageInput): Promise<T> {
  const key = readEnv("OPENROUTER_API_KEY");
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const textPart = { type: "text", text: prompt };
  const content = image
    ? [{ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } }, textPart]
    : prompt;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://handshakeos.m-naim.workers.dev",
      "X-Title": "HandshakeOS",
    },
    body: JSON.stringify({
      model: modelName(),
      temperature: 0.2,
      max_tokens: 4096,
      reasoning: { enabled: false },
      messages: [{ role: "user", content }],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const err = await res.text();
    let msg = err.slice(0, 240);
    try {
      const parsed = JSON.parse(err) as { error?: { message?: string } | string };
      msg = (typeof parsed.error === "string" ? parsed.error : parsed.error?.message) ?? msg;
    } catch {
      /* keep the raw slice */
    }
    throw new Error(`OpenRouter ${res.status}: ${msg.replace(/sk-or-v1-[a-z0-9]+/gi, "sk-or-[redacted]")}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
  return parseJSON<T>(messageText(json?.choices?.[0]?.message));
}

export function parseJSON<T>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s) as T;
  } catch {
    // Common repair: trailing commas.
    return JSON.parse(s.replace(/,\s*([}\]])/g, "$1")) as T;
  }
}

/** Grounding check: is the quote actually present in the source? Catches hallucinated evidence. */
export function isGrounded(quote: string, source: string): boolean {
  const norm = (x: string) =>
    x.toLowerCase().replace(/[“”"'‘’]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const q = norm(quote);
  if (!q) return false;
  const src = norm(source);
  if (src.includes(q)) return true;
  // Tolerate light paraphrase at the edges: 80% of a long quote's words, in order-insensitive match.
  const words = q.split(" ").filter((w) => w.length > 2);
  if (words.length < 4) return false;
  const hit = words.filter((w) => src.includes(w)).length;
  return hit / words.length >= 0.8;
}
