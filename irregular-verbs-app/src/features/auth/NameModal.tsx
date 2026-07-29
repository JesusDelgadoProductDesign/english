import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MAX_DISPLAY_NAME_LENGTH } from "@/domain/leaderboard";
import { useTranslation } from "@/i18n/useTranslation";

interface NameModalProps {
  onSave: (name: string) => void;
  onSkip: () => void;
}

/**
 * Asks for a display name to appear on the leaderboard. Skippable — skipping
 * assigns an auto-generated placeholder name (see leaderboardService) so
 * every visitor ends up with an entry, editable later from Settings.
 */
export function NameModal({ onSave, onSkip }: NameModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) onSave(name.trim());
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("leaderboard.chooseNameTitle")}
    >
      <Card className="my-auto max-h-[90vh] w-full max-w-sm space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("leaderboard.chooseNameTitle")}</h2>
          <button
            type="button"
            onClick={onSkip}
            aria-label={t("auth.close")}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-500">{t("leaderboard.chooseNameDescription")}</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            placeholder={t("leaderboard.namePlaceholder")}
            autoFocus
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-600 dark:bg-slate-800"
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            {t("leaderboard.saveName")}
          </Button>
        </form>

        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          {t("leaderboard.skipForNow")}
        </button>
      </Card>
    </div>,
    document.body,
  );
}
