import type { SelectionStrategy } from "@/domain/practice";
import type { SrsCard } from "@/domain/srs";
import { isDue } from "@/services/srs/srsEngine";
import type { Verb, VerbField } from "@/domain/verb";
import { VERB_FIELDS } from "@/domain/verb";

export type CardsByVerb = Map<string, SrsCard[]>;

function averageConfidence(cards: SrsCard[] | undefined): number {
  if (!cards || cards.length === 0) return 0;
  return cards.reduce((sum, c) => sum + c.confidence, 0) / cards.length;
}

function weightedPick<T>(items: T[], weightOf: (item: T) => number): T {
  const weights = items.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];

  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Picks the next verb to practice.
 * - random: uniform.
 * - weighted: inversely proportional to overall mastery (weaker verbs shown more often).
 * - adaptive: prioritizes verbs whose SRS review is due, falling back to weighted mastery otherwise.
 */
export function pickNextVerb(verbs: Verb[], cardsByVerb: CardsByVerb, strategy: SelectionStrategy): Verb {
  if (strategy === "random") {
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  if (strategy === "adaptive") {
    const due = verbs.filter((v) => {
      const cards = cardsByVerb.get(v.id);
      return !cards || cards.length === 0 || cards.some((c) => isDue(c));
    });
    const pool = due.length > 0 ? due : verbs;
    return weightedPick(pool, (v) => 1 - averageConfidence(cardsByVerb.get(v.id)) + 0.05);
  }

  // weighted
  return weightedPick(verbs, (v) => 1 - averageConfidence(cardsByVerb.get(v.id)) + 0.05);
}

/** The field this learner struggles with most for a given verb (used to bias adaptive questions toward it). */
export function weakestField(verbId: string, cardsByVerb: CardsByVerb): VerbField | null {
  const cards = cardsByVerb.get(verbId);
  if (!cards || cards.length === 0) return null;

  const byField = new Map(cards.map((c) => [c.field, c] as const));
  let weakest: VerbField | null = null;
  let lowest = Infinity;
  for (const field of VERB_FIELDS) {
    const confidence = byField.get(field)?.confidence ?? 0;
    if (confidence < lowest) {
      lowest = confidence;
      weakest = field;
    }
  }
  return weakest;
}
