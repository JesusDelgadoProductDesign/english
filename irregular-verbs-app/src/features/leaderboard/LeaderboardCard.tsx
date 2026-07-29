import { Card } from "@/components/ui/Card";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";

/** Weekly XP leaderboard — shown on the post-answer feedback screen and the dashboard. */
export function LeaderboardCard() {
  const { t } = useTranslation();
  const { isConfigured } = useAuth();
  const { entries, myEntry, myRank, isLoading, error } = useLeaderboard();

  if (!isConfigured || error) return null;

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">{t("leaderboard.title")}</h2>
      <p className="mb-3 text-xs text-slate-400">{t("leaderboard.weeklyNote")}</p>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("leaderboard.loading")}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">{t("leaderboard.empty")}</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((entry, index) => {
            const isMe = myEntry && entry.userId === myEntry.userId;
            return (
              <li
                key={entry.userId}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                  isMe ? "bg-brand-50 font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200" : ""
                }`}
              >
                <span className="truncate">
                  {index + 1}. {entry.displayName}
                </span>
                <span className="shrink-0 tabular-nums">{entry.weeklyXp} XP</span>
              </li>
            );
          })}
        </ol>
      )}

      {myEntry && myRank && myRank > entries.length && (
        <p className="mt-3 text-xs text-slate-400">
          {t("leaderboard.yourRank", { rank: myRank, xp: myEntry.weeklyXp })}
        </p>
      )}
    </Card>
  );
}
