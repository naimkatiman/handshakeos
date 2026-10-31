import { NextResponse } from "next/server";
import { gemmaJSON, modelName, hasKey, type ImageInput } from "@/lib/gemma";
import { analyzePrompt } from "@/lib/prompts";
import { cannedAnalysis } from "@/lib/samples";
import { normalizeAnalysis } from "@/lib/normalize";
import type { Analysis, EngineInfo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { text = "", image } = (await req.json()) as { text?: string; image?: ImageInput };
  if (!text.trim() && !image) return NextResponse.json({ error: "Paste notes or upload an image." }, { status: 400 });
  if (text.length > 20_000) return NextResponse.json({ error: "Input too long (20k chars max)." }, { status: 413 });

  const now = new Date();
  const canned = cannedAnalysis(text, now, !!image);

  const engine = (mode: EngineInfo["mode"], extra?: Partial<EngineInfo>): EngineInfo => ({
    mode,
    model: extra?.model || modelName(),
    via: extra?.via,
    ms: extra?.ms,
  });

  if (!hasKey()) {
    if (canned) return NextResponse.json({ analysis: normalizeAnalysis(canned, text), engine: engine("demo") });
    return NextResponse.json(
      { error: "Demo mode: only the built-in samples work without a key. Add OPENROUTER_API_KEY." },
      { status: 400 },
    );
  }

  const t0 = Date.now();
  try {
    const raw = await gemmaJSON<Partial<Analysis>>(analyzePrompt(text, now.toISOString().slice(0, 10), !!image), image);
    return NextResponse.json({
      analysis: normalizeAnalysis(raw.value, text),
      engine: engine("live", { model: raw.model, via: raw.via, ms: Date.now() - t0 }),
    });
  } catch (e) {
    // Stage safety net: if both providers die mid-demo on a sample, serve the canned result and say so.
    if (canned) return NextResponse.json({ analysis: normalizeAnalysis(canned, text), engine: engine("fallback") });
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
