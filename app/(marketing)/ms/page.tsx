import type { Metadata } from "next";
import Landing from "../Landing";

export const metadata: Metadata = {
  title: "HandshakeOS · Kemudian, tiada apa yang berlaku",
  description: "Isaac pulang dari acara networking dengan jabat tangan dan tanpa tarikh. HandshakeOS menukar perbualan itu kepada peluang, dan hanya mengira langkah apabila buktinya sahih.",
  alternates: { canonical: "/ms", languages: { en: "/", ms: "/ms" } },
  openGraph: { locale: "ms_MY" },
};

export default function HomeMs() {
  return <Landing lang="ms" />;
}
