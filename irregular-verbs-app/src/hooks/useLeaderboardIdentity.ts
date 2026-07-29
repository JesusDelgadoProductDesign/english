import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyDisplayName, setDisplayName } from "@/services/leaderboard/leaderboardService";
import { useAuth } from "@/contexts/AuthContext";

export const LEADERBOARD_IDENTITY_QUERY_KEY = ["leaderboard-identity"] as const;
export const LEADERBOARD_QUERY_KEY = ["leaderboard"] as const;

export function useLeaderboardIdentity() {
  const { isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: LEADERBOARD_IDENTITY_QUERY_KEY,
    queryFn: () => getMyDisplayName(),
    enabled: isConfigured,
  });

  const mutation = useMutation({
    mutationFn: (name: string) => setDisplayName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_IDENTITY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    },
  });

  return {
    displayName: query.data ?? null,
    isLoading: isConfigured && query.isLoading,
    setDisplayName: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
