import type { TypedExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "past-continuous-vs-simple" as const;
const PATTERN_ID = "interrupted-past";
const EXPLANATION_CONTINUOUS =
  "Use past continuous (was/were + -ing) for the ongoing action that was interrupted by the simple-past event.";
const EXPLANATION_SIMPLE =
  "Use simple past for the event that interrupted the ongoing (past continuous) action.";

function continuous(id: string, blankTemplate: string, answer: string): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: PATTERN_ID,
    kind: "typed",
    blankTemplate,
    answers: [answer],
    explanation: EXPLANATION_CONTINUOUS,
  };
}

function simple(id: string, blankTemplate: string, answer: string): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: PATTERN_ID,
    kind: "typed",
    blankTemplate,
    answers: [answer],
    explanation: EXPLANATION_SIMPLE,
  };
}

export const items: TypedExerciseItem[] = [
  continuous("pcvs-001", "While I ___ (work out), it calculated how many calories I burned.", "was working out"),
  continuous(
    "pcvs-002",
    "As scientists ___ (do) research, they discovered that women need more sleep than men.",
    "were doing",
  ),
  continuous(
    "pcvs-003",
    "A man ___ (look for) his cat when he found a suspicious package inside a trash can.",
    "was looking for",
  ),
  continuous("pcvs-004", "She ___ (cook) dinner when the phone rang.", "was cooking"),
  continuous("pcvs-005", "We ___ (watch) a movie when the power went out.", "were watching"),
  continuous("pcvs-006", "I ___ (walk) to school when it started to rain.", "was walking"),
  continuous("pcvs-007", "They ___ (play) soccer when the storm arrived.", "were playing"),
  continuous("pcvs-008", "He ___ (read) a book when his sister called him.", "was reading"),
  continuous("pcvs-009", "The children ___ (sleep) when the earthquake struck.", "were sleeping"),
  continuous("pcvs-010", "I ___ (drive) home when I saw the accident.", "was driving"),
  continuous("pcvs-011", "My parents ___ (have) dinner when I arrived.", "were having"),
  continuous("pcvs-012", "She ___ (take) a shower when the doorbell rang.", "was taking"),
  continuous("pcvs-013", "We ___ (wait) for the bus when it started snowing.", "were waiting"),
  continuous("pcvs-014", "He ___ (study) for the exam when his friends invited him out.", "was studying"),
  continuous("pcvs-015", "I ___ (talk) on the phone when the internet went down.", "was talking"),
  continuous("pcvs-016", "They ___ (build) the bridge when the funding stopped.", "were building"),
  continuous("pcvs-017", "She ___ (paint) the fence when it began to rain.", "was painting"),
  continuous("pcvs-018", "We ___ (discuss) the plan when the manager walked in.", "were discussing"),
  continuous("pcvs-019", "He ___ (jog) in the park when he twisted his ankle.", "was jogging"),
  continuous("pcvs-020", "I ___ (make) coffee when I heard the news on the radio.", "was making"),
  simple("pcvs-021", "While I was working out, it ___ (calculate) how many calories I burned.", "calculated"),
  simple(
    "pcvs-022",
    "As scientists were doing research, they ___ (discover) that women need more sleep than men.",
    "discovered",
  ),
  simple(
    "pcvs-023",
    "A man was looking for his cat when he ___ (find) a suspicious package inside a trash can.",
    "found",
  ),
  simple("pcvs-024", "While she was cooking dinner, the phone ___ (ring).", "rang"),
  simple("pcvs-025", "We were watching a movie when the power ___ (go) out.", "went"),
  simple("pcvs-026", "I was walking to school when it ___ (start) to rain.", "started"),
];
