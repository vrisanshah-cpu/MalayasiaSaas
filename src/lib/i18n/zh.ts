import type { Messages } from "./types";

// Machine-translated (Simplified Chinese). Flagged for native-speaker
// review before launch — see regulatory-rules/README.md for the same
// pattern applied to the regulatory rules themselves. advisoryTitle/
// advisoryBody carry real legal weight and should be checked first.
const zh: Messages = {
  tagline:
    "在发布之前，检查广告文案是否可能违反马来西亚广告法规——涵盖食品饮料、化妆品与保健品的宣称规则。",
  categoryLabel: "类别",
  adCopyLabel: "广告文案",
  adCopyPlaceholder:
    "在此粘贴您的文案、产品描述或广告内容——支持英文、马来文或 Manglish 混合语。",
  submitButton: "检查合规性",
  checking: "正在检查...",
  checkFailedTitle: "检查失败",
  errors: {
    missingKey: "服务器未配置 Gemini API 密钥。",
    emptyResponse: "模型返回了空响应，请重试。",
    malformedResponse: "模型返回的响应格式有误，请重试。",
    invalidShape: "模型返回的响应结构异常，请重试。",
    checkFailed: "合规检查失败，请重试。",
    invalidRequest: "请检查您的广告文案和类别后重试。",
  },
  advisoryTitle: "本工具仅供参考——不能替代法律或监管审查",
  advisoryBody:
    "此评分和标记仅作参考。对于含糊不清的宣称，系统会明确标注较低的置信度，而非给出错误的保证——发布前请务必让合格的监管或法律顾问确认边界性宣称。",
  scoreCardTitle: "合规评分",
  scoreLow: "风险较低",
  scoreMedium: "需要审查",
  scoreHigh: "高风险",
  yourAdCopyTitle: "您的广告文案",
  flaggedPhrasesTitle: (count) => `标记短语 (${count})`,
  safeRewriteTitle: "安全改写建议",
  useThisRewrite: "使用此改写",
  categories: {
    cosmetics: "化妆品",
    food_beverage: "食品与饮料",
    health_supplements: "保健品",
  },
  languageLabel: "语言",
};

export default zh;
