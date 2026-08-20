import type { Messages } from "./types";

// Machine-translated (Bahasa Melayu). Flagged for native-speaker review
// before launch — see regulatory-rules/README.md for the same pattern
// applied to the regulatory rules themselves. advisoryTitle/advisoryBody
// carry real legal weight and should be checked first.
const ms: Messages = {
  tagline:
    "Semak salinan iklan untuk isu pematuhan pengiklanan Malaysia yang berkemungkinan sebelum anda menerbitkannya — peraturan tuntutan untuk F&B, kosmetik, dan suplemen kesihatan.",
  categoryLabel: "Kategori",
  adCopyLabel: "Salinan iklan",
  adCopyPlaceholder:
    "Tampal kapsyen, penerangan produk, atau salinan iklan anda di sini — Bahasa Inggeris, Bahasa Melayu, atau Manglish semuanya boleh.",
  submitButton: "Semak pematuhan",
  checking: "Sedang menyemak...",
  checkFailedTitle: "Semakan gagal",
  errors: {
    missingKey: "Pelayan tidak dikonfigurasikan dengan kunci API Gemini.",
    emptyResponse: "Model memulangkan respons kosong. Sila cuba lagi.",
    malformedResponse: "Model memulangkan respons yang tidak sah. Sila cuba lagi.",
    invalidShape:
      "Model memulangkan respons dalam bentuk yang tidak dijangka. Sila cuba lagi.",
    checkFailed: "Semakan pematuhan gagal. Sila cuba lagi.",
    invalidRequest:
      "Sila semak salinan iklan dan kategori anda, kemudian cuba lagi.",
  },
  advisoryTitle:
    "Alat nasihat sahaja — bukan pengganti kepada semakan undang-undang atau regulatori",
  advisoryBody:
    "Skor dan penanda ini adalah panduan sahaja. Tuntutan yang tidak jelas dinyatakan dengan keyakinan yang lebih rendah dan bukannya jaminan palsu — sentiasa sahkan tuntutan yang meragukan dengan peguam atau pihak berkuasa regulatori yang layak sebelum menerbitkan.",
  scoreCardTitle: "Skor pematuhan",
  scoreLow: "Kebimbangan rendah",
  scoreMedium: "Perlu disemak",
  scoreHigh: "Risiko tinggi",
  yourAdCopyTitle: "Salinan iklan anda",
  flaggedPhrasesTitle: (count) => `Frasa ditanda (${count})`,
  safeRewriteTitle: "Cadangan penulisan semula yang selamat",
  useThisRewrite: "Guna penulisan semula ini",
  categories: {
    cosmetics: "Kosmetik",
    food_beverage: "Makanan & Minuman",
    health_supplements: "Suplemen Kesihatan",
  },
  languageLabel: "Bahasa",
  nav: {
    dashboard: "Papan pemuka",
    signIn: "Log masuk",
    signOut: "Log keluar",
  },
  auth: {
    title: "Log masuk ke AdCheck MY",
    emailLabel: "E-mel kerja",
    emailPlaceholder: "anda@syarikat.com",
    sendLink: "Hantar pautan log masuk",
    sending: "Menghantar...",
    checkEmail: "Sila semak e-mel anda untuk pautan log masuk.",
    errorGeneric: "Gagal menghantar pautan log masuk. Sila cuba lagi.",
  },
  dashboard: {
    title: "Sejarah semakan",
    empty: "Belum ada semakan — jalankan satu dari halaman utama dan ia akan muncul di sini.",
    filterCategory: "Kategori",
    filterAllCategories: "Semua kategori",
    columnDate: "Tarikh",
    columnCategory: "Kategori",
    columnScore: "Skor",
    columnAdCopy: "Salinan iklan",
    team: "Pasukan",
    billing: "Bil",
  },
  team: {
    title: "Pasukan",
    roleOwner: "Pemilik",
    roleMember: "Ahli",
    inviteEmailPlaceholder: "rakansepasukan@syarikat.com",
    inviteButton: "Jemput",
    inviting: "Menjemput...",
    inviteLinkGenerated: "Pautan jemputan sedia — salin dan hantar kepada rakan sepasukan anda mengikut cara anda (WhatsApp, e-mel, Slack...).",
    copyLink: "Salin pautan",
    linkCopied: "Disalin!",
    inviteErrorGeneric: "Gagal menjana jemputan. Sila cuba lagi.",
    membersTitle: "Ahli",
    ownerOnlyNotice: "Hanya pemilik akaun boleh menjemput rakan sepasukan.",
  },
  billing: {
    title: "Bil",
    currentPlan: "Pelan semasa",
    freePlan: "Percuma",
    proPlan: "Pro",
    freeDescription: (limit) => `${limit} semakan sebulan, dikongsi oleh pasukan anda.`,
    proDescription: "Semakan tanpa had, dikongsi oleh pasukan anda.",
    upgradeButton: "Mulakan percubaan percuma 14 hari",
    trialNote: "Kad diperlukan. Anda tidak akan dicaj sehingga percubaan tamat, dan boleh batal bila-bila masa sebelum itu.",
    manageButton: "Urus bil",
    upgrading: "Mengalihkan ke checkout...",
    quotaExceeded:
      "Pasukan anda telah menggunakan semakan percuma bulanan. Naik taraf ke Pro untuk semakan tanpa had.",
  },
};

export default ms;
