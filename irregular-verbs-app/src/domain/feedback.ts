export type FeedbackCategory = "verb-error" | "bug" | "feature-request" | "ux" | "translation" | "other";

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "verb-error",
  "bug",
  "feature-request",
  "ux",
  "translation",
  "other",
];

export const MAX_FEEDBACK_MESSAGE_LENGTH = 2000;
