import { NextResponse } from "next/server";
import { gemmaJSON, GEMMA_MODEL, hasKey, type ImageInput } from "@/lib/gemma";
import { analyzePrompt } from "@/lib/prompts";
import { cannedAnalysis } from "@/lib/samples";
import { normalizeAnalysis } from "@/lib/normalize";
import type { Analysis } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { text = "", image } = (await req.json()) as { text?: string; image?: ImageInput };
  if (!text.trim() && !image) return NextResponse.json({ error: "Paste notes or upload an image." }, { status: 400 });
  if (text.length > 20_000) return NextResponse.json({ error: "Input too long (20k chars max)." }, { status: 413 });

  const now = new Date();
  const canned = image ? null : cannedAnalysis(text, now);

  if (!hasKey()) {
    if (canned) return NextResponse.json({ analysis: normalizeAnalysis(canned, text), engine: { mode: "demo", model: GEMMA_MODEL } });
    return NextResponse.json(
      { error: "Demo mode: only the built-in samples work without a key. Add GEMINI_API_KEY to analyse your own notes." },
      { status: 400 },
    );
  }

  const t0 = Date.now();
  try {
    const raw = await gemmaJSON<Partial<Analysis>>(analyzePrompt(text, now.toISOString().slice(0, 10), !!image), image);
    return NextResponse.json({
      analysis: normalizeAnalysis(raw, text),
      engine: { mode: "live", model: GEMMA_MODEL, ms: Date.now() - t0 },
    });
  } catch (e) {
    // Stage safety net: if the live call dies mid-demo on a sample, serve the canned result and say so.
    if (canned)
      return NextResponse.json({ analysis: normalizeAnalysis(canned, text), engine: { mode: "fallback", model: GEMMA_MODEL } });
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
