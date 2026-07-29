import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/ui/StatTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Sparkline } from "@/components/charts/Sparkline";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useGamification } from "@/hooks/useGamification";
import { levelProgress } from "@/domain/gamification";
import { ACHIEVEMENTS } from "@/domain/achievements";
import { useTranslation } from "@/i18n/useTranslation";
import { LeaderboardCard } from "@/features/leaderboard/LeaderboardCard";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${minutes} min`;
  return `${(minutes / 60).toFixed(1)} hr`;
}

export function DashboardView() {
  const { t } = useTranslation();
  const { stats, isLoading, error: statsError } = useDashboardStats();
  const { gamification, error: gamificationError } = useGamification();
  const error = statsError ?? gamificationError;

  if (error && (!stats || !gamification)) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>{t("common.retry")}</Button>
      </Card>
    );
  }

  if (isLoading || !stats || !gamification) {
    return (
      <Card>
        <p className="text-sm text-slate-500">{t("dashboard.loadingProgress")}</p>
      </Card>
    );
  }

  const progress = levelProgress(gamification.xp);
  const unlocked = new Set(gamification.unlockedAchievementIds);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{t("dashboard.level", { level: gamification.level })}</p>
            <p className="text-2xl font-bold">{gamification.xp} XP</p>
          </div>
          <Badge tone="brand">
            🔥{" "}
            {t(gamification.currentStreakDays === 1 ? "dashboard.streakDaysSingular" : "dashboard.streakDaysPlural", {
              count: gamification.currentStreakDays,
            })}
          </Badge>
        </div>
        <ProgressBar
          className="mt-3"
          value={(progress.current / progress.needed) * 100}
          label={`${progress.current} of ${progress.needed} XP to level ${gamification.level + 1}`}
        />
      </Card>

      <LeaderboardCard />

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.progress")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label={t("dashboard.totalVerbs")} value={String(stats.progress.totalVerbs)} />
          <StatTile label={t("dashboard.mastered")} value={String(stats.progress.masteredVerbs)} />
          <StatTile label={t("dashboard.remaining")} value={String(stats.progress.remainingVerbs)} />
          <StatTile
            label={t("dashboard.today")}
            value={`${stats.progress.todayAttempts}/${stats.progress.todayGoal}`}
            hint={t("dashboard.questionsAnswered")}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.performance")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label={t("dashboard.accuracy")} value={formatPercent(stats.performance.accuracy)} />
          <StatTile label={t("dashboard.attempts")} value={String(stats.performance.totalAttempts)} />
          <StatTile
            label={t("dashboard.avgResponse")}
            value={`${Math.round(stats.performance.averageResponseTimeMs / 1000)}s`}
          />
          <StatTile label={t("dashboard.studyTime")} value={formatDuration(stats.performance.totalStudyTimeMs)} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">{t("dashboard.xpProgression")}</h2>
          <Sparkline
            data={stats.charts.xpProgression.map((d) => ({ date: d.date, value: d.xp }))}
            ariaLabel={t("dashboard.totalXpChartLabel")}
          />
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">{t("dashboard.accuracyOverTime")}</h2>
          <Sparkline
            data={stats.charts.accuracyOverTime.map((d) => ({ date: d.date, value: Math.round(d.accuracy * 100) }))}
            formatValue={(v) => `${v}%`}
            ariaLabel={t("dashboard.accuracyChartLabel")}
          />
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.studyCalendar")}</h2>
        <ActivityHeatmap days={stats.charts.last30Days} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">{t("dashboard.weakestVerbs")}</h2>
          {stats.learning.weakest.length === 0 ? (
            <p className="text-sm text-slate-500">{t("dashboard.practiceToSeeList")}</p>
          ) : (
            <ul className="space-y-2">
              {stats.learning.weakest.map((s) => (
                <li key={s.verb.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.verb.infinitive}</span>
                  <Badge tone="warning">
                    {formatPercent(s.averageConfidence)} {t("dashboard.confidence")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">{t("dashboard.strongestVerbs")}</h2>
          {stats.learning.strongest.length === 0 ? (
            <p className="text-sm text-slate-500">{t("dashboard.practiceToSeeList")}</p>
          ) : (
            <ul className="space-y-2">
              {stats.learning.strongest.map((s) => (
                <li key={s.verb.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.verb.infinitive}</span>
                  <Badge tone="success">
                    {formatPercent(s.averageConfidence)} {t("dashboard.confidence")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.reviewQueue")}</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label={t("dashboard.dueToday")} value={String(stats.review.dueToday)} />
          <StatTile label={t("dashboard.upcoming7d")} value={String(stats.review.upcoming7Days)} />
          <StatTile label={t("dashboard.queueSize")} value={String(stats.review.reviewQueueSize)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.achievements")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-2 rounded-xl border p-3 ${
                unlocked.has(a.id)
                  ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/20"
                  : "border-slate-200 opacity-60 dark:border-slate-700"
              }`}
            >
              <span aria-hidden="true">{unlocked.has(a.id) ? "🏆" : "🔒"}</span>
              <span>
                <span className="block font-medium">{t(`achievements.${a.id}.title`)}</span>
                <span className="block text-xs text-slate-500">{t(`achievements.${a.id}.description`)}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
