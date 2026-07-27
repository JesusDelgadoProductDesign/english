import type { VerbField } from "./verb";

export type PracticeMode =
  | "complete-missing-forms"
  | "reverse-practice"
  | "meaning-practice"
  | "guess-the-verb"
  | "complete-everything"
  | "mixed-challenge";

export type SelectionStrategy = "random" | "weighted" | "adaptive";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type HintType =
  | "first-letter"
  | "letter-count"
  | "missing-vowels"
  | "missing-consonants"
  | "reveal-on-attempt";

export type FeedbackMode =
  | "immediate-correction"
  | "hints-only"
  | "progressive-hints"
  | "explanation-after-failure"
  | "retry-until-correct";

/** One question presented to the learner: a verb, a set of fields already given, and fields to fill in. */
export interface PracticeItem {
  verbId: string;
  mode: PracticeMode;
  givenFields: VerbField[];
  askedFields: VerbField[];
}

export interface FieldAttemptResult {
  field: VerbField;
  userAnswer: string;
  correct: boolean;
  matchedAnswer?: string;
}

export interface AttemptRecord {
  verbId: string;
  mode: PracticeMode;
  timestamp: string;
  results: FieldAttemptResult[];
  hintsUsed: number;
  responseTimeMs: number;
}

export const ALL_MODES: { id: PracticeMode; label: string; description: string }[] = [
  {
    id: "mixed-challenge",
    label: "Mixed Challenge",
    description: "One random field is given; fill in the rest. The default, most balanced mode.",
  },
  {
    id: "complete-missing-forms",
    label: "Complete the Missing Forms",
    description: "Given the infinitive, complete past simple and past participle.",
  },
  {
    id: "reverse-practice",
    label: "Reverse Practice",
    description: "Given the past participle, complete infinitive and past simple.",
  },
  {
    id: "meaning-practice",
    label: "Meaning Practice",
    description: "Given the infinitive, translate its meaning.",
  },
  {
    id: "guess-the-verb",
    label: "Guess the Verb",
    description: "Given the meaning, name the infinitive.",
  },
  {
    id: "complete-everything",
    label: "Complete Everything",
    description: "Given one form, complete every other field including meaning.",
  },
];
