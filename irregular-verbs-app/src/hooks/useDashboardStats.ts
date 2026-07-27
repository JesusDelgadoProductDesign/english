import { useQuery } from "@tanstack/react-query";
import { computeDashboardStats } from "@/services/analytics/analyticsEngine";
import { useAuth } from "@/contexts/AuthContext";

/** Prefix only — invalidateQueries matches it against every user-scoped variant. */
export const STATS_QUERY_KEY = ["dashboard-stats"] as const;

export function useDashboardStats() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...STATS_QUERY_KEY, user?.id ?? "guest"],
    queryFn: () => computeDashboardStats(),
  });
  return { stats: query.data, isLoading: query.isLoading };
}
