import { supabase } from "@/services/supabase/client";
import { localProgressRepository } from "@/services/repositories/progressRepository";
import { localGamificationRepository } from "@/services/repositories/gamificationRepository";
import { localSettingsRepository } from "@/services/repositories/settingsRepository";
import { localHistoryRepository } from "@/services/repositories/historyRepository";
import { supabaseProgressRepository } from "@/services/repositories/supabase/supabaseProgressRepository";
import { supabaseGamificationRepository } from "@/services/repositories/supabase/supabaseGamificationRepository";
import { supabaseSettingsRepository } from "@/services/repositories/supabase/supabaseSettingsRepository";

/**
 * Runs once per account, right after the very first sign-in. If the account
 * already has cloud data (returning user on a new device), this is a no-op —
 * cloud data wins and the local guest data is left untouched but inactive.
 * Local data is never deleted here: if the user signs out, guest mode should
 * resume exactly as it was before the merge.
 */
export async function mergeLocalProgressIfNeeded(userId: string): Promise<void> {
  if (!supabase) return;

  const { data: existing, error: checkError } = await supabase
    .from("gamification_state")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (checkError) throw checkError;
  if (existing) return; // returning user, another device already has cloud data

  const [cards, gamification, settings, attempts, dailyActivity] = await Promise.all([
    localProgressRepository.getAll(),
    localGamificationRepository.get(),
    localSettingsRepository.get(),
    localHistoryRepository.getAttempts(),
    localHistoryRepository.getDailyActivity(),
  ]);

  if (cards.length === 0 && attempts.length === 0) return; // brand new guest, nothing to migrate

  await Promise.all(cards.map((card) => supabaseProgressRepository.save(card)));
  await supabaseGamificationRepository.save(gamification);
  await supabaseSettingsRepository.save(settings);

  // Copied directly rather than replayed through addAttempt(): the per-attempt
  // XP earned isn't stored on AttemptRecord (only folded into the daily
  // aggregate at the time it happened), so the already-computed local
  // aggregates are the source of truth here, not a recomputation.
  if (attempts.length > 0) {
    const { error } = await supabase.from("attempts").insert(
      attempts.map((attempt) => ({
        user_id: userId,
        verb_id: attempt.verbId,
        mode: attempt.mode,
        results: attempt.results,
        hints_used: attempt.hintsUsed,
        response_time_ms: attempt.responseTimeMs,
        created_at: attempt.timestamp,
      })),
    );
    if (error) throw error;
  }

  const dailyRows = Object.values(dailyActivity);
  if (dailyRows.length > 0) {
    const { error } = await supabase.from("daily_activity").upsert(
      dailyRows.map((day) => ({
        user_id: userId,
        activity_date: day.date,
        attempts: day.attempts,
        correct: day.correct,
        xp_earned: day.xpEarned,
        study_time_ms: day.studyTimeMs,
      })),
      { onConflict: "user_id,activity_date" },
    );
    if (error) throw error;
  }
}
