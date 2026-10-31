import { NextResponse } from "next/server";
import { geminiModel, hasKey, modelName } from "@/lib/gemma";

export async function GET() {
  return NextResponse.json({ live: hasKey(), model: modelName(), via: "OpenRouter", fallback: geminiModel() });
}
