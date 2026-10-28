import type { Opportunity, Stage } from "./types";
import { STAGES } from "./types";

// 19 illustrative deals. With the live demo deal added and advanced to "meeting",
// the funnel reads 20 → 8 → 3 → 1 (40% intro→meeting, 5% intro→partnership).
const ROWS: [string, string, string, string, Stage][] = [
  ["PayLane × Koperasi Maju", "Malaysia", "Malaysia", "Fintech", "partnership"],
  ["AgriSense × Mekong Rice Co.", "Malaysia", "Vietnam", "Agritech", "poc"],
  ["KlinikNow × Cebu Health Network", "Malaysia", "Philippines", "Healthtech", "poc"],
  ["EduPintar × Jakarta Tutors Guild", "Malaysia", "Indonesia", "Edtech", "meeting"],
  ["GreenWatt × Bangkok Malls Group", "Thailand", "Thailand", "Climate", "meeting"],
  ["HalalChain × Brunei Foods", "Malaysia", "Brunei", "Supply chain", "meeting"],
  ["SewaBot × Penang Property Mgmt", "Malaysia", "Malaysia", "Proptech", "meeting"],
  ["TaniFund × Sabah Growers", "Indonesia", "Malaysia", "Agritech", "introduced"],
  ["FleetIQ × Hanoi Couriers", "Singapore", "Vietnam", "Logistics", "introduced"],
  ["Lingo.ai × Manila BPO Alliance", "Philippines", "Philippines", "AI", "introduced"],
  ["CarbonLedger × Kuching Timber", "Singapore", "Malaysia", "Climate", "introduced"],
  ["ShopSuara × Surabaya Retail", "Malaysia", "Indonesia", "Retail", "introduced"],
  ["MediTrack × Phnom Penh Clinics", "Thailand", "Cambodia", "Healthtech", "introduced"],
  ["InsureMe × Yangon Microfinance", "Singapore", "Myanmar", "Insurtech", "introduced"],
  ["CodeKampus × Vientiane Uni", "Malaysia", "Laos", "Edtech", "introduced"],
  ["SolarPay × Davao Co-ops", "Philippines", "Philippines", "Climate", "introduced"],
  ["ParkPintar × Shah Alam Council", "Malaysia", "Malaysia", "Govtech", "introduced"],
  ["Tukang.io × Johor Contractors", "Malaysia", "Malaysia", "Marketplace", "introduced"],
  ["BayarLah × Ipoh Merchants", "Malaysia", "Malaysia", "Payments", "introduced"],
];

export function seedOpportunities(): Opportunity[] {
  const now = Date.now();
  return ROWS.map(([title, a, b, sector, stage], i) => {
    const [ours, theirs] = title.split(" × ");
    const created = new Date(now - (40 - i) * 86_400_000).toISOString();
    const reached = STAGES.slice(0, STAGES.indexOf(stage) + 1);
    return {
      id: `seed-${i}`,
      createdAt: created,
      updatedAt: created,
      sourceText: "",
      illustrative: true,
      engine: { mode: "demo", model: "seed" },
      analysis: {
        title,
        ourSide: { name: ours, country: a },
        counterparty: { name: theirs, country: b },
        contacts: [],
        opportunity: `${ours} and ${theirs} exploring a ${sector.toLowerCase()} collaboration.`,
        sector,
        corridor: a === b ? a : `${a} → ${b}`,
        keyTerms: [],
        commitments: [],
        actions: [],
        followUp: "",
        initialLevel: "proposed",
        evidence: [],
      },
      actions: [],
      followUp: "",
      stage,
      history: reached.map((s, k) => ({ stage: s, at: new Date(Date.parse(created) + k * 7 * 86_400_000).toISOString(), note: "Illustrative" })),
      evidence: [],
    };
  });
}
