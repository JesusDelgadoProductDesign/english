import type { TypedExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "past-perfect" as const;
const PATTERN_ID = "before-past-event";
const EXPLANATION =
  "Use past perfect (had + past participle) for the event that happened before another past event, which stays in simple past.";

function item(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return { id, topicId: TOPIC_ID, patternId: PATTERN_ID, kind: "typed", blankTemplate, answers, explanation: EXPLANATION };
}

export const items: TypedExerciseItem[] = [
  item("pp-001", "When I came back, someone ___ (steal) it.", ["had stolen"]),
  item("pp-002", "They were able to steal it because I ___ (forget) to lock it up.", ["had forgotten"]),
  item("pp-003", "By the time we arrived, the movie ___ (start) already.", ["had already started", "had started already"]),
  item("pp-004", "She was tired because she ___ (run) five miles that morning.", ["had run"]),
  item("pp-005", "I couldn't call you because I ___ (lose) my phone.", ["had lost"]),
  item("pp-006", "He didn't recognize the city because it ___ (change) so much.", ["had changed"]),
  item("pp-007", "We were hungry because we ___ (not eat) all day.", ["had not eaten", "hadn't eaten"]),
  item("pp-008", "The train ___ (leave) by the time we got to the station.", ["had left"]),
  item("pp-009", "I realized I ___ (leave) my keys at home.", ["had left"]),
  item("pp-010", "She was upset because someone ___ (break) her favorite mug.", ["had broken"]),
  item("pp-011", "By the time the police arrived, the thief ___ (disappear).", ["had disappeared"]),
  item("pp-012", "He felt sick because he ___ (eat) too much cake.", ["had eaten"]),
  item("pp-013", "I had just parked my bike when someone ___ (steal) it.", ["stole"]),
  item("pp-014", "She had finished her homework before her mom ___ (come) home.", ["came"]),
  item("pp-015", "We had already eaten when the waiter ___ (bring) the menu.", ["brought"]),
  item("pp-016", "He had studied all night, so he ___ (pass) the exam easily.", ["passed"]),
  item("pp-017", "They had packed their bags before the taxi ___ (arrive).", ["arrived"]),
  item("pp-018", "I had never seen snow before I ___ (move) to Canada.", ["moved"]),
  item("pp-019", "She had cleaned the house before her guests ___ (arrive).", ["arrived"]),
  item("pp-020", "We had waited for an hour before the doctor finally ___ (see) us.", ["saw"]),
  item("pp-021", "He had saved enough money before he ___ (buy) the car.", ["bought"]),
  item("pp-022", "I had turned off my phone before the meeting ___ (begin).", ["began"]),
  item("pp-023", "They had left the party before it ___ (get) too crowded.", ["got"]),
  item("pp-024", "She had practiced for months before she ___ (win) the competition.", ["won"]),
];
