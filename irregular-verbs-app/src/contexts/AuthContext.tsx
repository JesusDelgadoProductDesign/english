import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/services/supabase/client";
import { setCurrentUserId } from "@/services/supabase/sessionStore";
import { mergeLocalProgressIfNeeded } from "@/services/migration/mergeLocalProgress";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isSyncing: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const hadUserRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;

    async function handleSession(nextUser: User | null) {
      const isNewSignIn = !hadUserRef.current && Boolean(nextUser);
      hadUserRef.current = Boolean(nextUser);

      setCurrentUserId(nextUser?.id ?? null);
      setUser(nextUser);

      if (isNewSignIn && nextUser) {
        setIsSyncing(true);
        try {
          await mergeLocalProgressIfNeeded(nextUser.id);
        } finally {
          setIsSyncing(false);
        }
      }

      // Whichever repository set just became active (local <-> cloud), every
      // cached query is now reading from the wrong source until refetched.
      await queryClient.invalidateQueries();
    }

    supabase.auth.getSession().then(({ data }) => {
      hadUserRef.current = Boolean(data.session?.user);
      setCurrentUserId(data.session?.user?.id ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
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
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
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
