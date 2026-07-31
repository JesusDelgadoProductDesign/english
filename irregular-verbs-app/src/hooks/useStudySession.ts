import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SelectionMode, StudyQueueEntry } from "@/domain/studySession";
import type { TopicDefinition } from "@/domain/grammarTopic";
import { getLiveTopics } from "@/domain/topicRegistry";
import type { VerbField } from "@/domain/verb";
import { getNextItem, submitAnswers, type SubmitAnswersOutput } from "@/services/practice/sessionEngine";
import {
  getNextGrammarItem,
  submitGrammarAnswer,
  type GrammarAnswer,
  type SubmitGrammarAnswerOutput,
} from "@/services/practice/grammarSessionEngine";
import { getNextTopicInRoute } from "@/services/practice/learningRoute";
import { getUnifiedWeaknessRanking } from "@/services/practice/unifiedWeakness";
import { getTopicDefinition } from "@/domain/topicRegistry";
import { GAMIFICATION_QUERY_KEY } from "./useGamification";
import { STATS_QUERY_KEY } from "./useDashboardStats";
import { LEADERBOARD_QUERY_KEY } from "./useLeaderboardIdentity";
import { GRAMMAR_MASTERY_QUERY_KEY } from "./useGrammarPractice";

function randomLiveTopic(): TopicDefinition {
  const topics = getLiveTopics();
  return topics[Math.floor(Math.random() * topics.length)];
}

/** Decides which topic to serve next for the given selection mode. */
async function pickTopic(mode: SelectionMode): Promise<TopicDefinition> {
  if (mode === "learning-route") return getNextTopicInRoute();

  if (mode === "weakness-based") {
    const ranking = await getUnifiedWeaknessRanking();
    if (ranking.length === 0) return randomLiveTopic();
    const weakest = ranking[0];
    return getTopicDefinition(weakest.topicId) ?? randomLiveTopic();
  }

  // random-mix
  return randomLiveTopic();
}

export function useStudySession(mode: SelectionMode) {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState<StudyQueueEntry | null>(null);
  const [verbOutcome, setVerbOutcome] = useState<SubmitAnswersOutput | null>(null);
  const [grammarOutcome, setGrammarOutcome] = useState<SubmitGrammarAnswerOutput | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNext = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    setVerbOutcome(null);
    setGrammarOutcome(null);
    try {
      const topic = await pickTopic(mode);
      if (topic.id === "irregular-verbs") {
        const { item, verb } = await getNextItem({ preferredMode: "auto-mix", selectionStrategy: "adaptive" });
        setEntry({ kind: "verb", item, verb });
      } else {
        const { item } = await getNextGrammarItem({ topicId: topic.id });
        setEntry({ kind: "grammar", item });
      }
      setStartedAt(Date.now());
    } catch {
      setError("Couldn't load the next question. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  }, [mode]);

  const invalidateShared = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: GAMIFICATION_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: GRAMMAR_MASTERY_QUERY_KEY });
  }, [queryClient]);

  const answerVerb = useCallback(
    async (answers: Partial<Record<VerbField, string>>, hintsUsedByField: Partial<Record<VerbField, number>>) => {
      if (!entry || entry.kind !== "verb") return null;
      setIsBusy(true);
      setError(null);
      try {
        const outcome = await submitAnswers({
          item: entry.item,
          verb: entry.verb,
          answers,
          hintsUsedByField,
          responseTimeMs: Date.now() - startedAt,
        });
        setVerbOutcome(outcome);
        invalidateShared();
        return outcome;
      } catch {
        setError("Couldn't save your answer. Check your connection and try again.");
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [entry, startedAt, invalidateShared],
  );

  const answerGrammar = useCallback(
    async (answer: GrammarAnswer) => {
      if (!entry || entry.kind !== "grammar") return null;
      setIsBusy(true);
      setError(null);
      try {
        const outcome = await submitGrammarAnswer({
          item: entry.item,
          answer,
          responseTimeMs: Date.now() - startedAt,
        });
        setGrammarOutcome(outcome);
        invalidateShared();
        return outcome;
      } catch {
        setError("Couldn't save your answer. Check your connection and try again.");
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [entry, startedAt, invalidateShared],
  );

  return { entry, verbOutcome, grammarOutcome, isBusy, error, loadNext, answerVerb, answerGrammar };
}
