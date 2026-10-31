import { NextResponse } from "next/server";
import { gemmaJSON, modelName, hasKey, type ImageInput } from "@/lib/gemma";
import type { EngineInfo } from "@/lib/types";
import { verifyPrompt } from "@/lib/prompts";
import { cannedVerify } from "@/lib/samples";
import { normalizeFindings } from "@/lib/normalize";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  text?: string;
  image?: ImageInput;
  context: { title: string; opportunity: string; stage: string };
}

export async function POST(req: Request) {
  const { text = "", image, context } = (await req.json()) as Body;
  if (!text.trim() && !image) return NextResponse.json({ error: "Paste a message or upload a screenshot/document." }, { status: 400 });

  const canned = image ? null : cannedVerify(text);
  const pack = (
    r: { findings: unknown; summary?: string; confidence?: number; transcript?: string },
    mode: EngineInfo["mode"],
    extra?: Partial<EngineInfo>,
  ) =>
    NextResponse.json({
      findings: normalizeFindings(r.findings, text + "\n" + (r.transcript ?? "")),
      summary: typeof r.summary === "string" ? r.summary : "",
      confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
      engine: { mode, model: extra?.model || modelName(), via: extra?.via, ms: extra?.ms },
    });

  if (!hasKey()) {
    if (canned) return pack(canned, "demo");
    return NextResponse.json(
      { error: "Demo mode: only the built-in sample evidence works without a key. Add OPENROUTER_API_KEY." },
      { status: 400 },
    );
  }

  const t0 = Date.now();
  try {
    const raw = await gemmaJSON<{ findings: unknown; summary: string; confidence: number; transcript?: string }>(
      verifyPrompt(context, text, new Date().toISOString().slice(0, 10), !!image),
      image,
    );
    return pack(raw.value, "live", { model: raw.model, via: raw.via, ms: Date.now() - t0 });
  } catch (e) {
    if (canned) return pack(canned, "fallback");
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
