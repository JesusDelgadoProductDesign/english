import type { Verb, VerbField } from "@/domain/verb";
import { primaryFormFor } from "@/domain/verb";

/**
 * Generic, template-based example sentences per verb form.
 * These are grammatically-safe fill-ins (no assumed object), not curated
 * per-verb prose — a good candidate for a future authored/AI-generated upgrade.
 */
export function exampleSentenceFor(verb: Verb, field: Exclude<VerbField, "meaning">): string {
  if (verb.infinitive === "be") {
    switch (field) {
      case "infinitive":
        return "I want to be more confident.";
      case "pastSimple":
        return "Yesterday, I was at home; they were at school.";
      case "pastParticiple":
        return "I have been here many times before.";
    }
  }

  const form = primaryFormFor(verb, field);
  switch (field) {
    case "infinitive":
      return `I ${form} every day.`;
    case "pastSimple":
      return `Yesterday, I ${form}.`;
    case "pastParticiple":
      return `I have ${form} many times.`;
  }
}

export function allExampleSentences(verb: Verb): Record<Exclude<VerbField, "meaning">, string> {
  return {
    infinitive: exampleSentenceFor(verb, "infinitive"),
    pastSimple: exampleSentenceFor(verb, "pastSimple"),
    pastParticiple: exampleSentenceFor(verb, "pastParticiple"),
  };
}
