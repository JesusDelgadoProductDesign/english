import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import { items as pastContinuousVsSimplePastItems } from "./pastContinuousVsSimplePast";
import { items as tagQuestionsItems } from "./tagQuestions";

const BANKS: Partial<Record<TopicId, GrammarExerciseItem[]>> = {
  "past-continuous-vs-simple": pastContinuousVsSimplePastItems,
  "tag-questions": tagQuestionsItems,
};

/** Returns the item bank for a topic, or an empty array for topics without content yet. */
export function getItemBank(topicId: TopicId): GrammarExerciseItem[] {
  return BANKS[topicId] ?? [];
}
