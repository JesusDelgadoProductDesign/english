import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SubmitAnswersOutput } from "@/services/practice/sessionEngine";
import type { Verb } from "@/domain/verb";
import { primaryFormFor } from "@/domain/verb";
import { FIELD_LABELS } from "@/domain/fieldLabels";
import { allExampleSentences } from "@/services/content/exampleSentences";
import { speak, isSpeechSupported } from "@/services/tts/speechService";

interface FeedbackPanelProps {
  verb: Verb;
  outcome: SubmitAnswersOutput;
  audioEnabled: boolean;
  isBusy: boolean;
  onNext: () => void;
}

export function FeedbackPanel({ verb, outcome, audioEnabled, isBusy, onNext }: FeedbackPanelProps) {
  const sentences = allExampleSentences(verb);
  const speechAvailable = audioEnabled && isSpeechSupported();

  return (
    <Card className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {outcome.allCorrect ? "Correct! 🎉" : "Here's the full picture"}
        </h2>
        <Badge tone={outcome.allCorrect ? "success" : "warning"}>
          +{outcome.xp.xpEarned} XP
        </Badge>
      </div>

      <ul className="flex flex-wrap gap-2">
        {outcome.results.map((r) => (
          <li key={r.field}>
            <Badge tone={r.correct ? "success" : "danger"}>
              {r.correct ? "✓" : "✗"} {FIELD_LABELS[r.field]}
              {!r.correct && r.field !== "meaning" ? `: ${primaryFormFor(verb, r.field)}` : ""}
              {!r.correct && r.field === "meaning" ? `: ${verb.meanings.join(" / ")}` : ""}
            </Badge>
          </li>
        ))}
      </ul>

      {outcome.newlyMastered.length > 0 && (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Mastered: {outcome.newlyMastered.map((f) => FIELD_LABELS[f]).join(", ")} for "{verb.infinitive}" 🏆
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {(["infinitive", "pastSimple", "pastParticiple"] as const).map((field) => (
          <div key={field} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {FIELD_LABELS[field]}
              </span>
              {speechAvailable && (
                <button
                  type="button"
                  aria-label={`Play pronunciation for ${primaryFormFor(verb, field)}`}
                  onClick={() => speak(primaryFormFor(verb, field))}
                  className="rounded-full p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  🔊
                </button>
              )}
            </div>
            <p className="mt-1 font-medium">{primaryFormFor(verb, field)}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sentences[field]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Meaning
        </span>
        <p className="mt-1 font-medium">{verb.meanings.join(" / ")}</p>
      </div>

      <p className="text-xs text-slate-400">
        Collocations and phrasal verbs are coming in a future update.
      </p>

      <Button onClick={onNext} disabled={isBusy} autoFocus>
        {isBusy ? "Loading…" : "Next verb (Enter)"}
      </Button>
    </Card>
  );
}
