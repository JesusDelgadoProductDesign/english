import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TopicMasterySummary } from "@/services/analytics/grammarAnalyticsEngine";
import { getTopicDefinition } from "@/domain/topicRegistry";
import { useTranslation } from "@/i18n/useTranslation";
import { topicKeyFor } from "./GrammarPracticeView";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function TopicMasteryCard({ summary }: { summary: TopicMasterySummary }) {
  const { t } = useTranslation();
  const key = topicKeyFor(summary.topicId);
  const topic = getTopicDefinition(summary.topicId);

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="font-medium">{t(`topics.${key}.title`)}</span>
        <span className="text-sm text-slate-500">
          {summary.totalAttempts > 0 ? formatPercent(summary.accuracy) : t("dashboard.practiceToSeeList")}
        </span>
      </div>
      {summary.totalAttempts > 0 && (
        <ProgressBar className="mt-2" value={summary.accuracy * 100} label={`${formatPercent(summary.accuracy)}`} />
      )}
      {summary.patterns.length > 1 && (
        <div className="mt-2 space-y-1">
          {summary.patterns.map((pattern) => {
            const titleKey = topic?.patterns.find((p) => p.id === pattern.patternId)?.titleKey;
            return (
              <div key={pattern.patternId} className="flex items-center justify-between text-xs text-slate-500">
                <span>{titleKey ? t(titleKey) : pattern.patternId}</span>
                <span>{pattern.totalAttempts > 0 ? formatPercent(pattern.accuracy) : "—"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
