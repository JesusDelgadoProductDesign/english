import type { MultipleChoiceExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "regret-hypotheticals" as const;

function regret(id: string, prompt: string, correct: string, d1: string, d2: string): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "regret-should-have",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: d1 },
      { id: "c", text: d2 },
    ],
    correctChoiceId: "a",
    explanation: "Use should have / shouldn't have + past participle to express regret about a past action.",
  };
}

function hypothetical(id: string, prompt: string, correct: string, d1: string, d2: string): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "hypothetical-would-could-have",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: d1 },
      { id: "c", text: d2 },
    ],
    correctChoiceId: "a",
    explanation: "Use would have + past participle for a probable hypothetical outcome, could have + past participle for a possible one.",
  };
}

export const items: MultipleChoiceExerciseItem[] = [
  regret("rh-001", "I ___ an internship while I was in college.", "should have done", "should had done", "should have did"),
  regret("rh-002", "I ___ a student loan.", "shouldn't have taken out", "shouldn't took out", "shouldn't have took out"),
  regret("rh-003", "We ___ so much money on the wedding.", "shouldn't have spent", "shouldn't spent", "shouldn't have spend"),
  regret("rh-004", "He ___ his job without a plan.", "shouldn't have quit", "shouldn't quit", "shouldn't have quitted"),
  regret("rh-005", "I ___ harder for the exam.", "should have studied", "should studied", "should have study"),
  regret("rh-006", "They ___ the contract before signing it.", "should have read", "should read", "should have readed"),
  regret("rh-007", "She ___ her boss about the mistake.", "should have told", "should told", "should have tell"),
  regret("rh-008", "We ___ that road; it was full of traffic.", "shouldn't have taken", "shouldn't taken", "shouldn't have took"),
  regret("rh-009", "I ___ my umbrella this morning.", "should have brought", "should brought", "should have bring"),
  regret("rh-010", "He ___ so rude to the waiter.", "shouldn't have been", "shouldn't been", "shouldn't have be"),
  hypothetical("rh-011", "If I'd listened to my professors, I ___ additional courses.", "would have taken", "would have take", "will have taken"),
  hypothetical("rh-012", "If I hadn't been so irresponsible, I ___ better grades.", "could have gotten", "could have got", "could had gotten"),
  hypothetical("rh-013", "If she had studied medicine, she ___ a doctor now.", "would have become", "would have becomed", "would became"),
  hypothetical("rh-014", "If we had left earlier, we ___ the traffic.", "could have avoided", "could avoided", "could have avoid"),
  hypothetical("rh-015", "If he had saved money, he ___ the house.", "would have bought", "would have buy", "would bought"),
  hypothetical("rh-016", "If I had known about the sale, I ___ more.", "could have saved", "could saved", "could have save"),
  hypothetical("rh-017", "If they had practiced more, they ___ the game.", "would have won", "would have win", "would won"),
  hypothetical("rh-018", "If you had asked, I ___ you.", "could have helped", "could helped", "could have help"),
  hypothetical("rh-019", "If she had left on time, she ___ the flight.", "would have caught", "would have catch", "would catch"),
  hypothetical("rh-020", "If we had brought a map, we ___ lost.", "could have avoided getting", "could avoided getting", "could have avoid getting"),
];
