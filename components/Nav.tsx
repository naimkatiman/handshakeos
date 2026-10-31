"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Nav() {
  const path = usePathname();
  const [status, setStatus] = useState<{ live: boolean; model: string; fallback?: string | null } | null>(null);
  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  const tab = (href: string, label: string) => {
    const active = href === "/capture" ? path === "/capture" || path.startsWith("/opportunity") : path.startsWith(href);
    return (
      <Link
        href={href}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] text-accent-ink">H</span>
          <span className="hidden sm:inline">HandshakeOS</span>
        </Link>
        <nav className="ml-2 flex gap-1">
          {tab("/capture", "Capture")}
          {tab("/dashboard", "Outcomes")}
        </nav>
        <div className="ml-auto">
          {status && (
            <span
              title={
                status.live
                  ? `Live: ${status.model} via OpenRouter${status.fallback ? `. If that fails: ${status.fallback} on Gemini` : ""}`
                  : "No model key set: built-in samples only"
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                status.live ? "border-accent/30 bg-accent-soft text-accent" : "border-amber/30 bg-amber-soft text-amber"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.live ? "bg-accent" : "bg-amber"}`} />
              {status.live ? "Gemma 4 live" : "Demo mode"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
