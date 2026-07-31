import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { FEEDBACK_CATEGORIES, MAX_FEEDBACK_MESSAGE_LENGTH } from "@/domain/feedback";
import { submitFeedback } from "@/services/feedback/feedbackService";

interface FeedbackFormProps {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await submitFeedback({
        category,
        message: message.trim(),
        contactEmail,
        page: location.pathname,
        language,
      });
      setIsSent(true);
    } catch {
      setError(t("feedbackForm.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("feedbackForm.title")}
      onClick={onClose}
    >
      <Card className="my-auto max-h-[90vh] w-full max-w-sm space-y-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("feedbackForm.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("auth.close")}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {isSent ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{t("feedbackForm.thanks")}</p>
            <Button type="button" className="w-full" onClick={onClose}>
              {t("feedbackForm.close")}
            </Button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="feedback-category" className="mb-1 block text-sm font-medium">
                {t("feedbackForm.categoryLabel")}
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`feedbackForm.categories.${c}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium">
                {t("feedbackForm.messageLabel")}
              </label>
              <textarea
                id="feedback-message"
                required
                rows={4}
                maxLength={MAX_FEEDBACK_MESSAGE_LENGTH}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackForm.messagePlaceholder")}
                autoFocus
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            <div>
              <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium">
                {t("feedbackForm.emailLabel")}
                <span className="ml-1 font-normal text-slate-400">{t("feedbackForm.optional")}</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder={t("feedbackForm.emailPlaceholder")}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? t("auth.pleaseWait") : t("feedbackForm.submit")}
            </Button>
          </form>
        )}
      </Card>
    </div>,
    document.body,
  );
}
