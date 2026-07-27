import type { AchievementContext, GamificationState } from "@/domain/gamification";
import { levelForXp } from "@/domain/gamification";
import { ACHIEVEMENTS } from "@/domain/achievements";
import { todayKey } from "@/services/repositories/historyTypes";

const BASE_XP_PER_CORRECT_FIELD = 5;
const HINT_PENALTY = 1;
const PERFECT_ITEM_BONUS = 5;

export interface XpBreakdown {
  xpEarned: number;
  leveledUp: boolean;
  newAchievements: string[];
}

/** XP for one practice item: per-field base reward, small hint penalty, bonus for a hint-free perfect answer. */
export function computeXpForItem(correctFields: number, totalFields: number, hintsUsed: number): number {
  const base = correctFields * BASE_XP_PER_CORRECT_FIELD;
  const penalty = Math.min(base, hintsUsed * HINT_PENALTY);
  const bonus = correctFields === totalFields && hintsUsed === 0 ? PERFECT_ITEM_BONUS : 0;
  return Math.max(0, base - penalty + bonus);
}

/** Advances the daily streak based on the last active date, per calendar day (not per session). */
function applyStreak(state: GamificationState, now: Date): GamificationState {
  const today = todayKey(now);
  if (state.lastActiveDate === today) return state;

  const yesterday = todayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const continuesStreak = state.lastActiveDate === yesterday;
  const currentStreakDays = continuesStreak ? state.currentStreakDays + 1 : 1;

  return {
    ...state,
    currentStreakDays,
    longestStreakDays: Math.max(state.longestStreakDays, currentStreakDays),
    lastActiveDate: today,
  };
}

export function applyXpAndStreak(
  state: GamificationState,
  xpEarned: number,
  achievementCtx: Omit<AchievementContext, "level" | "currentStreakDays">,
  now: Date = new Date(),
): { state: GamificationState; result: XpBreakdown } {
  let next = applyStreak(state, now);
  const xp = next.xp + xpEarned;
  const level = levelForXp(xp);
  const leveledUp = level > next.level;

  const fullCtx: AchievementContext = { ...achievementCtx, level, currentStreakDays: next.currentStreakDays };
  const newAchievements = ACHIEVEMENTS.filter(
    (a) => !next.unlockedAchievementIds.includes(a.id) && a.check(fullCtx),
  ).map((a) => a.id);

  next = {
    ...next,
    xp,
    level,
    unlockedAchievementIds: [...next.unlockedAchievementIds, ...newAchievements],
  };

  return { state: next, result: { xpEarned, leveledUp, newAchievements } };
}
