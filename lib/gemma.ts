import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hedge } from "./hedge";

/** Start the backup provider if the primary has not answered by now (normal Gemma 4 answers land in 3 to 15 s). */
const HEDGE_MS = 15_000;
const CALL_TIMEOUT_MS = 45_000;

const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";

/** Paid OpenRouter id. The :free pool answers 429 under load, which would kill a live judging session. */
export const DEFAULT_GEMMA_MODEL = "google/gemma-4-26b-a4b-it";
/**
 * Gemini lists gemma-4-26b-a4b-it, and that route returns 500 often enough to fail a demo.
 * flash-lite-latest is the stable Gemini model that answered on 2026-10-31.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

export interface ImageInput {
  data: string; // base64, no data: prefix
  mimeType: string;
}

export interface GemmaCall<T> {
  value: T;
  via: "OpenRouter" | "Gemini";
  model: string;
}

/**
 * Worker secrets are not on process.env at build time. Read them per request,
 * and fall back to .env.local when this runs under `next dev`.
 */
function readEnv(name: string): string | undefined {
  // Trim: a secret uploaded with a trailing newline is an illegal header value,
  // and Workers then send the OpenRouter call with no Authorization header.
  let raw = process.env[name];
  if (!raw) {
    try {
      const value = (getCloudflareContext().env as Record<string, unknown>)[name];
      if (typeof value === "string") raw = value;
    } catch {
      /* next dev has no Cloudflare context */
    }
  }
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export const hasKey = () => Boolean(readEnv("OPENROUTER_API_KEY") || readEnv("GEMINI_API_KEY"));

export function modelName(): string {
  return readEnv("GEMMA_MODEL") || DEFAULT_GEMMA_MODEL;
}

export function geminiModel(): string | null {
  return readEnv("GEMINI_API_KEY") ? readEnv("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL : null;
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

function redact(msg: string): string {
  return msg.replace(/sk-or-v1-[a-z0-9]+/gi, "sk-or-[redacted]").replace(/AQ\.[A-Za-z0-9_\-]+/g, "AQ.[redacted]");
}

function errorMessage(err: string): string {
  let msg = err.slice(0, 240);
  try {
    const parsed = JSON.parse(err) as { error?: { message?: string } | string };
    msg = (typeof parsed.error === "string" ? parsed.error : parsed.error?.message) ?? msg;
  } catch {
    /* keep the raw slice */
  }
  return redact(msg);
}

async function openRouter<T>(prompt: string, image: ImageInput | undefined, key: string, signal: AbortSignal): Promise<T> {
  const textPart = { type: "text", text: prompt };
  const content = image
    ? [{ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } }, textPart]
    : prompt;

  const res = await fetch(OPENROUTER, {
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
    signal: AbortSignal.any([signal, AbortSignal.timeout(CALL_TIMEOUT_MS)]),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${errorMessage(await res.text())}`);
  const json = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
  return parseJSON<T>(messageText(json?.choices?.[0]?.message));
}

async function gemini<T>(prompt: string, image: ImageInput | undefined, key: string, model: string, signal: AbortSignal): Promise<T> {
  const parts: Record<string, unknown>[] = [];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  parts.push({ text: prompt });

  const res = await fetch(`${GEMINI}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(CALL_TIMEOUT_MS)]),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${errorMessage(await res.text())}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { thought?: boolean; text?: string }[] } }[] };
  const text = (json?.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought && p.text)
    .map((p) => p.text)
    .join("");
  return parseJSON<T>(text);
}

/**
 * OpenRouter Gemma 4 is the main call. If it throws, Gemini runs the stable
 * flash-lite model. Instructions stay in the user turn. JSON is parsed
 * defensively because models sometimes wrap it in fences.
 */
export async function gemmaJSON<T>(prompt: string, image?: ImageInput): Promise<GemmaCall<T>> {
  const openRouterKey = readEnv("OPENROUTER_API_KEY");
  const geminiKey = readEnv("GEMINI_API_KEY");
  const model = readEnv("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL;
  const viaGemini = geminiKey
    ? (signal: AbortSignal) => gemini<T>(prompt, image, geminiKey, model, signal).then((value) => ({ value, via: "Gemini" as const, model }))
    : null;
  if (!openRouterKey) {
    if (!viaGemini) throw new Error("No model key is set");
    return viaGemini(new AbortController().signal);
  }
  // Gemma 4 stays primary. If it is slow or fails, Gemini races it and the first good answer wins.
  return hedge(
    (signal) => openRouter<T>(prompt, image, openRouterKey, signal).then((value) => ({ value, via: "OpenRouter" as const, model: modelName() })),
    viaGemini,
    HEDGE_MS,
  );
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
