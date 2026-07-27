import type { GamificationState } from "@/domain/gamification";
import { createInitialGamificationState } from "@/domain/gamification";
import type { IGamificationRepository } from "../interfaces";
import { requireSupabaseContext } from "./supabaseHelpers";

interface GamificationRow {
  xp: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_date: string | null;
  unlocked_achievement_ids: string[];
}

function fromRow(row: GamificationRow): GamificationState {
  return {
    xp: row.xp,
    level: row.level,
    currentStreakDays: row.current_streak_days,
    longestStreakDays: row.longest_streak_days,
    lastActiveDate: row.last_active_date,
    unlockedAchievementIds: row.unlocked_achievement_ids,
  };
}

function toRow(state: GamificationState, userId: string) {
  return {
    user_id: userId,
    xp: state.xp,
    level: state.level,
    current_streak_days: state.currentStreakDays,
    longest_streak_days: state.longestStreakDays,
    last_active_date: state.lastActiveDate,
    unlocked_achievement_ids: state.unlockedAchievementIds,
  };
}

/** Signed-in path — one `gamification_state` row per user (RLS-scoped). */
export class SupabaseGamificationRepository implements IGamificationRepository {
  async get(): Promise<GamificationState> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client.from("gamification_state").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as GamificationRow) : createInitialGamificationState();
  }

  async save(state: GamificationState): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("gamification_state").upsert(toRow(state, userId), { onConflict: "user_id" });
    if (error) throw error;
  }

  async reset(): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("gamification_state").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

export const supabaseGamificationRepository = new SupabaseGamificationRepository();
