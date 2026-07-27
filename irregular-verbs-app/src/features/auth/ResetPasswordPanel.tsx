import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shown automatically whenever the user arrives via a Supabase password-reset
 * email link (see AuthContext's PASSWORD_RECOVERY handling). Not dismissible
 * by clicking outside — the user came here specifically to set a new password.
 */
export function ResetPasswordPanel() {
  const { updatePassword, cancelPasswordRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (result.error) setError(result.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Set a new password"
    >
      <Card className="my-auto max-h-[90vh] w-full max-w-sm space-y-4 overflow-y-auto">
        <h2 className="text-lg font-semibold">Set a new password</h2>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <div>
            <label htmlFor="reset-password-confirm" className="mb-1 block text-sm font-medium">
              Confirm new password
            </label>
            <input
              id="reset-password-confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait…" : "Update password"}
          </Button>
        </form>

        <button
          type="button"
          onClick={cancelPasswordRecovery}
          className="w-full text-center text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          Cancel
        </button>
      </Card>
    </div>,
    document.body,
  );
}
