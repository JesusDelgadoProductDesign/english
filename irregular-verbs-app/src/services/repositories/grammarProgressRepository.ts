import type { StorageAdapter } from "../storage/storageAdapter";
import { storage } from "../storage/storageAdapter";
import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarPatternStats } from "@/domain/grammarProgress";
import { createInitialPatternStats } from "@/domain/grammarProgress";
import type { IGrammarProgressRepository } from "./interfaces";

const KEY = "grammar-progress";

function statsKey(topicId: TopicId, patternId: string): string {
  return `${topicId}:${patternId}`;
}

/** Guest/local path — per-(topic, pattern) accuracy aggregates persisted to localStorage. */
export class LocalGrammarProgressRepository implements IGrammarProgressRepository {
  constructor(private readonly adapter: StorageAdapter = storage) {}

  async getAll(): Promise<GrammarPatternStats[]> {
    const map = this.adapter.get<Record<string, GrammarPatternStats>>(KEY) ?? {};
    return Object.values(map);
  }

  async recordAttempt(topicId: TopicId, patternId: string, correct: boolean, at: Date): Promise<void> {
    const map = this.adapter.get<Record<string, GrammarPatternStats>>(KEY) ?? {};
    const key = statsKey(topicId, patternId);
    const stats = map[key] ?? createInitialPatternStats(topicId, patternId);
    stats.totalAttempts += 1;
    if (correct) stats.totalCorrect += 1;
    stats.lastAttemptedAt = at.toISOString();
    map[key] = stats;
    this.adapter.set(KEY, map);
  }

  async reset(): Promise<void> {
    this.adapter.remove(KEY);
  }
}

export const localGrammarProgressRepository = new LocalGrammarProgressRepository();
