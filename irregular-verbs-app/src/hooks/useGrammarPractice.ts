import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import {
  getNextGrammarItem,
  submitGrammarAnswer,
  type GrammarAnswer,
  type SubmitGrammarAnswerOutput,
} from "@/services/practice/grammarSessionEngine";
import { GAMIFICATION_QUERY_KEY } from "./useGamification";
import { STATS_QUERY_KEY } from "./useDashboardStats";
import { LEADERBOARD_QUERY_KEY } from "./useLeaderboardIdentity";

export const GRAMMAR_MASTERY_QUERY_KEY = ["grammar-mastery"];

interface GrammarPracticeState {
  item: GrammarExerciseItem | null;
  outcome: SubmitGrammarAnswerOutput | null;
  startedAt: number;
}

/** Single-topic grammar practice session — mirrors usePracticeSession.ts, scoped to one topic. */
export function useGrammarPractice(topicId: TopicId, patternFilter?: string[]) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<GrammarPracticeState>({ item: null, outcome: null, startedAt: Date.now() });
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNext = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const { item } = await getNextGrammarItem({ topicId, patternFilter });
      setState({ item, outcome: null, startedAt: Date.now() });
    } catch {
      setError("Couldn't load the next question. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  }, [topicId, patternFilter]);

  const answer = useCallback(
    async (grammarAnswer: GrammarAnswer) => {
      if (!state.item) return null;
      setIsBusy(true);
      setError(null);
      try {
        const outcome = await submitGrammarAnswer({
          item: state.item,
          answer: grammarAnswer,
          responseTimeMs: Date.now() - state.startedAt,
        });
        setState((prev) => ({ ...prev, outcome }));
        queryClient.invalidateQueries({ queryKey: GAMIFICATION_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: GRAMMAR_MASTERY_QUERY_KEY });
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

  return { ...state, isBusy, error, loadNext, answer };
}
