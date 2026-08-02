import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import { items as pastContinuousVsSimplePastItems } from "./pastContinuousVsSimplePast";
import { items as tagQuestionsItems } from "./tagQuestions";
import { items as pastPerfectItems } from "./pastPerfect";
import { items as describingProblemsItems } from "./describingProblems";
import { items as futureWillItems } from "./futureWill";
import { items as regretHypotheticalsItems } from "./regretHypotheticals";
import { items as pastModalsCertaintyItems } from "./pastModalsCertainty";
import { items as pastModalsJudgmentItems } from "./pastModalsJudgment";
import { items as pastAccomplishmentsItems } from "./pastAccomplishments";

const BANKS: Partial<Record<TopicId, GrammarExerciseItem[]>> = {
  "past-continuous-vs-simple": pastContinuousVsSimplePastItems,
  "tag-questions": tagQuestionsItems,
  "past-perfect": pastPerfectItems,
  "describing-problems": describingProblemsItems,
  "future-will": futureWillItems,
  "regret-hypotheticals": regretHypotheticalsItems,
  "past-modals-certainty": pastModalsCertaintyItems,
  "past-modals-judgment": pastModalsJudgmentItems,
  "past-accomplishments": pastAccomplishmentsItems,
};

/** Returns the item bank for a topic, or an empty array for topics without content yet. */
export function getItemBank(topicId: TopicId): GrammarExerciseItem[] {
  return BANKS[topicId] ?? [];
}
