import type { TopicId } from "./grammarTopic";

interface BaseExerciseItem {
  id: string;
  topicId: TopicId;
  patternId: string;
  explanation: string;
}

export interface TypedExerciseItem extends BaseExerciseItem {
  kind: "typed";
  /** Optional lead-in sentence shown above the blank for extra context. */
  promptContext?: string;
  /** The sentence with a blank marker, e.g. "While I ___ (work out), it calculated how many calories I burned." */
  blankTemplate: string;
  /** Accepted answers, case/punctuation-insensitive (see answerChecking.ts). */
  answers: string[];
}

export interface MultipleChoiceExerciseItem extends BaseExerciseItem {
  kind: "multiple-choice";
  prompt: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
}

export type ProblemForm = "adjective" | "noun";

/** Given a sentence in one form (e.g. adjective), produce its equivalent in another (e.g. noun phrase). */
export interface TransformationExerciseItem extends BaseExerciseItem {
  kind: "transformation";
  sourceSentence: string;
  sourceForm: ProblemForm;
  targetForm: ProblemForm;
  /** The equivalent sentence with a blank marker for the transformed part. */
  targetTemplate: string;
  answers: string[];
}

export type GrammarExerciseItem = TypedExerciseItem | MultipleChoiceExerciseItem | TransformationExerciseItem;
