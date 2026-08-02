import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { FilledSentence, SubmitGrammarAnswerOutput } from "@/services/practice/grammarSessionEngine";
import { useTranslation } from "@/i18n/useTranslation";

interface GrammarFeedbackPanelProps {
  outcome: SubmitGrammarAnswerOutput;
  isBusy: boolean;
  onNext: () => void;
}

function Sentence({ sentence }: { sentence: FilledSentence }) {
  return (
    <>
      {sentence.before}
      <strong>{sentence.answer}</strong>
      {sentence.after}
    </>
  );
}

export function GrammarFeedbackPanel({ outcome, isBusy, onNext }: GrammarFeedbackPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{outcome.correct ? t("grammarPractice.correct") : t("grammarPractice.incorrect")}</h2>
        <Badge tone={outcome.correct ? "success" : "warning"}>+{outcome.xp.xpEarned} XP</Badge>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-slate-600 dark:text-slate-400">
          <span className="font-semibold">{t("grammarPractice.correctAnswerLabel")}</span>{" "}
          <Sentence sentence={outcome.correctSentence} />
        </p>
        {!outcome.correct && outcome.userSentence && (
          <p className="text-red-700 dark:text-red-300">
            <span className="font-semibold">{t("feedback.youWrote")}</span> <Sentence sentence={outcome.userSentence} />
          </p>
        )}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold">{t("grammarPractice.explanation")}:</span> {outcome.explanation}
      </p>

      <Button onClick={onNext} disabled={isBusy} autoFocus>
        {isBusy ? t("feedback.loading") : t("grammarPractice.nextQuestion")}
      </Button>
    </Card>
  );
}
