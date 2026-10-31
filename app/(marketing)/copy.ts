// Landing copy. The audited messages themselves stay in their original language: they are the evidence.
export type Lang = "en" | "ms";

export const COPY = {
  en: {
    cta: "Run the KitaKantin deal",
    navHow: "How it checks",
    navOutcomes: "Outcomes",
    eyebrow: "For Startup ASEAN founders and ecosystem teams",
    title: "And then, nothing happens.",
    lede: "Isaac goes to a networking event to grow KitaKantin, his app for small local food vendors. He meets Naim, then Lawrence, then several other founders. A handshake, numbers exchanged, a follow-up with no date.",
    watch: "The problem",
    tension: [
      "The meeting notes get buried.",
      "The follow-up email gets delayed.",
      "Nobody takes ownership of the next steps.",
      "Just another contact in a phone.",
    ],
    problemKicker: "Problem statement",
    problemHead:
      "How can Startup ASEAN successfully convert ecosystem connections into measurable outcomes, including investments, commercial partnerships, market expansion, and cross-border POCs?",
    problemBody:
      "There are simply too many connections and not enough bandwidth to follow through. A few days pass. Nobody remembers what was agreed. Two weeks later, that promising opportunity is just another contact in someone's phone.",
    solutionKicker: "The solution",
    solutionHead: "Introducing HandshakeOS.",
    solutionLede:
      "What if every meaningful conversation became a business opportunity, every opportunity an action plan, and every action plan a measurable outcome?",
    problemCol: "Problem",
    solutionCol: "HandshakeOS",
    solutionRows: [
      { problem: "Too many connections", answer: "Centralised opportunity tracking" },
      { problem: "Too many conversations", answer: "AI-powered extraction" },
      { problem: "Too many forgotten follow-ups", answer: "Automated action planning" },
      { problem: "Unclear partnership progress", answer: "Milestone tracking" },
      { problem: "Unmeasured outcomes", answer: "Evidence-based verification" },
    ],
    solutionBody:
      "We are not replacing human accountability. We are giving people the infrastructure to maintain it at scale. HandshakeOS turns business conversations into opportunities and tracks them to measurable outcomes.",
    solutionProof:
      "HandshakeOS does not just track promises. We verify progress. A conversation, a commitment, and an achievement are different. The Outcome Evidence Engine reads the documents. Isaac has to bring substantial evidence before the partnership moves.",
    auditHead: "One conversation. Watch what counts.",
    auditNote: "KitaKantin. Naim writes back. His words are the evidence.",
    from: ["Isaac's notes", "Naim", "A friend of a friend", "Naim"],
    via: ["after the networking event", "email", "WhatsApp", "email"],
    verdicts: [
      { label: "Proposed", stage: "Pilot", note: "Nobody agreed to anything yet. Not counted." },
      { label: "Completed", stage: "Meeting held", note: "Quote found word for word. You confirm, the deal moves." },
      { label: "Hearsay", stage: "Partnership", note: "A rumour is not evidence. The funnel does not move." },
      { label: "Completed", stage: "POC launched", note: "The pilot is live, in their words. Confirmed." },
    ],
    stages: ["Introduced", "Meeting held", "POC launched", "Partnership signed"],
    ledger: "KitaKantin · Naim",
    status: [
      "Reading the conversation.",
      "A suggestion is not a commitment.",
      "Meeting confirmed against the source.",
      "Someone said it was a done deal. Not counted.",
      "Two verified steps. Zero inflated ones.",
    ],
    rulesHead: "A conversation, a commitment, an achievement.",
    rulesBody:
      "The Outcome Evidence Engine sorts every statement. The quote has to exist in the source, or it is downgraded. Only a completed step moves the partnership, and only after a person confirms it.",
    levels: [
      { tag: "Proposed", kind: "proposed", quote: "We should run a pilot.", text: "Interest, not a decision." },
      { tag: "Committed", kind: "committed", quote: "We agree to run the pilot, starting Monday.", text: "A promise with a date. Worth chasing." },
      { tag: "Completed", kind: "completed", quote: "The pilot is now live with the first vendors.", text: "The only level that moves the funnel." },
      { tag: "Bahasa too", kind: "proposed", quote: "Hafiz cakap boleh mula dengan 20 kedai dulu.", text: "Read in the language it was said." },
    ],
    closeHead: "We verify progress.",
    closeBody: "Isaac cannot move the partnership on a whim. He brings the evidence. A person confirms it. No sign-up. The sample deal runs in one click, or paste your own.",
    ownLabel: "Or audit your own notes. Any ASEAN language.",
    ownPlaceholder: "Paste last night's WhatsApp thread, an email, or your meeting notes",
    ownGo: "Audit my notes",
    proof: (a: number, c: number, r: number) =>
      `Live on this site: ${a} deal${a === 1 ? "" : "s"} audited by Gemma 4 · ${c} step${c === 1 ? "" : "s"} verified · ${r} rumour${r === 1 ? "" : "s"} refused`,
    pocket: {
      head: "Your turn. Follow the KitaKantin deal from promise to proof.",
      steps: [
        { title: "Open the KitaKantin deal", text: "Scan the code or select Start the KitaKantin deal below. It opens in your browser, with no sign-up or installation." },
        { title: "Read the action plan", text: "The deal opens automatically. See the next steps and a follow-up drafted from Isaac and Naim's conversation." },
        { title: "Check Naim's reply", text: "Select “Verify Naim's reply”, review the quoted evidence, then “Confirm: POC launched”. You decide when the deal moves." },
        { title: "Test the rumour", text: "Select “Send the rumour”, then “Reject it”. Open “See the outcomes funnel” to see what counted." },
      ],
      // Step 1 on a phone, where the code is hidden and the visitor is already holding the device.
      first: { title: "Tap Start the KitaKantin deal below", text: "It opens right here in your browser, with no sign-up or installation." },
      scan: "Point your camera here",
      phone: "Start the KitaKantin deal",
    },
    foot: "HandshakeOS · built for the Cradle Outcome Conversion challenge",
    powered: "Powered by Gemma 4",
    other: { href: "/ms", label: "BM", name: "Bahasa Melayu" },
  },
  ms: {
    cta: "Cuba perjanjian KitaKantin",
    navHow: "Cara ia menyemak",
    navOutcomes: "Hasil",
    eyebrow: "Untuk pengasas Startup ASEAN dan pasukan ekosistem",
    title: "Kemudian, tiada apa yang berlaku.",
    lede: "Isaac ke acara networking untuk kembangkan KitaKantin, aplikasinya untuk peniaga makanan tempatan yang kecil. Dia berjumpa Naim, kemudian Lawrence, kemudian beberapa pengasas lain. Jabat tangan, nombor ditukar, susulan tanpa tarikh.",
    watch: "Penyata masalah",
    tension: [
      "Nota mesyuarat tertanam.",
      "E-mel susulan tertangguh.",
      "Tiada siapa yang memiliki langkah seterusnya.",
      "Hanya satu lagi nombor dalam telefon.",
    ],
    problemKicker: "Penyata masalah",
    problemHead:
      "Bagaimana Startup ASEAN boleh menukar hubungan ekosistem kepada hasil yang boleh diukur, termasuk pelaburan, perkongsian komersial, pengembangan pasaran, dan POC rentas sempadan?",
    problemBody:
      "Terlalu banyak hubungan dan tidak cukup masa untuk membuat susulan. Beberapa hari berlalu. Tiada siapa ingat apa yang dipersetujui. Dua minggu kemudian, peluang itu hanya satu lagi nombor dalam telefon.",
    solutionKicker: "Penyelesaian",
    solutionHead: "Memperkenalkan HandshakeOS.",
    solutionLede:
      "Bagaimana jika setiap perbualan yang bermakna menjadi peluang perniagaan, setiap peluang menjadi pelan tindakan, dan setiap pelan tindakan menjadi hasil yang boleh diukur?",
    problemCol: "Masalah",
    solutionCol: "HandshakeOS",
    solutionRows: [
      { problem: "Terlalu banyak hubungan", answer: "Penjejakan peluang berpusat" },
      { problem: "Terlalu banyak perbualan", answer: "Pengekstrakan dikuasakan AI" },
      { problem: "Terlalu banyak susulan yang dilupakan", answer: "Perancangan tindakan automatik" },
      { problem: "Kemajuan perkongsian yang tidak jelas", answer: "Penjejakan pencapaian" },
      { problem: "Hasil yang tidak diukur", answer: "Pengesahan berasaskan bukti" },
    ],
    solutionBody:
      "Kami tidak menggantikan akauntabiliti manusia. Kami memberi orang prasarana untuk mengekalkannya pada skala. HandshakeOS menukar perbualan perniagaan kepada peluang dan menjejaknya hingga hasil yang boleh diukur.",
    solutionProof:
      "HandshakeOS bukan sekadar menjejak janji. Kami sahkan kemajuan. Perbualan, komitmen, dan pencapaian adalah berbeza. Outcome Evidence Engine membaca dokumen. Isaac perlu bawa bukti yang kukuh sebelum perkongsian bergerak.",
    auditHead: "Satu perbualan. Lihat apa yang dikira.",
    auditNote: "KitaKantin. Naim membalas. Kata-katanya adalah bukti.",
    from: ["Nota Isaac", "Naim", "Kawan kepada kawan", "Naim"],
    via: ["selepas acara networking", "e-mel", "WhatsApp", "e-mel"],
    verdicts: [
      { label: "Dicadangkan", stage: "Pilot", note: "Belum ada sesiapa bersetuju. Tidak dikira." },
      { label: "Selesai", stage: "Mesyuarat diadakan", note: "Petikan ditemui kata demi kata. Anda sahkan, perjanjian bergerak." },
      { label: "Khabar angin", stage: "Perkongsian", note: "Khabar angin bukan bukti. Saluran tidak bergerak." },
      { label: "Selesai", stage: "POC dilancarkan", note: "Pilot sudah berjalan, dalam kata-kata mereka sendiri. Disahkan." },
    ],
    stages: ["Diperkenalkan", "Mesyuarat diadakan", "POC dilancarkan", "Perkongsian ditandatangani"],
    ledger: "KitaKantin · Naim",
    status: [
      "Membaca perbualan.",
      "Cadangan bukan komitmen.",
      "Mesyuarat disahkan dengan sumber.",
      "Ada orang kata ia sudah pasti. Tidak dikira.",
      "Dua langkah disahkan. Tiada yang digelembungkan.",
    ],
    rulesHead: "Perbualan, komitmen, dan pencapaian.",
    rulesBody:
      "Outcome Evidence Engine menyusun setiap kenyataan. Petikan mesti wujud dalam sumber, atau ia diturunkan. Hanya langkah yang selesai menggerakkan perkongsian, dan hanya selepas seseorang mengesahkannya.",
    levels: [
      { tag: "Dicadangkan", kind: "proposed", quote: "Kita patut buat pilot.", text: "Minat, bukan keputusan." },
      { tag: "Komited", kind: "committed", quote: "Kami setuju jalankan pilot, mula Isnin.", text: "Janji dengan tarikh. Wajar dikejar." },
      { tag: "Selesai", kind: "completed", quote: "Pilot sudah berjalan dengan vendor pertama.", text: "Satu-satunya tahap yang menggerakkan saluran." },
      { tag: "English juga", kind: "proposed", quote: "We agree to start with 20 stores.", text: "Dibaca dalam bahasa ia diucapkan." },
    ],
    closeHead: "Kami sahkan kemajuan.",
    closeBody: "Isaac tidak boleh gerakkan perkongsian sesuka hati. Dia bawa bukti. Seseorang mengesahkannya. Tiada pendaftaran. Perjanjian contoh berjalan dengan satu klik, atau tampal milik anda.",
    ownLabel: "Atau audit nota anda sendiri. Mana-mana bahasa ASEAN.",
    ownPlaceholder: "Tampal perbualan WhatsApp malam tadi, e-mel, atau nota mesyuarat anda",
    ownGo: "Audit nota saya",
    proof: (a: number, c: number, r: number) =>
      `Secara langsung di laman ini: ${a} perjanjian diaudit oleh Gemma 4 · ${c} langkah disahkan · ${r} khabar angin ditolak`,
    pocket: {
      head: "Giliran anda. Ikuti perjanjian KitaKantin daripada janji kepada bukti.",
      steps: [
        { title: "Buka perjanjian KitaKantin", text: "Imbas kod atau tekan Mula perjanjian KitaKantin di bawah. Ia dibuka dalam pelayar tanpa pendaftaran atau pemasangan." },
        { title: "Baca pelan tindakan", text: "Perjanjian dibuka secara automatik. Lihat langkah seterusnya dan draf susulan daripada perbualan Isaac dan Naim." },
        { title: "Semak balasan Naim", text: "Dalam aplikasi, tekan “Verify Naim's reply”, semak petikan bukti, kemudian “Confirm: POC launched”. Anda tentukan bila perjanjian bergerak." },
        { title: "Uji khabar angin", text: "Tekan “Send the rumour”, kemudian “Reject it”. Buka “See the outcomes funnel” untuk lihat apa yang dikira." },
      ],
      first: { title: "Tekan Mula perjanjian KitaKantin di bawah", text: "Ia dibuka terus dalam pelayar anda tanpa pendaftaran atau pemasangan." },
      scan: "Halakan kamera anda ke sini",
      phone: "Mula perjanjian KitaKantin",
    },
    foot: "HandshakeOS · dibina untuk cabaran Cradle Outcome Conversion",
    powered: "Dikuasakan oleh Gemma 4",
    other: { href: "/", label: "EN", name: "English" },
  },
} as const;
