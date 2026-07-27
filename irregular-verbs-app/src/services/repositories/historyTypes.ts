export interface DailyActivity {
  date: string; // YYYY-MM-DD
  attempts: number;
  correct: number;
  xpEarned: number;
  studyTimeMs: number;
}

export function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
