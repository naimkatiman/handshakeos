import type { Metadata } from "next";
import Landing from "../Landing";

export const metadata: Metadata = {
  title: "HandshakeOS · Buktikan perjanjian, bukan sekadar jabat tangan",
  description: "HandshakeOS membaca perbualan networking anda, menyemak setiap dakwaan dengan apa yang benar-benar dikatakan, dan hanya mengira langkah perkongsian apabila buktinya sahih.",
  alternates: { canonical: "/ms", languages: { en: "/", ms: "/ms" } },
  openGraph: { locale: "ms_MY" },
};

export default function HomeMs() {
  return <Landing lang="ms" />;
}
