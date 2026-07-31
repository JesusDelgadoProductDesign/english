import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SelectionMode } from "@/domain/studySession";
import { useStudySession } from "@/hooks/useStudySession";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/i18n/useTranslation";
import { FeedbackPanel } from "@/features/practice/FeedbackPanel";
import { GrammarExerciseCard } from "./GrammarExerciseCard";
import { GrammarFeedbackPanel } from "./GrammarFeedbackPanel";
import { MixedVerbTurn } from "./MixedVerbTurn";

const VALID_MODES: SelectionMode[] = ["random-mix", "learning-route", "weakness-based"];

export function StudySessionView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const mode: SelectionMode = VALID_MODES.includes(requestedMode as SelectionMode)
    ? (requestedMode as SelectionMode)
    : "random-mix";

  const { settings } = useSettings();
  const { entry, verbOutcome, grammarOutcome, isBusy, error, loadNext, answerVerb, answerGrammar } = useStudySession(mode);

  useEffect(() => {
    void loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t(`topics.selectionMode.${modeKey(mode)}`)}</h1>
        <Link to="/topics" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          {t("topics.backToTopics")}
        </Link>
      </div>

      {error && !entry && (
        <Card className="space-y-3">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
          <Button onClick={() => loadNext()}>{t("common.retry")}</Button>
        </Card>
      )}

      {!entry && !error && (
        <Card>
          <p className="text-sm text-slate-500">{t("practice.loadingNextVerb")}</p>
        </Card>
      )}

      {entry?.kind === "verb" &&
        (verbOutcome ? (
          <FeedbackPanel
            verb={entry.verb}
            outcome={verbOutcome}
            audioEnabled={settings?.audioEnabled ?? true}
            isBusy={isBusy}
            onNext={() => loadNext()}
          />
        ) : (
          <MixedVerbTurn item={entry.item} verb={entry.verb} isBusy={isBusy} onSubmit={(a, h) => answerVerb(a, h)} />
        ))}

      {entry?.kind === "grammar" &&
        (grammarOutcome ? (
          <GrammarFeedbackPanel outcome={grammarOutcome} isBusy={isBusy} onNext={() => loadNext()} />
        ) : (
          <GrammarExerciseCard item={entry.item} isBusy={isBusy} onSubmit={(a) => answerGrammar(a)} />
        ))}
    </div>
  );
}

function modeKey(mode: SelectionMode): string {
  switch (mode) {
    case "random-mix":
      return "randomMix";
    case "learning-route":
      return "learningRoute";
    case "weakness-based":
      return "weaknessBased";
    default:
      return "single";
  }
}
