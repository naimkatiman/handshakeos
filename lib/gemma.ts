import "server-only";

const API = "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
export const hasKey = () => Boolean(process.env.GEMINI_API_KEY);

export interface ImageInput {
  data: string; // base64, no data: prefix
  mimeType: string;
}

/**
 * Calls Gemma 4 on the Gemini API and returns parsed JSON.
 * Instructions go in the user turn (works across Gemma variants), and the
 * response is parsed defensively — Gemma sometimes wraps JSON in fences.
 */
export async function gemmaJSON<T>(prompt: string, image?: ImageInput): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const parts: Record<string, unknown>[] = [];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  parts.push({ text: prompt });

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  };

  const res = await fetch(`${API}/${GEMMA_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const err = await res.text();
    let msg = err.slice(0, 200);
    try {
      msg = JSON.parse(err)?.error?.message ?? msg;
    } catch {}
    throw new Error(`Gemini API ${res.status}: ${msg}`);
  }

  const json = await res.json();
  // Skip "thought" parts if thinking is on; join the answer parts.
  const text: string = (json?.candidates?.[0]?.content?.parts ?? [])
    .filter((p: { thought?: boolean; text?: string }) => !p.thought && p.text)
    .map((p: { text: string }) => p.text)
    .join("");

  return parseJSON<T>(text);
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
