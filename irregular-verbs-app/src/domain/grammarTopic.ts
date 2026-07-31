export type TopicId =
  | "irregular-verbs"
  | "past-continuous-vs-simple"
  | "past-perfect"
  | "describing-problems"
  | "future-will"
  | "regret-hypotheticals"
  | "past-modals-certainty"
  | "past-modals-judgment"
  | "tag-questions"
  | "past-accomplishments";

/** "srs-fields" is the existing irregular-verbs mode; new grammar topics use typed or multiple-choice. */
export type ExerciseKind = "srs-fields" | "typed" | "multiple-choice";

export type TopicCategory = "verb-forms" | "grammar";

export type TopicStatus = "live" | "planned";

export interface GrammarPattern {
  id: string;
  titleKey: string;
}

export interface TopicDefinition {
  id: TopicId;
  category: TopicCategory;
  exerciseKind: ExerciseKind;
  /** 1 = easiest, 10 = hardest — drives the "learning route" selection mode. */
  difficultyRank: number;
  patterns: GrammarPattern[];
  status: TopicStatus;
}
