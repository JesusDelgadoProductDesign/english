import type { TopicId } from "./grammarTopic";

/** Aggregate accuracy for one (topic, pattern) pair — the unit "weakness-based" selection ranks by. */
export interface GrammarPatternStats {
  topicId: TopicId;
  patternId: string;
  totalAttempts: number;
  totalCorrect: number;
  lastAttemptedAt: string | null;
}

export interface GrammarAttemptRecord {
  topicId: TopicId;
  patternId: string;
  itemId: string;
  correct: boolean;
  kind: "typed" | "multiple-choice";
  responseTimeMs: number;
  createdAt: string;
}

export function accuracyFor(stats: GrammarPatternStats): number {
  return stats.totalAttempts > 0 ? stats.totalCorrect / stats.totalAttempts : 0;
}

export function createInitialPatternStats(topicId: TopicId, patternId: string): GrammarPatternStats {
  return { topicId, patternId, totalAttempts: 0, totalCorrect: 0, lastAttemptedAt: null };
}
