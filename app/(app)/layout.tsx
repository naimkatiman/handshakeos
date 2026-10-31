import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  metadataBase: new URL("https://handshakeos.m-naim.workers.dev"),
  openGraph: {
    type: "website",
    siteName: "HandshakeOS",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "HandshakeOS: prove the deal, not the handshake" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  title: "HandshakeOS — from connections to outcomes",
  description: "Turn networking conversations into verified partnership outcomes. Powered by Gemma 4.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body className="min-h-screen">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-24 pt-6 outline-none sm:px-6">{children}</main>
      </body>
    </html>
  );
}
