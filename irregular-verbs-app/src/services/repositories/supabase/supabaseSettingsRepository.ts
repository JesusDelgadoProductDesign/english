import type { UserSettings, UiLanguage } from "@/domain/settings";
import { createDefaultSettings } from "@/domain/settings";
import type { DifficultyLevel, FeedbackMode, HintType, PracticeMode, SelectionStrategy } from "@/domain/practice";
import type { ISettingsRepository } from "../interfaces";
import { requireSupabaseContext } from "./supabaseHelpers";

interface SettingsRow {
  preferred_mode: string;
  selection_strategy: string;
  difficulty: string;
  feedback_mode: string;
  enabled_hints: string[];
  audio_enabled: boolean;
  daily_goal: number;
  language?: string;
}

function fromRow(row: SettingsRow): UserSettings {
  return {
    preferredMode: row.preferred_mode as PracticeMode | "auto-mix",
    selectionStrategy: row.selection_strategy as SelectionStrategy,
    difficulty: row.difficulty as DifficultyLevel,
    feedbackMode: row.feedback_mode as FeedbackMode,
    enabledHints: row.enabled_hints as HintType[],
    audioEnabled: row.audio_enabled,
    dailyGoal: row.daily_goal,
    // Falls back to English if the `language` column hasn't been added yet.
    language: (row.language as UiLanguage | undefined) ?? "en",
  };
}

function toRow(settings: UserSettings, userId: string) {
  return {
    user_id: userId,
    preferred_mode: settings.preferredMode,
    selection_strategy: settings.selectionStrategy,
    difficulty: settings.difficulty,
    feedback_mode: settings.feedbackMode,
    enabled_hints: settings.enabledHints,
    audio_enabled: settings.audioEnabled,
    daily_goal: settings.dailyGoal,
    language: settings.language,
  };
}

/** Signed-in path — one `user_settings` row per user (RLS-scoped). */
export class SupabaseSettingsRepository implements ISettingsRepository {
  async get(): Promise<UserSettings> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? { ...createDefaultSettings(), ...fromRow(data as SettingsRow) } : createDefaultSettings();
  }

  async save(settings: UserSettings): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("user_settings").upsert(toRow(settings, userId), { onConflict: "user_id" });
    if (error) throw error;
  }

  async reset(): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("user_settings").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

export const supabaseSettingsRepository = new SupabaseSettingsRepository();
