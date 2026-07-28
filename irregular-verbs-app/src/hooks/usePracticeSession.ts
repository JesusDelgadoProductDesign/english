import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PracticeItem } from "@/domain/practice";
import type { Verb, VerbField } from "@/domain/verb";
import { getNextItem, submitAnswers, type SubmitAnswersOutput } from "@/services/practice/sessionEngine";
import { useSettings } from "./useSettings";
import { GAMIFICATION_QUERY_KEY } from "./useGamification";
import { STATS_QUERY_KEY } from "./useDashboardStats";

export interface PracticeState {
  item: PracticeItem | null;
  verb: Verb | null;
  outcome: SubmitAnswersOutput | null;
  startedAt: number;
}

export function usePracticeSession() {
  const { settings, error: settingsError } = useSettings();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PracticeState>({ item: null, verb: null, outcome: null, startedAt: Date.now() });
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNext = useCallback(async () => {
    if (!settings) return;
    setIsBusy(true);
    setError(null);
    try {
      const { item, verb } = await getNextItem({
        preferredMode: settings.preferredMode,
        selectionStrategy: settings.selectionStrategy,
      });
      setState({ item, verb, outcome: null, startedAt: Date.now() });
    } catch {
      setError("Couldn't load the next verb. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  }, [settings]);

  const answer = useCallback(
    async (answers: Partial<Record<VerbField, string>>, hintsUsedByField: Partial<Record<VerbField, number>>) => {
      if (!state.item || !state.verb) return null;
      setIsBusy(true);
      setError(null);
      try {
        const outcome = await submitAnswers({
          item: state.item,
          verb: state.verb,
          answers,
          hintsUsedByField,
          responseTimeMs: Date.now() - state.startedAt,
        });
        setState((prev) => ({ ...prev, outcome }));
        queryClient.invalidateQueries({ queryKey: GAMIFICATION_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        return outcome;
      } catch {
        setError("Couldn't save your answer. Check your connection and try again.");
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [state, queryClient],
  );

  return { ...state, settings, isBusy, error: settingsError ?? error, loadNext, answer };
}
