import type { MultipleChoiceExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "tag-questions" as const;

function affirmative(
  id: string,
  prompt: string,
  correct: string,
  distractor1: string,
  distractor2: string,
): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "affirmative-negative-tag",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: distractor1 },
      { id: "c", text: distractor2 },
    ],
    correctChoiceId: "a",
    explanation: "An affirmative statement takes a negative tag that matches its auxiliary/modal verb.",
  };
}

function negative(
  id: string,
  prompt: string,
  correct: string,
  distractor1: string,
  distractor2: string,
): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "negative-affirmative-tag",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: distractor1 },
      { id: "c", text: distractor2 },
    ],
    correctChoiceId: "a",
    explanation: "A negative statement takes an affirmative tag that matches its auxiliary/modal verb.",
  };
}

export const items: MultipleChoiceExerciseItem[] = [
  affirmative("tag-001", "Everything is really expensive nowadays, ___?", "isn't it", "is it", "doesn't it"),
  affirmative("tag-002", "There are lots of clubs around, ___?", "aren't there", "are there", "isn't it"),
  affirmative("tag-003", "Mara likes her apartment, ___?", "doesn't she", "does she", "isn't she"),
  affirmative("tag-004", "The city should provide child care, ___?", "shouldn't it", "should it", "doesn't it"),
  affirmative("tag-005", "The traffic is terrible in this city, ___?", "isn't it", "is it", "doesn't it"),
  affirmative("tag-006", "There are too many cars on the road, ___?", "aren't there", "are there", "isn't it"),
  affirmative("tag-007", "He works really hard, ___?", "doesn't he", "does he", "isn't he"),
  affirmative("tag-008", "They live downtown, ___?", "don't they", "do they", "aren't they"),
  affirmative("tag-009", "You can speak French, ___?", "can't you", "can you", "don't you"),
  affirmative(
    "tag-010",
    "The government should invest more in schools, ___?",
    "shouldn't it",
    "should it",
    "doesn't it",
  ),
  affirmative("tag-011", "She has finished the project, ___?", "hasn't she", "has she", "doesn't she"),
  affirmative("tag-012", "This restaurant is quite expensive, ___?", "isn't it", "is it", "doesn't it"),
  negative("tag-013", "It isn't easy to find a nice apartment, ___?", "is it", "isn't it", "does it"),
  negative("tag-014", "There aren't any noise pollution laws, ___?", "are there", "aren't there", "is there"),
  negative("tag-015", "Her neighbors don't make much noise, ___?", "do they", "don't they", "are they"),
  negative("tag-016", "You can't sleep because of the noise, ___?", "can you", "can't you", "do you"),
  negative("tag-017", "He doesn't like his new job, ___?", "does he", "doesn't he", "is he"),
  negative("tag-018", "They haven't visited the new mall, ___?", "have they", "haven't they", "do they"),
  negative("tag-019", "The city won't fix the roads this year, ___?", "will it", "won't it", "does it"),
  negative("tag-020", "This isn't a safe neighborhood, ___?", "is it", "isn't it", "does it"),
  negative("tag-021", "We shouldn't ignore the problem, ___?", "should we", "shouldn't we", "don't we"),
  negative("tag-022", "There isn't enough parking downtown, ___?", "is there", "isn't there", "does it"),
  negative("tag-023", "You don't agree with the new policy, ___?", "do you", "don't you", "are you"),
  negative("tag-024", "She wasn't happy with the decision, ___?", "was she", "wasn't she", "is she"),
];
