import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { ALL_MODES } from "@/domain/practice";
import type { DifficultyLevel, FeedbackMode, HintType, PracticeMode, SelectionStrategy } from "@/domain/practice";
import type { UiLanguage } from "@/domain/settings";
import { useTranslation } from "@/i18n/useTranslation";

const STRATEGIES: SelectionStrategy[] = ["adaptive", "weighted", "random"];
const DIFFICULTIES: DifficultyLevel[] = ["easy", "medium", "hard"];
const FEEDBACK_MODES: FeedbackMode[] = [
  "immediate-correction",
  "hints-only",
  "progressive-hints",
  "explanation-after-failure",
  "retry-until-correct",
];
const HINTS: HintType[] = [
  "first-letter",
  "letter-count",
  "missing-vowels",
  "missing-consonants",
  "reveal-on-attempt",
];
const LANGUAGES: UiLanguage[] = ["en", "es"];

export function SettingsView() {
  const { t } = useTranslation();
  const { settings, error, updateSettings } = useSettings();

  if (!settings && error) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>{t("common.retry")}</Button>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <p className="text-sm text-slate-500">{t("settingsPage.loadingSettings")}</p>
      </Card>
    );
  }

  function toggleHint(hint: HintType) {
    if (!settings) return;
    const enabled = settings.enabledHints.includes(hint)
      ? settings.enabledHints.filter((h) => h !== hint)
      : [...settings.enabledHints, hint];
    updateSettings({ enabledHints: enabled });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.language")}</h2>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => updateSettings({ language: lang })}
              aria-pressed={settings.language === lang}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                settings.language === lang
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {lang === "en" ? t("settingsPage.languageEnglish") : t("settingsPage.languageSpanish")}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.practiceMode")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <input
              type="radio"
              name="mode"
              checked={settings.preferredMode === "auto-mix"}
              onChange={() => updateSettings({ preferredMode: "auto-mix" })}
            />
            <span>
              <span className="block font-medium">{t("modes.auto-mix.label")}</span>
              <span className="block text-xs text-slate-500">{t("modes.auto-mix.description")}</span>
            </span>
          </label>
          {ALL_MODES.map((mode) => (
            <label key={mode.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="radio"
                name="mode"
                checked={settings.preferredMode === mode.id}
                onChange={() => updateSettings({ preferredMode: mode.id as PracticeMode })}
              />
              <span>
                <span className="block font-medium">{t(`modes.${mode.id}.label`)}</span>
                <span className="block text-xs text-slate-500">{t(`modes.${mode.id}.description`)}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.verbSelection")}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {STRATEGIES.map((s) => (
            <label key={s} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="radio"
                name="strategy"
                checked={settings.selectionStrategy === s}
                onChange={() => updateSettings({ selectionStrategy: s })}
              />
              <span>
                <span className="block font-medium">{t(`strategies.${s}.label`)}</span>
                <span className="block text-xs text-slate-500">{t(`strategies.${s}.description`)}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.difficultyTitle")}</h2>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateSettings({ difficulty: d })}
              aria-pressed={settings.difficulty === d}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                settings.difficulty === d
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {t(`difficulty.${d}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.feedbackStyle")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {FEEDBACK_MODES.map((f) => (
            <label key={f} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="radio"
                name="feedback"
                checked={settings.feedbackMode === f}
                onChange={() => updateSettings({ feedbackMode: f })}
              />
              <span>
                <span className="block font-medium">{t(`feedbackModes.${f}.label`)}</span>
                <span className="block text-xs text-slate-500">{t(`feedbackModes.${f}.description`)}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.hintsAvailable")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {HINTS.map((h) => (
            <label key={h} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input type="checkbox" checked={settings.enabledHints.includes(h)} onChange={() => toggleHint(h)} />
              <span>{t(`hints.${h}`)}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("settingsPage.other")}</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
            />
            <span>{t("settingsPage.pronunciationAudio")}</span>
          </label>
          <label className="flex items-center gap-3">
            <span>{t("settingsPage.dailyGoal")}</span>
            <input
              type="number"
              min={5}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) || settings.dailyGoal })}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-500">{t("settingsPage.questionsPerDay")}</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
