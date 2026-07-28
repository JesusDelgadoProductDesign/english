import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsRepository } from "@/services/repositories/activeRepositories";
import type { UserSettings } from "@/domain/settings";
import { useAuth } from "@/contexts/AuthContext";

export function useSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ["settings", user?.id ?? "guest"] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => getSettingsRepository().get(),
  });

  const mutation = useMutation({
    mutationFn: async (next: UserSettings) => {
      await getSettingsRepository().save(next);
      return next;
    },
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });

  async function updateSettings(patch: Partial<UserSettings>) {
    const current = query.data ?? (await getSettingsRepository().get());
    mutation.mutate({ ...current, ...patch });
  }

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    updateSettings,
  };
}
