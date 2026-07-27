import type { SrsCard } from "@/domain/srs";

/** SM-2 quality rating: 0-2 = incorrect/hard fail, 3 = correct with effort, 4 = correct, 5 = correct instantly. */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

/** Derives a quality rating from raw practice signals (correctness + hint usage). */
export function qualityFromAttempt(correct: boolean, hintsUsed: number): ReviewQuality {
  if (!correct) return hintsUsed > 0 ? 1 : 0;
  if (hintsUsed === 0) return 5;
  if (hintsUsed <= 2) return 4;
  return 3;
}

/**
 * Applies one SM-2 review step to a card, returning the updated card.
 * Incorrect answers reset the repetition streak and schedule a same-day retry;
 * correct answers grow the interval, spacing mastered verbs out further.
 */
export function reviewCard(card: SrsCard, quality: ReviewQuality, now: Date = new Date()): SrsCard {
  const totalAttempts = card.totalAttempts + 1;
  const totalCorrect = card.totalCorrect + (quality >= 3 ? 1 : 0);

  if (quality < 3) {
    const nextReview = new Date(now);
    nextReview.setHours(nextReview.getHours() + 4); // incorrect verbs return sooner, same day
    return {
      ...card,
      repetitions: 0,
      intervalDays: 0,
      easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      confidence: Math.max(0, card.confidence - 0.15),
      lastReviewedAt: now.toISOString(),
      nextReviewAt: nextReview.toISOString(),
      totalAttempts,
      totalCorrect,
    };
  }

  const repetitions = card.repetitions + 1;
  const easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  let intervalDays: number;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 3;
  else intervalDays = Math.round(card.intervalDays * easeFactor);

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + intervalDays);

  return {
    ...card,
    repetitions,
    intervalDays,
    easeFactor,
    confidence: Math.min(1, card.confidence + (quality >= 4 ? 0.15 : 0.08)),
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString(),
    totalAttempts,
    totalCorrect,
  };
}

export function isDue(card: SrsCard, now: Date = new Date()): boolean {
  return new Date(card.nextReviewAt).getTime() <= now.getTime();
}
