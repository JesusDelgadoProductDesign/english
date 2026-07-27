import type { AttemptRecord } from "@/domain/practice";
import type { IHistoryRepository } from "../interfaces";
import { todayKey, type DailyActivity } from "../historyTypes";
import { requireSupabaseContext } from "./supabaseHelpers";

const RECENT_ATTEMPTS_LIMIT = 1000;

interface AttemptRow {
  verb_id: string;
  mode: string;
  results: AttemptRecord["results"];
  hints_used: number;
  response_time_ms: number;
  created_at: string;
}

interface DailyActivityRow {
  activity_date: string;
  attempts: number;
  correct: number;
  xp_earned: number;
  study_time_ms: number;
}

function fromAttemptRow(row: AttemptRow): AttemptRecord {
  return {
    verbId: row.verb_id,
    mode: row.mode as AttemptRecord["mode"],
    timestamp: row.created_at,
    results: row.results,
    hintsUsed: row.hints_used,
    responseTimeMs: row.response_time_ms,
  };
}

function fromDailyRow(row: DailyActivityRow): DailyActivity {
  return {
    date: row.activity_date,
    attempts: row.attempts,
    correct: row.correct,
    xpEarned: row.xp_earned,
    studyTimeMs: row.study_time_ms,
  };
}

/** Signed-in path — attempt log + daily aggregates (RLS-scoped to the current user). */
export class SupabaseHistoryRepository implements IHistoryRepository {
  async getAttempts(): Promise<AttemptRecord[]> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_ATTEMPTS_LIMIT);
    if (error) throw error;
    return (data as AttemptRow[]).map(fromAttemptRow).reverse();
  }

  async addAttempt(attempt: AttemptRecord, xpEarned: number): Promise<void> {
    const { client, userId } = requireSupabaseContext();

    const { error: insertError } = await client.from("attempts").insert({
      user_id: userId,
      verb_id: attempt.verbId,
      mode: attempt.mode,
      results: attempt.results,
      hints_used: attempt.hintsUsed,
      response_time_ms: attempt.responseTimeMs,
      created_at: attempt.timestamp,
    });
    if (insertError) throw insertError;

    const date = todayKey(new Date(attempt.timestamp));
    const { data: existing, error: selectError } = await client
      .from("daily_activity")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", date)
      .maybeSingle();
    if (selectError) throw selectError;

    const current: DailyActivity = existing
      ? fromDailyRow(existing as DailyActivityRow)
      : { date, attempts: 0, correct: 0, xpEarned: 0, studyTimeMs: 0 };

    const updated: DailyActivity = {
      date,
      attempts: current.attempts + 1,
      correct: current.correct + (attempt.results.every((r) => r.correct) ? 1 : 0),
      xpEarned: current.xpEarned + xpEarned,
      studyTimeMs: current.studyTimeMs + attempt.responseTimeMs,
    };

    const { error: upsertError } = await client.from("daily_activity").upsert(
      {
        user_id: userId,
        activity_date: updated.date,
        attempts: updated.attempts,
        correct: updated.correct,
        xp_earned: updated.xpEarned,
        study_time_ms: updated.studyTimeMs,
      },
      { onConflict: "user_id,activity_date" },
    );
    if (upsertError) throw upsertError;
  }

  async getDailyActivity(): Promise<Record<string, DailyActivity>> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client.from("daily_activity").select("*").eq("user_id", userId);
    if (error) throw error;
    const result: Record<string, DailyActivity> = {};
    for (const row of data as DailyActivityRow[]) {
      const activity = fromDailyRow(row);
      result[activity.date] = activity;
    }
    return result;
  }

  async reset(): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error: e1 } = await client.from("attempts").delete().eq("user_id", userId);
    if (e1) throw e1;
    const { error: e2 } = await client.from("daily_activity").delete().eq("user_id", userId);
    if (e2) throw e2;
  }
}

export const supabaseHistoryRepository = new SupabaseHistoryRepository();
