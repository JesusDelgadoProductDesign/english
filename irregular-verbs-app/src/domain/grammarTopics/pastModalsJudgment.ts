import type { MultipleChoiceExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "past-modals-judgment" as const;

function judging(id: string, prompt: string, correct: string, d1: string, d2: string): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "judging-past-actions",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: d1 },
      { id: "c", text: d2 },
    ],
    correctChoiceId: "a",
    explanation: "Use should have / shouldn't have + past participle to judge a past action.",
  };
}

function suggesting(id: string, prompt: string, correct: string, d1: string, d2: string): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "suggesting-alternatives",
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: d1 },
      { id: "c", text: d2 },
    ],
    correctChoiceId: "a",
    explanation: "Use could have / would have / wouldn't have + past participle to suggest an alternative past action.",
  };
}

export const items: MultipleChoiceExerciseItem[] = [
  judging("pmj-001", "You ___ your sister to help.", "should have asked", "should asked", "should have ask"),
  judging("pmj-002", "He ___ your car without permission.", "shouldn't have used", "shouldn't used", "shouldn't have use"),
  judging("pmj-003", "They ___ so much noise at night.", "shouldn't have made", "shouldn't made", "shouldn't have make"),
  judging("pmj-004", "She ___ him like that.", "shouldn't have talked to", "shouldn't talked to", "shouldn't have talk to"),
  judging("pmj-005", "You ___ before making that decision.", "should have thought", "should thought", "should have think"),
  judging("pmj-006", "We ___ the schedule with the team.", "should have shared", "should shared", "should have share"),
  judging("pmj-007", "He ___ that comment.", "shouldn't have made", "shouldn't made", "shouldn't have make"),
  judging("pmj-008", "They ___ the plan before starting.", "should have reviewed", "should reviewed", "should have review"),
  judging("pmj-009", "You ___ the risk before investing.", "should have considered", "should considered", "should have consider"),
  judging("pmj-010", "She ___ so harshly.", "shouldn't have reacted", "shouldn't reacted", "shouldn't have react"),
  suggesting("pmj-011", "You ___ her that you had to get up early.", "could have told", "could told", "could have tell"),
  suggesting("pmj-012", "I ___ them to help clean up the place.", "would have asked", "would asked", "would have ask"),
  suggesting("pmj-013", "I ___ them to spend the weekend.", "wouldn't have invited", "wouldn't invited", "wouldn't have invite"),
  suggesting("pmj-014", "You ___ a different route to avoid traffic.", "could have taken", "could took", "could have take"),
  suggesting("pmj-015", "I ___ a smaller car instead.", "would have bought", "would bought", "would have buy"),
  suggesting("pmj-016", "We ___ them about the change of plans.", "could have warned", "could warned", "could have warn"),
  suggesting("pmj-017", "I ___ the money on something else.", "wouldn't have spent", "wouldn't spent", "wouldn't have spend"),
  suggesting("pmj-018", "You ___ a professional instead of doing it yourself.", "could have hired", "could hired", "could have hire"),
  suggesting("pmj-019", "I ___ that job offer.", "would have accepted", "would accepted", "would have accept"),
  suggesting("pmj-020", "We ___ earlier to avoid the rush.", "could have left", "could left", "could have leave"),
];
