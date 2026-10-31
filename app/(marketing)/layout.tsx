import type { Metadata } from "next";
import "./scrollcraft.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "HandshakeOS · Prove the deal, not the handshake",
  description:
    "HandshakeOS reads your networking conversations, checks every claim against what was actually said, and only counts a partnership step when the evidence is real.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
