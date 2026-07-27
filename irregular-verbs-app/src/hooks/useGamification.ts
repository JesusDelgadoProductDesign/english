import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGamificationRepository } from "@/services/repositories/activeRepositories";
import { useAuth } from "@/contexts/AuthContext";

/** Prefix only — invalidateQueries matches it against every user-scoped variant. */
export const GAMIFICATION_QUERY_KEY = ["gamification"] as const;

export function useGamification() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...GAMIFICATION_QUERY_KEY, user?.id ?? "guest"],
    queryFn: () => getGamificationRepository().get(),
  });
  return { gamification: query.data, isLoading: query.isLoading };
}

export function useInvalidateGamification() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: GAMIFICATION_QUERY_KEY });
}
