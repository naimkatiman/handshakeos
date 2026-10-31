# HandshakeOS

**Stop collecting contacts. Start closing opportunities.**

HandshakeOS turns networking conversations into verified partnership outcomes for the Startup ASEAN ecosystem. Paste meeting notes, a WhatsApp thread or a photo of a business card; Gemma 4 extracts the deal, commitments, deadlines and next steps. Then the **Outcome Evidence Engine** decides what actually counts as progress.

Built for the Cradle **Outcome Conversion** challenge.

## The flow

```
Upload conversation → Extract opportunity → Generate actions → Verify milestone → Update conversion metrics
```

| Screen | What it does |
|---|---|
| **Capture** | Paste text, paste/drop an image (business card, screenshot, handwritten notes). Any ASEAN language. |
| **Action Plan** | Parties, key terms, contacts, next actions with owners and deadlines, an editable follow-up (copy / WhatsApp / email), and every extracted claim with its verbatim source quote. |
| **Outcomes** | Cumulative funnel (Introduced → Meeting → POC → Partnership), conversion rates, corridor breakdown, CSV/JSON export. |

## Why it's different: the Outcome Evidence Engine

Most "AI CRMs" let you mark a deal as won. HandshakeOS doesn't trust anyone, including the model.

1. **Three levels, strictly defined.** Gemma classifies evidence per milestone as *proposed* ("we should"), *committed* ("we agree to run the pilot, starting Monday") or *completed* ("the pilot is live on all 10 vans").
2. **Grounding check.** Every finding must quote the evidence verbatim. The server checks the quote exists in the source. An ungrounded quote is automatically downgraded and can never count as completed.
3. **Human confirmation.** Only *completed*, grounded evidence can advance a deal, and only after a person clicks Confirm. Everything lands in an audit trail.
4. **Metrics only count confirmed milestones.** Drafts, proposed pilots and hearsay never inflate the funnel. The dashboard separately surfaces "committed, not yet delivered" deals: the promises your ecosystem should be chasing.

## Run it

```bash
npm install
cp .env.example .env.local   # add your OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Get a key at <https://openrouter.ai/keys>. Default model: `google/gemma-4-26b-a4b-it` (open weights, fast MoE, vision). `google/gemma-4-31b-it` is the stronger alternative. Set `GEMMA_MODEL` to switch. Use the paid id. The `:free` pool returns 429 when several people click at once.

**No key?** The app runs in *Demo mode*: the built-in samples return pre-recorded outputs so you can walk the whole flow. With a key, if the live call fails mid-demo on a sample, the app serves the sample result and labels it "Offline fallback" so your demo never dies on stage.

### Deploy to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Add `OPENROUTER_API_KEY` (and optionally `GEMMA_MODEL`) as environment variables.
3. Deploy. No database to provision.

## Architecture

```
app/
  page.tsx                 Capture
  opportunity/[id]/page.tsx  Action plan + Evidence Engine + audit trail
  dashboard/page.tsx       Outcome funnel
  api/analyze/route.ts     Gemma 4: conversation → structured opportunity
  api/verify/route.ts      Gemma 4: evidence → milestone findings
lib/
  gemma.ts                 OpenRouter client for Gemma 4, robust JSON parsing, grounding check
  prompts.ts               Extraction + evidence-audit prompts
  normalize.ts             Validates model output, enforces evidence rules
  store.ts                 Browser-local persistence (swap for Supabase)
  funnel.ts                Conversion math
  samples.ts / seed.ts     Fictional demo scenario + illustrative funnel data
```

- **Model calls are server-side only.** The API key never reaches the browser.
- **Images are downscaled client-side** (max 1600px JPEG) before upload and sent inline to Gemma 4.
- **Storage is browser-local** by design for a zero-setup demo. For an ecosystem-wide view, replace `lib/store.ts` with Supabase (one `opportunities` table holding the same JSON).

## 90-second demo script

| Time | Do | Say |
|---|---|---|
| 0–15s | Open Outcomes (20 → 7 → 3 → 1) | "Startup ASEAN creates connections. But how do we measure what they produce?" |
| 15–35s | Capture → *MY → SG logistics* → Analyse | "Raw notes from a mixer. Gemma extracts the deal, the 14-day pilot, the 10 vehicles, Sarah's deadline." |
| 35–55s | Scroll the plan | "Every claim is quoted from the source. It's marked *proposed*, not confirmed. Follow-up is drafted; I send it, not the AI." |
| 55–75s | Evidence Engine → *meeting + pilot agreed* → Verify → Confirm | "Sarah replies. Gemma proves the meeting happened but the pilot is only committed. I confirm. Watch the funnel." Then try *hearsay*: "Rumours don't count." |
| 75–90s | Outcomes (now 20 → 8, 40% / 5%) → GitHub | "Verified conversion, open source, ready for the whole ecosystem." |

Bonus: run the *Johor retail (Bahasa Melayu)* sample to show the follow-up drafted in Malay.

## Roadmap

- Supabase + org accounts so Startup ASEAN sees cross-startup conversion by event, corridor and sector
- Per-event attribution: tag captures with the event they came from, rank events by verified outcomes
- Nudges for "committed, not yet delivered" deals past their date
- Counterparty co-signing: the other side confirms a milestone via a magic link

## License

MIT. All companies and people in the samples are fictional.
