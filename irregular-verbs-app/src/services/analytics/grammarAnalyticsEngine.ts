import type { TopicId } from "@/domain/grammarTopic";
import { accuracyFor } from "@/domain/grammarProgress";
import { getLiveGrammarTopics } from "@/domain/topicRegistry";
import { getGrammarProgressRepository } from "@/services/repositories/activeRepositories";

export interface PatternMasterySummary {
  patternId: string;
  accuracy: number;
  totalAttempts: number;
}

export interface TopicMasterySummary {
  topicId: TopicId;
  accuracy: number;
  totalAttempts: number;
  patterns: PatternMasterySummary[];
}

/** Per-topic (and per-pattern) accuracy for every live grammar topic — the "weakness" signal shown on the dashboard. */
export async function computeGrammarDashboardStats(): Promise<TopicMasterySummary[]> {
  const stats = await getGrammarProgressRepository().getAll();
  const statsByKey = new Map(stats.map((s) => [`${s.topicId}:${s.patternId}`, s] as const));

  return getLiveGrammarTopics().map((topic) => {
    const patterns: PatternMasterySummary[] = topic.patterns.map((pattern) => {
      const stat = statsByKey.get(`${topic.id}:${pattern.id}`);
      return {
        patternId: pattern.id,
        accuracy: stat ? accuracyFor(stat) : 0,
        totalAttempts: stat?.totalAttempts ?? 0,
      };
    });

    const totalAttempts = patterns.reduce((sum, p) => sum + p.totalAttempts, 0);
    const totalCorrect = topic.patterns.reduce((sum, pattern) => {
      const stat = statsByKey.get(`${topic.id}:${pattern.id}`);
      return sum + (stat?.totalCorrect ?? 0);
    }, 0);

    return {
      topicId: topic.id,
      accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      totalAttempts,
      patterns,
    };
  });
}
