import type { MultipleChoiceExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "past-modals-certainty" as const;

function make(
  id: string,
  patternId: string,
  prompt: string,
  correct: string,
  d1: string,
  d2: string,
  explanation: string,
): MultipleChoiceExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId,
    kind: "multiple-choice",
    prompt,
    choices: [
      { id: "a", text: correct },
      { id: "b", text: d1 },
      { id: "c", text: d2 },
    ],
    correctChoiceId: "a",
    explanation,
  };
}

const MUST_HAVE_EXPLANATION = "Use must have + past participle when something is almost certainly true.";
const MUST_NOT_HAVE_EXPLANATION = "Use must not have + past participle when the negative is almost certainly true.";
const MAY_MIGHT_HAVE_EXPLANATION = "Use may/might have + past participle when something is possible.";
const COULD_HAVE_EXPLANATION = "Use could have + past participle when something is possible.";
const COULDNT_HAVE_EXPLANATION = "Use couldn't have + past participle when something is not possible.";

export const items: MultipleChoiceExerciseItem[] = [
  make("pmc-001", "must-have", "The lights are off and no one answers. She ___ home already.", "must have gone", "must went", "must have go", MUST_HAVE_EXPLANATION),
  make("pmc-002", "must-have", "He's soaking wet. It ___ outside.", "must have rained", "must rained", "must have rain", MUST_HAVE_EXPLANATION),
  make("pmc-003", "must-have", "The food is cold. They ___ it a while ago.", "must have cooked", "must cooked", "must have cook", MUST_HAVE_EXPLANATION),
  make("pmc-004", "must-have", "She looks exhausted. She ___ all night.", "must have worked", "must worked", "must have work", MUST_HAVE_EXPLANATION),
  make("pmc-005", "must-have", "The door is unlocked. Someone ___ it open.", "must have left", "must left", "must have leave", MUST_HAVE_EXPLANATION),
  make("pmc-006", "must-not-have", "He didn't answer the door. He ___ the bell.", "must not have heard", "must not heard", "must not have hear", MUST_NOT_HAVE_EXPLANATION),
  make("pmc-007", "must-not-have", "She seems confused. She ___ the instructions.", "must not have understood", "must not understood", "must not have understand", MUST_NOT_HAVE_EXPLANATION),
  make("pmc-008", "must-not-have", "The plants are dry. He ___ them.", "must not have watered", "must not watered", "must not have water", MUST_NOT_HAVE_EXPLANATION),
  make("pmc-009", "must-not-have", "They look lost. They ___ the map.", "must not have read", "must not read", "must not have readed", MUST_NOT_HAVE_EXPLANATION),
  make("pmc-010", "may-might-have", "He's not answering his phone. He ___ out.", "may have gone", "may went", "may have go", MAY_MIGHT_HAVE_EXPLANATION),
  make("pmc-011", "may-might-have", "She's late. She ___ traffic.", "might have hit", "might hit", "might have hitted", MAY_MIGHT_HAVE_EXPLANATION),
  make("pmc-012", "may-might-have", "The window is broken. Someone ___ in.", "may have broken", "may broken", "may have break", MAY_MIGHT_HAVE_EXPLANATION),
  make("pmc-013", "may-might-have", "He looks upset. Something ___ wrong.", "might have gone", "might went", "might have go", MAY_MIGHT_HAVE_EXPLANATION),
  make("pmc-014", "may-might-have", "She's not here yet. She ___ the bus.", "may have missed", "may missed", "may have miss", MAY_MIGHT_HAVE_EXPLANATION),
  make("pmc-015", "could-have", "He didn't call. He ___ an emergency.", "could have had", "could had", "could have has", COULD_HAVE_EXPLANATION),
  make("pmc-016", "could-have", "The car won't start. The battery ___ dead.", "could have died", "could died", "could have die", COULD_HAVE_EXPLANATION),
  make("pmc-017", "could-have", "She's not answering. Her phone ___ silent.", "could have gone", "could gone", "could have go", COULD_HAVE_EXPLANATION),
  make("pmc-018", "could-have", "The package didn't arrive. It ___ lost.", "could have gotten", "could gotten", "could have get", COULD_HAVE_EXPLANATION),
  make("pmc-019", "couldnt-have", "He ___ about it — he wrote it in his planner.", "couldn't have forgotten", "couldn't forgot", "couldn't have forget", COULDNT_HAVE_EXPLANATION),
  make("pmc-020", "couldnt-have", "She ___ the email — I just saw her reply.", "couldn't have missed", "couldn't missed", "couldn't have miss", COULDNT_HAVE_EXPLANATION),
  make("pmc-021", "couldnt-have", "He ___ the meeting — he was sitting right next to me.", "couldn't have skipped", "couldn't skipped", "couldn't have skip", COULDNT_HAVE_EXPLANATION),
  make("pmc-022", "couldnt-have", "They ___ the flight — I saw them at the gate.", "couldn't have missed", "couldn't missed", "couldn't have miss", COULDNT_HAVE_EXPLANATION),
];
