import { NextResponse } from "next/server";
import { GEMMA_MODEL, hasKey } from "@/lib/gemma";

export async function GET() {
  return NextResponse.json({ live: hasKey(), model: GEMMA_MODEL });
}
