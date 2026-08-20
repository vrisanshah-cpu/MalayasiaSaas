import type { Messages } from "./types";

const en: Messages = {
  tagline:
    "Screen ad copy for likely Malaysian advertising compliance issues before you publish — F&B, cosmetics, and health supplement claim rules.",
  categoryLabel: "Category",
  adCopyLabel: "Ad copy",
  adCopyPlaceholder:
    "Paste your caption, product description, or ad copy here — English, Bahasa Melayu, or Manglish all work.",
  submitButton: "Check compliance",
  checking: "Checking...",
  checkFailedTitle: "Check failed",
  errors: {
    missingKey: "Server is not configured with a Gemini API key.",
    emptyResponse: "The model returned an empty response. Please try again.",
    malformedResponse:
      "The model returned a malformed response. Please try again.",
    invalidShape:
      "The model returned a response in an unexpected shape. Please try again.",
    checkFailed: "The compliance check failed. Please try again.",
    invalidRequest: "Please check your ad copy and category, then try again.",
  },
  advisoryTitle:
    "Advisory tool — not a substitute for legal or regulatory review",
  advisoryBody:
    "This score and these flags are guidance only. Ambiguous claims are called out with lower confidence rather than a false guarantee — always confirm borderline claims with qualified regulatory or legal counsel before publishing.",
  scoreCardTitle: "Compliance score",
  scoreLow: "Low concern",
  scoreMedium: "Needs review",
  scoreHigh: "High risk",
  yourAdCopyTitle: "Your ad copy",
  flaggedPhrasesTitle: (count) => `Flagged phrases (${count})`,
  safeRewriteTitle: "Safe rewrite suggestions",
  useThisRewrite: "Use this rewrite",
  categories: {
    cosmetics: "Cosmetics",
    food_beverage: "Food & Beverage",
    health_supplements: "Health Supplements",
  },
  languageLabel: "Language",
  nav: {
    dashboard: "Dashboard",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  auth: {
    title: "Sign in to AdCheck MY",
    emailLabel: "Work email",
    emailPlaceholder: "you@company.com",
    sendLink: "Send sign-in link",
    sending: "Sending...",
    checkEmail: "Check your email for a sign-in link.",
    errorGeneric: "Couldn't send the sign-in link. Please try again.",
  },
  dashboard: {
    title: "Check history",
    empty: "No checks yet — run one from the home page and it'll show up here.",
    filterCategory: "Category",
    filterAllCategories: "All categories",
    columnDate: "Date",
    columnCategory: "Category",
    columnScore: "Score",
    columnAdCopy: "Ad copy",
    team: "Team",
    billing: "Billing",
  },
  team: {
    title: "Team",
    roleOwner: "Owner",
    roleMember: "Member",
    inviteEmailPlaceholder: "teammate@company.com",
    inviteButton: "Invite",
    inviting: "Inviting...",
    inviteLinkGenerated: "Invite link ready — copy it and send it to your teammate however you like (WhatsApp, email, Slack...).",
    copyLink: "Copy link",
    linkCopied: "Copied!",
    inviteErrorGeneric: "Couldn't generate the invite. Please try again.",
    membersTitle: "Members",
    ownerOnlyNotice: "Only the account owner can invite teammates.",
  },
  billing: {
    title: "Billing",
    currentPlan: "Current plan",
    freePlan: "Free",
    proPlan: "Pro",
    freeDescription: (limit) => `${limit} checks per month, shared across your team.`,
    proDescription: "Unlimited checks, shared across your team.",
    upgradeButton: "Start 14-day free trial",
    trialNote: "Card required. You won't be charged until the trial ends, and you can cancel anytime before then.",
    manageButton: "Manage billing",
    upgrading: "Redirecting to checkout...",
    quotaExceeded:
      "Your team has used its free monthly checks. Upgrade to Pro for unlimited checks.",
  },
};

export default en;
