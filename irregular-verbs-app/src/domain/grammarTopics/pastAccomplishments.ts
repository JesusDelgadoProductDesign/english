import type { TypedExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "past-accomplishments" as const;

function oneOff(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "one-off-simple-past",
    kind: "typed",
    blankTemplate,
    answers,
    explanation: "Use managed to / was (or were) able to + verb with the simple past for a one-off past accomplishment.",
  };
}

function upToNow(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "up-to-now-present-perfect",
    kind: "typed",
    blankTemplate,
    answers,
    explanation: "Use 've/'s managed to / been able to + verb with the present perfect for an accomplishment up to now.",
  };
}

export const items: TypedExerciseItem[] = [
  oneOff("pa-001", "I ___ quit my nine-to-five job two years ago.", ["managed to", "was able to"]),
  oneOff("pa-002", "She ___ finish the marathon last year.", ["managed to", "was able to"]),
  oneOff("pa-003", "He ___ save enough money for a house.", ["managed to", "was able to"]),
  oneOff("pa-004", "We ___ fix the car ourselves.", ["managed to", "were able to"]),
  oneOff("pa-005", "They ___ book the last two tickets.", ["managed to", "were able to"]),
  oneOff("pa-006", "I ___ get good grades in school.", ["didn't manage to", "wasn't able to"]),
  oneOff("pa-007", "She ___ travel much on her last job.", ["didn't manage to", "wasn't able to"]),
  oneOff("pa-008", "He ___ finish the project on time.", ["didn't manage to", "wasn't able to"]),
  oneOff("pa-009", "We ___ find a parking spot.", ["didn't manage to", "weren't able to"]),
  oneOff("pa-010", "They ___ reach the summit before the storm.", ["didn't manage to", "weren't able to"]),
  upToNow("pa-011", "I've ___ make a living with my music.", ["managed to", "been able to"]),
  upToNow("pa-012", "She's ___ build a successful business.", ["managed to", "been able to"]),
  upToNow("pa-013", "We've ___ save a lot of money this year.", ["managed to", "been able to"]),
  upToNow("pa-014", "He's ___ learn three languages.", ["managed to", "been able to"]),
  upToNow("pa-015", "I haven't ___ record an album yet.", ["managed to", "been able to"]),
  upToNow("pa-016", "I haven't ___ achieve many of my goals.", ["managed to", "been able to"]),
  upToNow("pa-017", "She hasn't ___ finish her novel yet.", ["managed to", "been able to"]),
  upToNow("pa-018", "We haven't ___ pay off the loan yet.", ["managed to", "been able to"]),
  upToNow("pa-019", "He hasn't ___ get his license yet.", ["managed to", "been able to"]),
  upToNow("pa-020", "They haven't ___ sell the house yet.", ["managed to", "been able to"]),
];
