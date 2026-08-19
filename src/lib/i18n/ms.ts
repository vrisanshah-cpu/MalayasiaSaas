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
};

export default ms;
