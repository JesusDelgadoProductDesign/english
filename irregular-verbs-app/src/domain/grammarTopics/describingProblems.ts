import type { TransformationExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "describing-problems" as const;
const EXPLANATION_ADJ_TO_NOUN = "The same problem can be described with a past participle as an adjective, or with a noun phrase.";
const EXPLANATION_NOUN_TO_ADJ = "The same problem can be described with a noun phrase, or with a past participle as an adjective.";

function adjectiveToNoun(id: string, sourceSentence: string, targetTemplate: string, answers: string[]): TransformationExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "adjective-to-noun",
    kind: "transformation",
    sourceSentence,
    sourceForm: "adjective",
    targetForm: "noun",
    targetTemplate,
    answers,
    explanation: EXPLANATION_ADJ_TO_NOUN,
  };
}

function nounToAdjective(id: string, sourceSentence: string, targetTemplate: string, answers: string[]): TransformationExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "noun-to-adjective",
    kind: "transformation",
    sourceSentence,
    sourceForm: "noun",
    targetForm: "adjective",
    targetTemplate,
    answers,
    explanation: EXPLANATION_NOUN_TO_ADJ,
  };
}

export const items: TransformationExerciseItem[] = [
  adjectiveToNoun("dp-001", "The suitcase lining is torn.", "It has ___ in it.", ["a tear", "a hole"]),
  adjectiveToNoun("dp-002", "The car is damaged.", "There is ___ on the bumper.", ["some damage"]),
  adjectiveToNoun("dp-003", "The coffee mug is chipped.", "There is ___ in it.", ["a chip"]),
  adjectiveToNoun("dp-004", "My pants are stained.", "They have ___ on them.", ["a stain"]),
  adjectiveToNoun("dp-005", "The camera lens is scratched.", "There are ___ on it.", ["a few scratches", "scratches"]),
  adjectiveToNoun("dp-006", "The washing machine is leaking.", "It has ___.", ["a leak"]),
  adjectiveToNoun("dp-007", "My jacket is torn.", "It has ___ in it.", ["a tear", "a hole"]),
  adjectiveToNoun("dp-008", "The laptop screen is scratched.", "There are ___ on it.", ["a few scratches", "scratches"]),
  adjectiveToNoun("dp-009", "The plate is chipped.", "There is ___ on the edge.", ["a chip"]),
  adjectiveToNoun("dp-010", "The carpet is stained.", "It has ___ on it.", ["a stain"]),
  nounToAdjective("dp-011", "It has a tear in it.", "The suitcase lining is ___.", ["torn"]),
  nounToAdjective("dp-012", "There is some damage on the bumper.", "The car is ___.", ["damaged"]),
  nounToAdjective("dp-013", "There is a chip in it.", "The coffee mug is ___.", ["chipped"]),
  nounToAdjective("dp-014", "They have a stain on them.", "My pants are ___.", ["stained"]),
  nounToAdjective("dp-015", "There are a few scratches on it.", "The camera lens is ___.", ["scratched"]),
  nounToAdjective("dp-016", "It has a leak.", "The washing machine is ___.", ["leaking"]),
  nounToAdjective("dp-017", "It has a hole in it.", "My sweater is ___.", ["torn"]),
  nounToAdjective("dp-018", "There is some damage on the screen.", "The phone is ___.", ["damaged"]),
  nounToAdjective("dp-019", "There is a chip on the rim.", "The glass is ___.", ["chipped"]),
  nounToAdjective("dp-020", "There is a stain on the carpet.", "The carpet is ___.", ["stained"]),
];
