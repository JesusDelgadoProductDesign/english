import type { SrsCard } from "@/domain/srs";
import type { VerbField } from "@/domain/verb";
import type { GamificationState } from "@/domain/gamification";
import type { UserSettings } from "@/domain/settings";
import type { AttemptRecord } from "@/domain/practice";
import type { DailyActivity } from "./historyTypes";

/**
 * One interface per storage concern, implemented once for the guest/local path
 * (`Local*Repository`, backed by localStorage) and once for the signed-in path
 * (`Supabase*Repository`, backed by Postgres). `activeRepositories.ts` decides
 * which implementation the rest of the app talks to.
 */
export interface IProgressRepository {
  getAll(): Promise<SrsCard[]>;
  getOrCreate(verbId: string, field: VerbField): Promise<SrsCard>;
  save(card: SrsCard): Promise<void>;
  getForVerb(verbId: string): Promise<SrsCard[]>;
  reset(): Promise<void>;
}

export interface IGamificationRepository {
  get(): Promise<GamificationState>;
  save(state: GamificationState): Promise<void>;
  reset(): Promise<void>;
}

export interface ISettingsRepository {
  get(): Promise<UserSettings>;
  save(settings: UserSettings): Promise<void>;
  reset(): Promise<void>;
}

export interface IHistoryRepository {
  getAttempts(): Promise<AttemptRecord[]>;
  addAttempt(attempt: AttemptRecord, xpEarned: number): Promise<void>;
  getDailyActivity(): Promise<Record<string, DailyActivity>>;
  reset(): Promise<void>;
}
