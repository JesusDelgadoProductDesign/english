import type { PracticeItem, PracticeMode } from "@/domain/practice";
import type { VerbField } from "@/domain/verb";
import { VERB_FIELDS } from "@/domain/verb";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Builds the given/asked field split for a verb under a specific mode.
 * `weakField`, when provided (adaptive strategy), is kept out of `givenFields`
 * for modes that pick a random "given" field — so the learner's weakest field
 * gets asked more often instead of handed to them for free.
 */
export function generateItem(verbId: string, mode: PracticeMode, weakField: VerbField | null = null): PracticeItem {
  switch (mode) {
    case "complete-missing-forms":
      return { verbId, mode, givenFields: ["infinitive"], askedFields: ["pastSimple", "pastParticiple"] };

    case "reverse-practice":
      return { verbId, mode, givenFields: ["pastParticiple"], askedFields: ["infinitive", "pastSimple"] };

    case "meaning-practice":
      return { verbId, mode, givenFields: ["infinitive"], askedFields: ["meaning"] };

    case "guess-the-verb":
      return { verbId, mode, givenFields: ["meaning"], askedFields: ["infinitive"] };

    case "complete-everything": {
      const given = pickGivenField(weakField);
      return { verbId, mode, givenFields: [given], askedFields: VERB_FIELDS.filter((f) => f !== given) };
    }

    case "mixed-challenge":
    default: {
      const given = pickGivenField(weakField);
      const remaining = VERB_FIELDS.filter((f) => f !== given);
      // Mixed Challenge asks for a random subset of the remaining fields (1 to all), keeping questions varied.
      const askCount = 1 + Math.floor(Math.random() * remaining.length);
      const askedFields = shuffle(remaining).slice(0, askCount) as VerbField[];
      return { verbId, mode, givenFields: [given], askedFields };
    }
  }
}

/** Chooses which field to reveal as "given". Avoids handing over the learner's weakest field so it stays testable. */
function pickGivenField(weakField: VerbField | null): VerbField {
  const candidates = weakField ? VERB_FIELDS.filter((f) => f !== weakField) : VERB_FIELDS;
  return pickRandom(candidates);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
