import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

interface AuthPanelProps {
  onClose: () => void;
}

type Mode = "sign-in" | "sign-up" | "forgot-password";

const TITLES: Record<Mode, string> = {
  "sign-in": "Sign in",
  "sign-up": "Create account",
  "forgot-password": "Reset password",
};

export function AuthPanel({ onClose }: AuthPanelProps) {
  const { signInWithPassword, signUpWithPassword, sendPasswordResetEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      if (mode === "forgot-password") {
        const result = await sendPasswordResetEmail(email);
        if (result.error) setError(result.error);
        else setInfo("Check your email for a password reset link.");
        return;
      }

      const result =
        mode === "sign-in" ? await signInWithPassword(email, password) : await signUpWithPassword(email, password);
      if (result.error) {
        setError(result.error);
      } else if (mode === "sign-up") {
        setInfo("Check your email to confirm your account, then sign in.");
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onClick={onClose}
    >
      <Card
        className="my-auto max-h-[90vh] w-full max-w-sm space-y-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{TITLES[mode]}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="auth-email"
              ref={firstFieldRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>

          {mode !== "forgot-password" && (
            <div>
              <label htmlFor="auth-password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
              />
              {mode === "sign-in" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot-password")}
                  className="mt-1 text-xs text-brand-600 hover:underline dark:text-brand-400"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {info && <p className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : mode === "sign-up"
                  ? "Create account"
                  : "Send reset link"}
          </Button>
        </form>

        {mode === "forgot-password" ? (
          <button
            type="button"
            onClick={() => switchMode("sign-in")}
            className="w-full text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            className="w-full text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        )}
      </Card>
    </div>,
    document.body,
  );
}
