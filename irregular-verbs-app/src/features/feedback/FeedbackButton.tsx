import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { FeedbackForm } from "@/features/feedback/FeedbackForm";

export function FeedbackButton() {
  const { isConfigured } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConfigured) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-700 sm:bottom-6"
      >
        <span aria-hidden="true">💬</span>
        {t("feedbackForm.buttonLabel")}
      </button>
      {isOpen && <FeedbackForm onClose={() => setIsOpen(false)} />}
    </>
  );
}
