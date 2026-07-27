/** Normalizes an answer for comparison: lowercase, trim, collapse whitespace, strip punctuation. */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // ignore accents so "hundio" matches "hundió"
    .replace(/[.,!?;:'"¿¡]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export interface AnswerCheckResult {
  correct: boolean;
  matchedAnswer?: string;
}

/** Checks a user's answer against every accepted answer for a field. */
export function checkAnswer(userAnswer: string, acceptedAnswers: string[]): AnswerCheckResult {
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) return { correct: false };

  const match = acceptedAnswers.find((accepted) => normalizeAnswer(accepted) === normalizedUser);
  return match ? { correct: true, matchedAnswer: match } : { correct: false };
}
