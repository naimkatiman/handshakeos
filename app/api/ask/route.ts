import { NextResponse } from "next/server";
import { gemmaJSON, hasKey, isGrounded } from "@/lib/gemma";
import { modelCallAllowed, RATE_LIMITED } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

// Answers a question about one deal using only its own conversation and evidence. Every quote is grounding-checked.
const prompt = (title: string, source: string, question: string) => `You answer questions about one business deal, "${title}".
Use ONLY the SOURCE below. Never use outside knowledge, never guess.

SOURCE:
"""
${source}
"""

QUESTION: ${question}

Reply with JSON only:
{"answer": "<one or two plain sentences; if the SOURCE does not say, answer exactly: The conversation does not say.>",
 "quotes": ["<verbatim snippet copied character for character from SOURCE that supports the answer>", "..."]}
Use at most 3 quotes. If the SOURCE does not answer the question, return an empty quotes array.`;

export async function POST(req: Request) {
  const { question = "", source = "", title = "this deal" } = (await req.json()) as { question?: string; source?: string; title?: string };
  if (!question.trim() || !source.trim()) return NextResponse.json({ error: "Ask a question about a captured deal." }, { status: 400 });
  if (question.length > 300) return NextResponse.json({ error: "Keep the question under 300 characters." }, { status: 413 });
  if (source.length > 30_000) return NextResponse.json({ error: "This deal's record is too long to question in one go." }, { status: 413 });
  if (!hasKey()) return NextResponse.json({ error: "Asking needs a live model key." }, { status: 400 });
  if (!(await modelCallAllowed(req))) return NextResponse.json({ error: RATE_LIMITED }, { status: 429 });

  const t0 = Date.now();
  try {
    const r = await gemmaJSON<{ answer?: unknown; quotes?: unknown }>(prompt(title.slice(0, 120), source, question.trim()));
    const quotes = (Array.isArray(r.value.quotes) ? r.value.quotes : [])
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .slice(0, 3)
      .map((q) => ({ quote: q.trim(), grounded: isGrounded(q, source) }));
    const grounded = quotes.some((q) => q.grounded);
    // An answer with no quote that actually exists in the source is not shown as fact.
    const answer = grounded && typeof r.value.answer === "string" ? r.value.answer : "The conversation does not say.";
    return NextResponse.json({ answer, quotes, grounded, engine: { model: r.model, via: r.via, ms: Date.now() - t0 } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
