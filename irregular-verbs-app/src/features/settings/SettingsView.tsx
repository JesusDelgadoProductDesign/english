import { Card } from "@/components/ui/Card";
import { useSettings } from "@/hooks/useSettings";
import { ALL_MODES } from "@/domain/practice";
import type { DifficultyLevel, FeedbackMode, HintType, PracticeMode, SelectionStrategy } from "@/domain/practice";

const STRATEGIES: { id: SelectionStrategy; label: string; description: string }[] = [
  { id: "adaptive", label: "Adaptive", description: "Prioritizes verbs due for review and your weakest fields." },
  { id: "weighted", label: "Weighted random", description: "Weaker verbs appear more often, but never disappear." },
  { id: "random", label: "Completely random", description: "Every verb has an equal chance each time." },
];

const DIFFICULTIES: { id: DifficultyLevel; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const FEEDBACK_MODES: { id: FeedbackMode; label: string; description: string }[] = [
  { id: "immediate-correction", label: "Immediate correction", description: "See right/wrong and the answer as soon as you submit." },
  { id: "hints-only", label: "Hints only", description: "Wrong answers just say \"not quite\" — lean on hints instead." },
  { id: "progressive-hints", label: "Progressive hints", description: "Same as immediate, paired with the hint system." },
  { id: "explanation-after-failure", label: "Explanation after failure", description: "See the correct forms and example sentences after submitting." },
  { id: "retry-until-correct", label: "Retry until correct", description: "Keep trying the same question until every field is right." },
];

const HINTS: { id: HintType; label: string }[] = [
  { id: "first-letter", label: "First letter" },
  { id: "letter-count", label: "Number of letters" },
  { id: "missing-vowels", label: "Missing vowels" },
  { id: "missing-consonants", label: "Missing consonants" },
  { id: "reveal-on-attempt", label: "Reveal a letter per wrong attempt" },
];

export function SettingsView() {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

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
        <h2 className="mb-3 text-lg font-semibold">Practice mode</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <input
              type="radio"
              name="mode"
              checked={settings.preferredMode === "auto-mix"}
              onChange={() => updateSettings({ preferredMode: "auto-mix" })}
            />
            <span>
              <span className="block font-medium">Auto-mix (Recommended)</span>
              <span className="block text-xs text-slate-500">Mostly Mixed Challenge, with other modes for variety.</span>
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
                <span className="block font-medium">{mode.label}</span>
                <span className="block text-xs text-slate-500">{mode.description}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Verb selection</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {STRATEGIES.map((s) => (
            <label key={s.id} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="radio"
                name="strategy"
                checked={settings.selectionStrategy === s.id}
                onChange={() => updateSettings({ selectionStrategy: s.id })}
              />
              <span>
                <span className="block font-medium">{s.label}</span>
                <span className="block text-xs text-slate-500">{s.description}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Difficulty</h2>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => updateSettings({ difficulty: d.id })}
              aria-pressed={settings.difficulty === d.id}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                settings.difficulty === d.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Feedback style</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {FEEDBACK_MODES.map((f) => (
            <label key={f.id} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="radio"
                name="feedback"
                checked={settings.feedbackMode === f.id}
                onChange={() => updateSettings({ feedbackMode: f.id })}
              />
              <span>
                <span className="block font-medium">{f.label}</span>
                <span className="block text-xs text-slate-500">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Hints available</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {HINTS.map((h) => (
            <label key={h.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input type="checkbox" checked={settings.enabledHints.includes(h.id)} onChange={() => toggleHint(h.id)} />
              <span>{h.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Other</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
            />
            <span>Pronunciation audio (Web Speech API)</span>
          </label>
          <label className="flex items-center gap-3">
            <span>Daily goal</span>
            <input
              type="number"
              min={5}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) || settings.dailyGoal })}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-500">questions/day</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
