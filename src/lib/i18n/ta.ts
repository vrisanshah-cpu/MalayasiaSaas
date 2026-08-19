import type { Messages } from "./types";

// Machine-translated (Tamil). Flagged for native-speaker review before
// launch — see regulatory-rules/README.md for the same pattern applied to
// the regulatory rules themselves. Tamil is the language we're least
// confident in of the four shipped here; advisoryTitle/advisoryBody carry
// real legal weight and should be checked first.
const ta: Messages = {
  tagline:
    "வெளியிடுவதற்கு முன், உங்கள் விளம்பர வாசகம் மலேசிய விளம்பர விதிமுறைகளை மீறக்கூடும் என்பதைச் சரிபார்க்கவும் — உணவு பானம், அழகுசாதனம், மற்றும் சுகாதார துணை உணவு பொருட்களுக்கான உரிமைகோரல் விதிகள்.",
  categoryLabel: "வகை",
  adCopyLabel: "விளம்பர வாசகம்",
  adCopyPlaceholder:
    "உங்கள் தலைப்பு, தயாரிப்பு விளக்கம் அல்லது விளம்பர வாசகத்தை இங்கே ஒட்டவும் — ஆங்கிலம், மலாய், அல்லது கலப்பு மொழி (Manglish) அனைத்தும் ஏற்கத்தக்கது.",
  submitButton: "இணக்கத்தை சரிபார்க்கவும்",
  checking: "சரிபார்க்கப்படுகிறது...",
  checkFailedTitle: "சரிபார்ப்பு தோல்வியடைந்தது",
  errors: {
    missingKey: "சேவையகத்தில் Gemini API விசை உள்ளமைக்கப்படவில்லை.",
    emptyResponse: "மாதிரி வெற்று பதிலை அளித்தது. மீண்டும் முயற்சிக்கவும்.",
    malformedResponse: "மாதிரி தவறான வடிவத்தில் பதிலளித்தது. மீண்டும் முயற்சிக்கவும்.",
    invalidShape:
      "மாதிரி எதிர்பாராத வடிவத்தில் பதிலளித்தது. மீண்டும் முயற்சிக்கவும்.",
    checkFailed: "இணக்க சரிபார்ப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    invalidRequest:
      "உங்கள் விளம்பர வாசகம் மற்றும் வகையை சரிபார்த்து, மீண்டும் முயற்சிக்கவும்.",
  },
  advisoryTitle: "ஆலோசனை கருவி மட்டுமே — சட்ட அல்லது ஒழுங்குமுறை மறுஆய்வுக்கு மாற்றல்ல",
  advisoryBody:
    "இந்த மதிப்பெண் மற்றும் குறிகள் வழிகாட்டுதலுக்காக மட்டுமே. தெளிவற்ற உரிமைகோரல்கள் தவறான உறுதிப்பாட்டிற்குப் பதிலாக குறைந்த நம்பகத்தன்மையுடன் சுட்டிக்காட்டப்படுகின்றன — வெளியிடுவதற்கு முன் எல்லைக்கோடு உரிமைகோரல்களை தகுதிவாய்ந்த ஒழுங்குமுறை அல்லது சட்ட ஆலோசகருடன் எப்போதும் உறுதிப்படுத்தவும்.",
  scoreCardTitle: "இணக்க மதிப்பெண்",
  scoreLow: "குறைந்த கவலை",
  scoreMedium: "மறுஆய்வு தேவை",
  scoreHigh: "அதிக ஆபத்து",
  yourAdCopyTitle: "உங்கள் விளம்பர வாசகம்",
  flaggedPhrasesTitle: (count) => `குறிக்கப்பட்ட சொற்றொடர்கள் (${count})`,
  safeRewriteTitle: "பாதுகாப்பான மறுஎழுத்து பரிந்துரைகள்",
  useThisRewrite: "இந்த மறுஎழுத்தைப் பயன்படுத்தவும்",
  categories: {
    cosmetics: "அழகுசாதனப் பொருட்கள்",
    food_beverage: "உணவு மற்றும் பானம்",
    health_supplements: "சுகாதார துணை உணவு பொருட்கள்",
  },
  languageLabel: "மொழி",
};

export default ta;
