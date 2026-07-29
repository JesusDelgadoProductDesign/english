import type { User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";
import { currentWeekStart, type LeaderboardEntry } from "@/domain/leaderboard";

const LAST_ANON_USER_ID_KEY = "verbly:last-anon-user-id";

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  weekly_xp: number;
  week_start: string;
}

function rowToEntry(row: LeaderboardRow): LeaderboardEntry {
  return { userId: row.user_id, displayName: row.display_name, weeklyXp: row.weekly_xp, weekStart: row.week_start };
}

/** The current Supabase session's user, anonymous or real — or null if there isn't one yet. */
async function getCurrentSessionUser(): Promise<User | null> {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Creates a lightweight anonymous session if no session exists yet at all. */
async function getOrCreateSessionUser(): Promise<User | null> {
  if (!supabase) return null;
  const existing = await getCurrentSessionUser();
  if (existing) return existing;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (data.user) window.localStorage.setItem(LAST_ANON_USER_ID_KEY, data.user.id);
  return data.user;
}

/** Top N entries for the current week, ranked by weekly XP. */
export async function getTopEntries(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .eq("week_start", currentWeekStart())
    .order("weekly_xp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as LeaderboardRow[]).map(rowToEntry);
}

/** The current session's own leaderboard entry, if they have one. */
export async function getMyEntry(): Promise<LeaderboardEntry | null> {
  if (!supabase) return null;
  const user = await getCurrentSessionUser();
  if (!user) return null;
  const { data, error } = await supabase.from("leaderboard_entries").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data ? rowToEntry(data as LeaderboardRow) : null;
}

/** 1-based rank for a given weekly XP total (how many people this week scored strictly higher). */
export async function getRankForXp(weeklyXp: number): Promise<number> {
  if (!supabase) return 1;
  const { count, error } = await supabase
    .from("leaderboard_entries")
    .select("*", { count: "exact", head: true })
    .eq("week_start", currentWeekStart())
    .gt("weekly_xp", weeklyXp);
  if (error) throw error;
  return (count ?? 0) + 1;
}

/** Whether the current session already has a leaderboard display name set. */
export async function getMyDisplayName(): Promise<string | null> {
  const entry = await getMyEntry();
  return entry?.displayName ?? null;
}

/**
 * Sets (or creates) the current session's display name. Creates a lightweight
 * anonymous auth session first if none exists — this is the only thing that
 * session is used for; it does not enable cloud sync of practice progress.
 * Never touches weekly_xp, so renaming never resets a score.
 */
export async function setDisplayName(name: string): Promise<void> {
  if (!supabase) return;
  const user = await getOrCreateSessionUser();
  if (!user) return;

  const { data: existing, error: selectError } = await supabase
    .from("leaderboard_entries")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase.from("leaderboard_entries").update({ display_name: name }).eq("user_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("leaderboard_entries")
      .insert({ user_id: user.id, display_name: name, weekly_xp: 0, week_start: currentWeekStart() });
    if (error) throw error;
  }
}

/**
 * Adds XP earned from one practice item to the current session's weekly total.
 * A no-op if the session has no leaderboard identity yet (name never set) —
 * best-effort and silent by design, so a leaderboard hiccup never blocks grading.
 */
export async function recordXp(amount: number): Promise<void> {
  if (!supabase || amount <= 0) return;
  const user = await getCurrentSessionUser();
  if (!user) return;

  const { data: existing, error: selectError } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!existing) return; // no display name set yet — not on the leaderboard

  const week = currentWeekStart();
  const row = existing as LeaderboardRow;
  const nextXp = row.week_start === week ? row.weekly_xp + amount : amount;

  const { error } = await supabase
    .from("leaderboard_entries")
    .update({ weekly_xp: nextXp, week_start: week })
    .eq("user_id", user.id);
  if (error) throw error;
}

/**
 * Best-effort carry-over when a guest with an anonymous leaderboard entry
 * creates or signs into a real account: copies their name + weekly XP onto
 * the new (different) user_id if it doesn't already have its own entry.
 * The old anonymous row is left behind rather than deleted (RLS scopes
 * deletes to the owner, and the new account isn't the owner of that row).
 */
export async function migrateAnonymousEntry(newUserId: string): Promise<void> {
  if (!supabase) return;
  const anonId = window.localStorage.getItem(LAST_ANON_USER_ID_KEY);
  if (!anonId || anonId === newUserId) return;

  const { data: mineAlready } = await supabase
    .from("leaderboard_entries")
    .select("user_id")
    .eq("user_id", newUserId)
    .maybeSingle();
  if (mineAlready) return;

  const { data: anonEntry } = await supabase.from("leaderboard_entries").select("*").eq("user_id", anonId).maybeSingle();
  if (!anonEntry) return;

  const row = anonEntry as LeaderboardRow;
  await supabase.from("leaderboard_entries").insert({
    user_id: newUserId,
    display_name: row.display_name,
    weekly_xp: row.weekly_xp,
    week_start: row.week_start,
  });
  window.localStorage.removeItem(LAST_ANON_USER_ID_KEY);
}
