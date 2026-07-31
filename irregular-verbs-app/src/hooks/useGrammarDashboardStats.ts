import { useQuery } from "@tanstack/react-query";
import { computeGrammarDashboardStats } from "@/services/analytics/grammarAnalyticsEngine";
import { useAuth } from "@/contexts/AuthContext";
import { GRAMMAR_MASTERY_QUERY_KEY } from "./useGrammarPractice";

export function useGrammarDashboardStats() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...GRAMMAR_MASTERY_QUERY_KEY, user?.id ?? "guest"],
    queryFn: () => computeGrammarDashboardStats(),
  });
  return {
    topics: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
