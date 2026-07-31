import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import type { GrammarPatternStats } from "@/domain/grammarProgress";
import { accuracyFor } from "@/domain/grammarProgress";

function weightedPick<T>(items: T[], weightOf: (item: T) => number): T {
  const weights = items.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];

  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Picks which pattern (sub-form) within a topic to practice next, weighted
 * toward lower-accuracy/fewer-attempts patterns. Unattempted patterns default
 * to 0.5 accuracy so they get mixed in without dominating over genuinely-wrong-
 * often ones.
 */
export function pickPattern(bank: GrammarExerciseItem[], stats: GrammarPatternStats[], patternFilter?: string[]): string {
  const statsByPattern = new Map(stats.map((s) => [`${s.topicId}:${s.patternId}`, s] as const));
  const patternIds = [...new Set(bank.map((item) => item.patternId))].filter(
    (id) => !patternFilter || patternFilter.includes(id),
  );

  return weightedPick(patternIds, (patternId) => {
    const item = bank.find((i) => i.patternId === patternId);
    const stat = item ? statsByPattern.get(`${item.topicId}:${patternId}`) : undefined;
    const accuracy = stat ? accuracyFor(stat) : 0.5;
    return 1 - accuracy + 0.05;
  });
}
