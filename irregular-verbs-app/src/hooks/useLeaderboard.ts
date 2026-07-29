import { useQuery } from "@tanstack/react-query";
import { getMyEntry, getRankForXp, getTopEntries } from "@/services/leaderboard/leaderboardService";
import { useAuth } from "@/contexts/AuthContext";
import { LEADERBOARD_QUERY_KEY } from "./useLeaderboardIdentity";

export function useLeaderboard(limit = 10) {
  const { isConfigured } = useAuth();

  const query = useQuery({
    queryKey: [...LEADERBOARD_QUERY_KEY, limit],
    queryFn: async () => {
      const [entries, myEntry] = await Promise.all([getTopEntries(limit), getMyEntry()]);
      const myRank = myEntry ? await getRankForXp(myEntry.weeklyXp) : null;
      return { entries, myEntry, myRank };
    },
    enabled: isConfigured,
  });

  return {
    entries: query.data?.entries ?? [],
    myEntry: query.data?.myEntry ?? null,
    myRank: query.data?.myRank ?? null,
    isLoading: isConfigured && query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
