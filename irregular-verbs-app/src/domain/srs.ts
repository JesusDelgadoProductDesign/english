/** Per-(verb,field) spaced-repetition state, SM-2 inspired. */
export interface SrsCard {
  verbId: string;
  field: "infinitive" | "pastSimple" | "pastParticiple" | "meaning";
  /** Days until the next scheduled review. */
  intervalDays: number;
  /** SM-2 ease factor; higher = verb is easier for this learner. */
  easeFactor: number;
  /** Consecutive correct reviews. */
  repetitions: number;
  /** 0-1 rolling confidence estimate, used for dashboard/adaptive weighting. */
  confidence: number;
  /** ISO date string of the last review. */
  lastReviewedAt: string | null;
  /** ISO date string of the next scheduled review. */
  nextReviewAt: string;
  totalAttempts: number;
  totalCorrect: number;
}

export function createInitialCard(verbId: string, field: SrsCard["field"], now: Date): SrsCard {
  return {
    verbId,
    field,
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    confidence: 0,
    lastReviewedAt: null,
    nextReviewAt: now.toISOString(),
    totalAttempts: 0,
    totalCorrect: 0,
  };
}

/** A verb is "mastered" once it has a comfortable interval and a track record of correctness. */
export function isMastered(card: SrsCard): boolean {
  return card.repetitions >= 3 && card.intervalDays >= 14 && card.confidence >= 0.75;
}
