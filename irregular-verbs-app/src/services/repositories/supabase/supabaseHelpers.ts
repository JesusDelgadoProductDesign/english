import { supabase } from "@/services/supabase/client";
import { requireCurrentUserId } from "@/services/supabase/sessionStore";

/** Every Supabase-backed repository method needs both a configured client and a signed-in user. */
export function requireSupabaseContext() {
  if (!supabase) throw new Error("Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)");
  return { client: supabase, userId: requireCurrentUserId() };
}
