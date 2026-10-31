import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HandshakeOS | Project description",
  description: "The problem, solution, technology and people behind HandshakeOS.",
  alternates: { canonical: "/descrition" },
};

const sections = [
  {
    title: "Which problem statement we tackled",
    paragraphs: [
      "Cradle’s Outcome Conversion challenge: helping the Startup ASEAN ecosystem turn networking connections into measurable business outcomes.",
    ],
  },
  {
    title: "The problem we’re solving",
    paragraphs: [
      "Networking creates introductions, but follow-ups get scattered across WhatsApp, emails and meeting notes. Promising conversations lose momentum, and organisers struggle to distinguish initial interest from completed pilots or partnerships.",
    ],
  },
  {
    title: "Our proposed solution",
    paragraphs: [
      "HandshakeOS turns conversations into structured opportunities, practical action plans and evidence-backed progress. It helps founders follow through and shows which connections lead to outcomes.",
    ],
  },
  {
    title: "How our solution works",
    paragraphs: [
      "Users paste meeting notes or upload an image, such as a business card or conversation screenshot. AI extracts the opportunity, commitments, action owners and deadlines, then drafts a follow-up message.",
      "As discussions progress, users submit supporting evidence. The Outcome Evidence Engine classifies milestones as proposed, committed or completed, checks supporting quotes against the submitted source, and requires human confirmation before advancing the opportunity. A dashboard tracks progress from introduction to meeting, proof of concept and partnership.",
    ],
  },
  {
    title: "Technologies and tools used",
    paragraphs: [
      "Next.js, React, TypeScript and Tailwind CSS power the application. Gemma 4 runs through OpenRouter, with a Gemini fallback. Cloudflare Workers and OpenNext support hosting. The current prototype stores opportunities in the user’s browser.",
    ],
  },
  {
    title: "Target users and beneficiaries",
    paragraphs: [
      "Startup founders and business development teams managing potential partnerships. Accelerators, event organisers and ecosystem organisations such as Startup ASEAN benefit from clearer visibility into the outcomes their introductions generate.",
    ],
  },
  {
    title: "What makes our solution unique",
    paragraphs: [
      "HandshakeOS separates promises from completed outcomes. Its Outcome Evidence Engine combines AI classification, source checks and human confirmation before milestones count toward conversion metrics. A proposed pilot stays proposed until supporting evidence demonstrates completion and a person confirms it.",
    ],
  },
];

export default function DescriptionPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-4">
      <div>
        <p className="text-sm font-medium text-accent">Project description</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">HandshakeOS</h1>
      </div>
      <ol className="space-y-4">
        {sections.map((section, index) => (
          <li key={section.title} className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold leading-snug">
              <span className="mr-2 font-mono text-accent">{index + 1}.</span>
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-muted">{paragraph}</p>
            ))}
          </li>
        ))}
      </ol>
      <Link href="/" className="inline-flex rounded-md px-1 py-2 text-sm font-medium text-accent hover:underline">
        Back to HandshakeOS
      </Link>
    </article>
  );
}
