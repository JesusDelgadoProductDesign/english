import type { StorageAdapter } from "../storage/storageAdapter";
import { storage } from "../storage/storageAdapter";
import type { AttemptRecord } from "@/domain/practice";
import type { IHistoryRepository } from "./interfaces";
import { todayKey, type DailyActivity } from "./historyTypes";

const ATTEMPTS_KEY = "attempts";
const DAILY_KEY = "daily-activity";

/** Keep enough raw attempts for weakest/strongest/most-reviewed analytics without unbounded growth. */
const MAX_ATTEMPTS = 1000;

/** Guest/local path — attempt history + daily aggregates persisted to localStorage. */
export class LocalHistoryRepository implements IHistoryRepository {
  constructor(private readonly adapter: StorageAdapter = storage) {}

  async getAttempts(): Promise<AttemptRecord[]> {
    return this.adapter.get<AttemptRecord[]>(ATTEMPTS_KEY) ?? [];
  }

  async addAttempt(attempt: AttemptRecord, xpEarned: number): Promise<void> {
    const attempts = await this.getAttempts();
    attempts.push(attempt);
    if (attempts.length > MAX_ATTEMPTS) attempts.splice(0, attempts.length - MAX_ATTEMPTS);
    this.adapter.set(ATTEMPTS_KEY, attempts);

    const daily = await this.getDailyActivity();
    const key = todayKey(new Date(attempt.timestamp));
    const entry = daily[key] ?? { date: key, attempts: 0, correct: 0, xpEarned: 0, studyTimeMs: 0 };
    entry.attempts += 1;
    entry.correct += attempt.results.every((r) => r.correct) ? 1 : 0;
    entry.xpEarned += xpEarned;
    entry.studyTimeMs += attempt.responseTimeMs;
    daily[key] = entry;
    this.adapter.set(DAILY_KEY, daily);
  }

  async getDailyActivity(): Promise<Record<string, DailyActivity>> {
    return this.adapter.get<Record<string, DailyActivity>>(DAILY_KEY) ?? {};
  }

  async reset(): Promise<void> {
    this.adapter.remove(ATTEMPTS_KEY);
    this.adapter.remove(DAILY_KEY);
  }
}

export const localHistoryRepository = new LocalHistoryRepository();
