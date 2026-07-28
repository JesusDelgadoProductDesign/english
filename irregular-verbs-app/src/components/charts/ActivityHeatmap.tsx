import type { DailyActivity } from "@/services/repositories/historyTypes";
import { useTranslation } from "@/i18n/useTranslation";

const INTENSITY_CLASSES = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-brand-100 dark:bg-brand-900/50",
  "bg-brand-300 dark:bg-brand-700",
  "bg-brand-500 dark:bg-brand-500",
  "bg-brand-700 dark:bg-brand-300",
];

function intensityIndex(attempts: number, max: number): number {
  if (attempts === 0) return 0;
  if (max === 0) return 1;
  const ratio = attempts / max;
  return Math.min(4, 1 + Math.floor(ratio * 3));
}

interface ActivityHeatmapProps {
  days: DailyActivity[];
}

/** Sequential single-hue heatmap over the last N days (GitHub-style), one measure — no legend/hue needed beyond intensity. */
export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const { t } = useTranslation();
  const max = Math.max(0, ...days.map((d) => d.attempts));

  return (
    <div>
      <div
        className="grid grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-1"
        role="img"
        aria-label={t("dashboard.studyActivityAriaLabel")}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.attempts} ${t(day.attempts === 1 ? "dashboard.questionSingular" : "dashboard.questionPlural")}`}
            className={`h-4 w-4 rounded-sm ${INTENSITY_CLASSES[intensityIndex(day.attempts, max)]}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
        <span>{t("dashboard.less")}</span>
        {INTENSITY_CLASSES.map((cls) => (
          <span key={cls} className={`h-3 w-3 rounded-sm ${cls}`} />
        ))}
        <span>{t("dashboard.more")}</span>
      </div>
    </div>
  );
}
