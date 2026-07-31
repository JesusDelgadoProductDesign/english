import type { PracticeItem } from "./practice";
import type { Verb } from "./verb";
import type { GrammarExerciseItem } from "./grammarExercise";

/**
 * The one place the verb engine and the grammar engine are known to each other —
 * everything else stays siloed per-engine so the verb path is unaffected by
 * grammar-topic changes. Used only by cross-topic selection modes (random-mix,
 * learning-route, weakness-based).
 */
export type StudyQueueEntry =
  | { kind: "verb"; item: PracticeItem; verb: Verb }
  | { kind: "grammar"; item: GrammarExerciseItem };

export type SelectionMode = "single" | "random-mix" | "learning-route" | "weakness-based";
