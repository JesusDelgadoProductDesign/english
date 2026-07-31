import type { TopicId } from "@/domain/grammarTopic";
import { accuracyFor } from "@/domain/grammarProgress";
import { getGrammarProgressRepository, getProgressRepository } from "@/services/repositories/activeRepositories";

export interface WeaknessEntry {
  kind: "verb" | "grammar";
  topicId: TopicId;
  /** verbId:field for verbs, patternId for grammar. */
  key: string;
  accuracy: number;
  attempts: number;
}

/**
 * Ranks every practiced-or-practicable unit (verb field + grammar pattern) by
 * accuracy, weakest first. Unattempted verb fields (confidence starts at 0,
 * see srs.ts) are naturally already at the bottom; unattempted grammar
 * patterns aren't included here at all — pickPattern already defaults them to
 * 0.5 within a topic, so listing them here would double-count that bias.
 */
export async function getUnifiedWeaknessRanking(): Promise<WeaknessEntry[]> {
  const [srsCards, grammarStats] = await Promise.all([
    getProgressRepository().getAll(),
    getGrammarProgressRepository().getAll(),
  ]);

  const verbEntries: WeaknessEntry[] = srsCards
    .filter((c) => c.totalAttempts > 0)
    .map((c) => ({
      kind: "verb",
      topicId: "irregular-verbs",
      key: `${c.verbId}:${c.field}`,
      accuracy: c.confidence,
      attempts: c.totalAttempts,
    }));

  const grammarEntries: WeaknessEntry[] = grammarStats
    .filter((s) => s.totalAttempts > 0)
    .map((s) => ({
      kind: "grammar",
      topicId: s.topicId,
      key: s.patternId,
      accuracy: accuracyFor(s),
      attempts: s.totalAttempts,
    }));

  return [...verbEntries, ...grammarEntries].sort((a, b) => a.accuracy - b.accuracy);
}
