export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  weeklyXp: number;
  weekStart: string; // YYYY-MM-DD, Monday of the tracked week
}

/** ISO week start (Monday, UTC) for the given date, as YYYY-MM-DD. */
export function currentWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function generatePlaceholderName(): string {
  const suffix = 1000 + Math.floor(Math.random() * 9000);
  return `Learner ${suffix}`;
}

export const MAX_DISPLAY_NAME_LENGTH = 24;
