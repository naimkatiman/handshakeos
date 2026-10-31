import { NextResponse } from "next/server";
import { hasKey, modelName } from "@/lib/gemma";

export async function GET() {
  return NextResponse.json({ live: hasKey(), model: modelName(), via: "OpenRouter" });
}
