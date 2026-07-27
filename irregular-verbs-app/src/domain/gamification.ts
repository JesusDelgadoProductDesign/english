export interface GamificationState {
  xp: number;
  level: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  unlockedAchievementIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalCorrect: number;
  totalAttempts: number;
  masteredCount: number;
  totalVerbs: number;
  currentStreakDays: number;
  level: number;
}

export function createInitialGamificationState(): GamificationState {
  return {
    xp: 0,
    level: 1,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActiveDate: null,
    unlockedAchievementIds: [],
  };
}

/** Cumulative XP required to *reach* a given level (level 1 starts at 0 XP). */
export function xpForLevel(level: number): number {
  return (level - 1) * 100;
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/** XP earned so far within the current level, and how much is needed for the next one. */
export function levelProgress(xp: number): { current: number; needed: number } {
  const level = levelForXp(xp);
  return { current: xp - xpForLevel(level), needed: xpForLevel(level + 1) - xpForLevel(level) };
}
