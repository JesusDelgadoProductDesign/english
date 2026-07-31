import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TOPIC_REGISTRY } from "@/domain/topicRegistry";
import type { TopicDefinition } from "@/domain/grammarTopic";
import { useTranslation } from "@/i18n/useTranslation";
import { topicKeyFor } from "./GrammarPracticeView";

function routeFor(topic: TopicDefinition): string {
  return topic.id === "irregular-verbs" ? "/" : `/practice/grammar/${topic.id}`;
}

function TopicCard({ topic }: { topic: TopicDefinition }) {
  const { t } = useTranslation();
  const key = topicKeyFor(topic.id);
  const isLive = topic.status === "live";

  const content = (
    <Card className={isLive ? "h-full transition hover:border-brand-400" : "h-full opacity-60"}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{t(`topics.${key}.title`)}</h3>
        {!isLive && <Badge tone="neutral">{t("topics.comingSoon")}</Badge>}
      </div>
      <p className="mt-1 text-sm text-slate-500">{t(`topics.${key}.description`)}</p>
      <Badge tone="brand" className="mt-3">
        {t(topic.category === "verb-forms" ? "topics.category.verbForms" : "topics.category.grammar")}
      </Badge>
    </Card>
  );

  return isLive ? (
    <Link to={routeFor(topic)} className="block">
      {content}
    </Link>
  ) : (
    <div aria-disabled="true">{content}</div>
  );
}

export function TopicPickerView() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t("topics.pageTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("topics.pageDescription")}</p>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">{t("topics.studyModesTitle")}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            to="/study?mode=random-mix"
            className="rounded-xl border border-slate-200 p-3 text-center font-medium hover:border-brand-400 dark:border-slate-700"
          >
            {t("topics.selectionMode.randomMix")}
          </Link>
          <Link
            to="/study?mode=learning-route"
            className="rounded-xl border border-slate-200 p-3 text-center font-medium hover:border-brand-400 dark:border-slate-700"
          >
            {t("topics.selectionMode.learningRoute")}
          </Link>
          <Link
            to="/study?mode=weakness-based"
            className="rounded-xl border border-slate-200 p-3 text-center font-medium hover:border-brand-400 dark:border-slate-700"
          >
            {t("topics.selectionMode.weaknessBased")}
          </Link>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("topics.selectionMode.single")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPIC_REGISTRY.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
