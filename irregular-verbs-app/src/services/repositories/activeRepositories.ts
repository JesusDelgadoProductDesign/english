import { getCurrentUserId } from "@/services/supabase/sessionStore";
import { localProgressRepository } from "./progressRepository";
import { localGamificationRepository } from "./gamificationRepository";
import { localSettingsRepository } from "./settingsRepository";
import { localHistoryRepository } from "./historyRepository";
import { localGrammarProgressRepository } from "./grammarProgressRepository";
import { supabaseProgressRepository } from "./supabase/supabaseProgressRepository";
import { supabaseGamificationRepository } from "./supabase/supabaseGamificationRepository";
import { supabaseSettingsRepository } from "./supabase/supabaseSettingsRepository";
import { supabaseHistoryRepository } from "./supabase/supabaseHistoryRepository";
import { supabaseGrammarProgressRepository } from "./supabase/supabaseGrammarProgressRepository";
import type {
  IGamificationRepository,
  IGrammarProgressRepository,
  IHistoryRepository,
  IProgressRepository,
  ISettingsRepository,
} from "./interfaces";

/**
 * Resolves which concrete repository implementation is active right now:
 * signed-in users get the Supabase-backed ones, guests get the localStorage
 * ones. Call these at the point of use (not once at import time) — the answer
 * can change mid-session as the user signs in or out.
 */
export function getProgressRepository(): IProgressRepository {
  return getCurrentUserId() ? supabaseProgressRepository : localProgressRepository;
}

export function getGamificationRepository(): IGamificationRepository {
  return getCurrentUserId() ? supabaseGamificationRepository : localGamificationRepository;
}

export function getSettingsRepository(): ISettingsRepository {
  return getCurrentUserId() ? supabaseSettingsRepository : localSettingsRepository;
}

export function getHistoryRepository(): IHistoryRepository {
  return getCurrentUserId() ? supabaseHistoryRepository : localHistoryRepository;
}

export function getGrammarProgressRepository(): IGrammarProgressRepository {
  return getCurrentUserId() ? supabaseGrammarProgressRepository : localGrammarProgressRepository;
}
