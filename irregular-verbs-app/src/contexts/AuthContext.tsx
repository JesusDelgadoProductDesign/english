import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/services/supabase/client";
import { setCurrentUserId } from "@/services/supabase/sessionStore";
import { mergeLocalProgressIfNeeded } from "@/services/migration/mergeLocalProgress";
import { migrateAnonymousEntry } from "@/services/leaderboard/leaderboardService";

interface AuthContextValue {
  /** Null for both "no session" and "anonymous leaderboard-only session" — this is "real sign-in" only. */
  user: User | null;
  isLoading: boolean;
  isSyncing: boolean;
  isConfigured: boolean;
  /** True while the app is showing the "set a new password" step after the user followed a reset-password email link. */
  isPasswordRecovery: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  cancelPasswordRecovery: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Anonymous sessions (created solely to give guests a leaderboard identity,
 * see leaderboardService) must never look like a real sign-in to the rest of
 * the app — no cloud sync of practice data, no "Sign out" in the header.
 */
function realUserOnly(nextUser: User | null): User | null {
  return nextUser && !nextUser.is_anonymous ? nextUser : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const queryClient = useQueryClient();
  const hadUserRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;

    async function handleSession(nextUser: User | null) {
      const realUser = realUserOnly(nextUser);
      const isNewSignIn = !hadUserRef.current && Boolean(realUser);
      hadUserRef.current = Boolean(realUser);

      setCurrentUserId(realUser?.id ?? null);
      setUser(realUser);

      if (isNewSignIn && realUser) {
        setIsSyncing(true);
        try {
          await mergeLocalProgressIfNeeded(realUser.id);
          await migrateAnonymousEntry(realUser.id);
        } catch (err) {
          // Don't let a merge failure (e.g. tables not yet provisioned) block
          // the repository switch below — the signed-in queries will surface
          // their own errors instead of leaving the app stuck mid sign-in.
          console.error("Failed to merge local progress into account:", err);
        } finally {
          setIsSyncing(false);
        }
      }

      // Whichever repository set just became active (local <-> cloud), every
      // cached query is now reading from the wrong source until refetched.
      await queryClient.invalidateQueries();
    }

    supabase.auth.getSession().then(({ data }) => {
      const realUser = realUserOnly(data.session?.user ?? null);
      hadUserRef.current = Boolean(realUser);
      setCurrentUserId(realUser?.id ?? null);
      setUser(realUser);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // A recovery-flow session, not a real sign-in — surface the "set a new
        // password" step instead of treating this as the user logging in.
        setIsPasswordRecovery(true);
        setUser(session?.user ?? null);
        setCurrentUserId(session?.user?.id ?? null);
        return;
      }
      handleSession(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signInWithPassword(email: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUpWithPassword(email: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function sendPasswordResetEmail(email: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  }

  async function updatePassword(newPassword: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };

    setIsPasswordRecovery(false);
    // The recovery session is now a normal one — run it through the same
    // sign-in handling (merge check is idempotent; a returning user's cloud
    // data already exists, so this is a no-op for them).
    hadUserRef.current = false;
    setCurrentUserId(user?.id ?? null);
    if (user) {
      setIsSyncing(true);
      try {
        await mergeLocalProgressIfNeeded(user.id);
        await migrateAnonymousEntry(user.id);
      } finally {
        setIsSyncing(false);
      }
    }
    hadUserRef.current = Boolean(user);
    await queryClient.invalidateQueries();
    return { error: null };
  }

  function cancelPasswordRecovery() {
    setIsPasswordRecovery(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSyncing,
        isConfigured: isSupabaseConfigured,
        isPasswordRecovery,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        sendPasswordResetEmail,
        updatePassword,
        cancelPasswordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used within an AuthProvider");
  return ctx;
}
