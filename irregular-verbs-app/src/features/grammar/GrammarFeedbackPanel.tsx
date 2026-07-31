import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SubmitGrammarAnswerOutput } from "@/services/practice/grammarSessionEngine";
import { useTranslation } from "@/i18n/useTranslation";

interface GrammarFeedbackPanelProps {
  outcome: SubmitGrammarAnswerOutput;
  isBusy: boolean;
  onNext: () => void;
}

export function GrammarFeedbackPanel({ outcome, isBusy, onNext }: GrammarFeedbackPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{outcome.correct ? t("grammarPractice.correct") : t("grammarPractice.incorrect")}</h2>
        <Badge tone={outcome.correct ? "success" : "warning"}>+{outcome.xp.xpEarned} XP</Badge>
      </div>

      {!outcome.correct && (
        <p className="text-sm text-red-700 dark:text-red-300">
          {t("grammarPractice.yourAnswerWas")} <strong>{outcome.correctAnswerText}</strong>
        </p>
      )}

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold">{t("grammarPractice.explanation")}:</span> {outcome.explanation}
      </p>

      <Button onClick={onNext} disabled={isBusy} autoFocus>
        {isBusy ? t("feedback.loading") : t("grammarPractice.nextQuestion")}
      </Button>
    </Card>
  );
}
