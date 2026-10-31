import type { Metadata } from "next";
import "./(app)/globals.css";

export const metadata: Metadata = {
  title: "HandshakeOS · Not found",
  description: "That link does not exist. Run a real deal instead.",
};

// One 404 for both root layouts. A dead link still gets a way into the product.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" />
      </head>
      <body className="grid min-h-screen place-items-center px-4">
        <main className="w-full max-w-xl py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-danger">404 · Not found in the source</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">This link did not survive the audit.</h1>
          <p className="mt-4 text-muted">
            The page you asked for is not here, and HandshakeOS does not make things up. Here is something that is real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/capture?sample=en&run=1" className="inline-flex items-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:brightness-110">
              Run a real deal
            </a>
            <a href="/" className="inline-flex items-center rounded-lg border border-line px-5 py-3 text-sm font-semibold hover:border-ink/40">
              Home
            </a>
          </div>
          <p className="mt-8 text-sm text-muted">
            Or go to <a href="/capture" className="text-accent underline">Capture</a>, <a href="/dashboard" className="text-accent underline">Outcomes</a>, or{" "}
            <a href="/versions" className="text-accent underline">every version</a>.
          </p>
        </main>
      </body>
    </html>
  );
}
