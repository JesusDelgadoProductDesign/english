import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { TopicId } from "@/domain/grammarTopic";
import { getTopicDefinition } from "@/domain/topicRegistry";
import { useGrammarPractice } from "@/hooks/useGrammarPractice";
import { useTranslation } from "@/i18n/useTranslation";
import { GrammarExerciseCard } from "./GrammarExerciseCard";
import { GrammarFeedbackPanel } from "./GrammarFeedbackPanel";

interface GrammarPracticeViewProps {
  topicId: TopicId;
}

export function GrammarPracticeView({ topicId }: GrammarPracticeViewProps) {
  const { t } = useTranslation();
  const { item, outcome, isBusy, error, loadNext, answer } = useGrammarPractice(topicId);
  const topic = getTopicDefinition(topicId);

  useEffect(() => {
    void loadNext();
  }, [topicId, loadNext]);

  if (error && !item) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <Button onClick={() => loadNext()}>{t("common.retry")}</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{topic ? t(`topics.${topicKeyFor(topicId)}.title`) : topicId}</h1>
        <Link to="/topics" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          {t("topics.backToTopics")}
        </Link>
      </div>

      {!item && !outcome && (
        <Card>
          <p className="text-sm text-slate-500">{t("practice.loadingNextVerb")}</p>
        </Card>
      )}

      {item && !outcome && <GrammarExerciseCard item={item} isBusy={isBusy} onSubmit={(a) => answer(a)} />}

      {outcome && <GrammarFeedbackPanel outcome={outcome} isBusy={isBusy} onNext={() => loadNext()} />}
    </div>
  );
}

/** Maps a TopicId to its camelCase i18n key segment, e.g. "past-continuous-vs-simple" -> "pastContinuousVsSimple". */
export function topicKeyFor(topicId: TopicId): string {
  return topicId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
