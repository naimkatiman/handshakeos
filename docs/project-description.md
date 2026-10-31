# HandshakeOS project description

Paste this into the MLH OrganizerHQ project description.

## Problem statement

Problem statement 1, from the Cradle / Startup ASEAN brief: Best Use of Gemma 4.

How can Startup ASEAN successfully convert ecosystem connections into measurable outcomes, including investments, commercial partnerships, market expansion, and cross-border POCs?

## The problem

Startup ASEAN creates the handshake. The outcome rarely follows.

A founder leaves the room with a stack of contacts, a verbal "let's follow up", and no date. The notes get buried. The email slips. Nobody owns the next step. Two weeks later that partnership is another number in a phone. Programme teams then cannot tell which introductions became a meeting, a commercial partnership, a market expansion, or a cross-border POC, because a proposed pilot and a rumour get counted the same as delivered work.

## Proposed solution

HandshakeOS turns one conversation into a tracked opportunity, an action plan, and a verified outcome.

Capture the notes, the business card, or the chat. Open-weight Gemma 4 extracts the deal. A person confirms the evidence before anything counts on the funnel. The product gives founders and programme teams the infrastructure to keep human accountability at scale.

## How it works

1. Capture. Paste meeting notes, a WhatsApp thread, or a photo of a business card. English or Bahasa Melayu.
2. Analyse. Gemma 4 (`google/gemma-4-26b-a4b-it`) returns the parties, the terms, the owners, the deadlines, and a follow-up draft. Every claim must quote the source verbatim. The server checks that the quote is really in the text. An ungrounded quote is downgraded and can never count as completed.
3. Act. The action plan lists the next steps. The founder sends the follow-up. The model does not send it.
4. Verify. New evidence (a reply, a pilot email, a completion note) is classified as proposed ("we should"), committed ("we agree to run the pilot, starting Monday"), or completed ("the pilot is live"). Only completed, grounded evidence can advance a deal, and only after a person clicks Confirm. Hearsay stays proposed.
5. Measure. The dashboard counts Introduced, Meeting, POC, and Partnership. Conversion rates and the ASEAN corridor map use confirmed milestones only. Deals that are committed and not yet delivered stay visible, so the ecosystem can chase the promise.

## Technologies and tools

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Open-weight Gemma 4 through OpenRouter, called only on the server
- Cloudflare Workers via OpenNext. Live demo: https://handshakeos.m-naim.workers.dev
- Cloudflare D1 for anonymous funnel events (no IP, no personal data)
- three.js for the landing scene and the ASEAN corridor map
- Browser-local storage for opportunity records in this demo
- MIT licence

## Target users

Founders who meet too many people in one room to follow through, and Startup ASEAN teams who need a defensible count of investments, commercial partnerships, market expansion, and cross-border POCs that actually happened.

## What makes it unique

The Outcome Evidence Engine sits between a conversation and a metric. Three evidence levels, a grounding check, and a required human confirmation mean the dashboard cannot be inflated by drafts, proposed pilots, or rumours. The same open-weight model reads text and card photos, including Bahasa Melayu, and the corridor view shows which ASEAN routes produced a confirmed stage.
