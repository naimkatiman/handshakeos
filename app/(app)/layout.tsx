import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
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
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
