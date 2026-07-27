/** A single irregular verb entry. Arrays hold every accepted form/translation (e.g. was/were, dreamed/dreamt). */
export interface Verb {
  id: string;
  infinitive: string;
  pastSimple: string[];
  pastParticiple: string[];
  meanings: string[];
}

export type VerbField = "infinitive" | "pastSimple" | "pastParticiple" | "meaning";

export const VERB_FIELDS: VerbField[] = ["infinitive", "pastSimple", "pastParticiple", "meaning"];

/** Returns the accepted answers for a given field, as lowercase canonical strings. */
export function acceptedAnswersFor(verb: Verb, field: VerbField): string[] {
  switch (field) {
    case "infinitive":
      return [verb.infinitive];
    case "pastSimple":
      return verb.pastSimple;
    case "pastParticiple":
      return verb.pastParticiple;
    case "meaning":
      return verb.meanings;
  }
}

/** The canonical (first/primary) form for display purposes. */
export function primaryFormFor(verb: Verb, field: VerbField): string {
  return acceptedAnswersFor(verb, field)[0] ?? "";
}
