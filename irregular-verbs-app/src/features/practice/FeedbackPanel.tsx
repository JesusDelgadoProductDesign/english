import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SubmitAnswersOutput } from "@/services/practice/sessionEngine";
import type { FieldAttemptResult } from "@/domain/practice";
import type { Verb, VerbField } from "@/domain/verb";
import { primaryFormFor } from "@/domain/verb";
import { allExampleSentences } from "@/services/content/exampleSentences";
import { speak, isSpeechSupported } from "@/services/tts/speechService";
import { useTranslation } from "@/i18n/useTranslation";

interface FeedbackPanelProps {
  verb: Verb;
  outcome: SubmitAnswersOutput;
  audioEnabled: boolean;
  isBusy: boolean;
  onNext: () => void;
}

interface FieldCardProps {
  field: VerbField;
  value: string;
  result?: FieldAttemptResult;
  extra?: ReactNode;
  onSpeak?: () => void;
}

/** One verb-form/meaning card, showing the result badge and (if wrong) the user's own answer inline. */
function FieldCard({ field, value, result, extra, onSpeak }: FieldCardProps) {
  const { t } = useTranslation();
  const isWrong = result ? !result.correct : false;

  return (
    <div
      className={`rounded-xl p-3 ${isWrong ? "bg-red-100 dark:bg-red-900/40" : "bg-slate-50 dark:bg-slate-800/60"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            isWrong ? "text-red-700 dark:text-red-300" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t(`fields.${field}`)}
        </span>
        <div className="flex items-center gap-1">
          {result && (
            <span
              aria-label={result.correct ? t("feedback.correctAria") : t("feedback.incorrectAria")}
              className={result.correct ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
            >
              {result.correct ? "✓" : "✗"}
            </span>
          )}
          {onSpeak && (
            <button
              type="button"
              aria-label={t("practice.playPronunciation", { value })}
              onClick={onSpeak}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              🔊
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 font-medium">{value}</p>
      {isWrong && result && (
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
          {t("feedback.youWrote")} <s className="opacity-70">{result.userAnswer.trim() || t("feedback.leftBlank")}</s>
        </p>
      )}
      {extra}
    </div>
  );
}

export function FeedbackPanel({ verb, outcome, audioEnabled, isBusy, onNext }: FeedbackPanelProps) {
  const { t } = useTranslation();
  const sentences = allExampleSentences(verb);
  const speechAvailable = audioEnabled && isSpeechSupported();
  const resultFor = (field: VerbField) => outcome.results.find((r) => r.field === field);

  return (
    <Card className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {outcome.allCorrect ? t("feedback.correctTitle") : t("feedback.fullPictureTitle")}
        </h2>
        <Badge tone={outcome.allCorrect ? "success" : "warning"}>+{outcome.xp.xpEarned} XP</Badge>
      </div>

      {outcome.newlyMastered.length > 0 && (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {t("feedback.masteredFor", {
            fields: outcome.newlyMastered.map((f) => t(`fields.${f}`)).join(", "),
            verb: verb.infinitive,
          })}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {(["infinitive", "pastSimple", "pastParticiple"] as const).map((field) => (
          <FieldCard
            key={field}
            field={field}
            value={primaryFormFor(verb, field)}
            result={resultFor(field)}
            onSpeak={speechAvailable ? () => speak(primaryFormFor(verb, field)) : undefined}
            extra={<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sentences[field]}</p>}
          />
        ))}
      </div>

      <FieldCard field="meaning" value={verb.meanings.join(" / ")} result={resultFor("meaning")} />

      <p className="text-xs text-slate-400">{t("feedback.collocationsComingSoon")}</p>

      <Button onClick={onNext} disabled={isBusy} autoFocus>
        {isBusy ? t("feedback.loading") : t("feedback.nextVerbEnter")}
      </Button>
    </Card>
  );
}
