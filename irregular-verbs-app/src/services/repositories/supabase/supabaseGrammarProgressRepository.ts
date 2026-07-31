import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarPatternStats } from "@/domain/grammarProgress";
import type { IGrammarProgressRepository } from "../interfaces";
import { requireSupabaseContext } from "./supabaseHelpers";

interface GrammarPatternStatsRow {
  topic_id: string;
  pattern_id: string;
  total_attempts: number;
  total_correct: number;
  last_attempted_at: string | null;
}

function fromRow(row: GrammarPatternStatsRow): GrammarPatternStats {
  return {
    topicId: row.topic_id as TopicId,
    patternId: row.pattern_id,
    totalAttempts: row.total_attempts,
    totalCorrect: row.total_correct,
    lastAttemptedAt: row.last_attempted_at,
  };
}

/** Signed-in path — one `grammar_pattern_stats` row per (user, topic, pattern), RLS-scoped. */
export class SupabaseGrammarProgressRepository implements IGrammarProgressRepository {
  async getAll(): Promise<GrammarPatternStats[]> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client.from("grammar_pattern_stats").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data as GrammarPatternStatsRow[]).map(fromRow);
  }

  async recordAttempt(topicId: TopicId, patternId: string, correct: boolean, at: Date): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { data: existing, error: selectError } = await client
      .from("grammar_pattern_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .eq("pattern_id", patternId)
      .maybeSingle();
    if (selectError) throw selectError;

    const row = existing as GrammarPatternStatsRow | null;
    const { error } = await client.from("grammar_pattern_stats").upsert(
      {
        user_id: userId,
        topic_id: topicId,
        pattern_id: patternId,
        total_attempts: (row?.total_attempts ?? 0) + 1,
        total_correct: (row?.total_correct ?? 0) + (correct ? 1 : 0),
        last_attempted_at: at.toISOString(),
        updated_at: at.toISOString(),
      },
      { onConflict: "user_id,topic_id,pattern_id" },
    );
    if (error) throw error;
  }

  async reset(): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("grammar_pattern_stats").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

export const supabaseGrammarProgressRepository = new SupabaseGrammarProgressRepository();
