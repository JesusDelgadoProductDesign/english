import type { TypedExerciseItem } from "@/domain/grammarExercise";

const TOPIC_ID = "future-will" as const;

function willSimple(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "will-simple",
    kind: "typed",
    blankTemplate,
    answers,
    explanation: "Use will (+ not) to predict a future event or situation.",
  };
}

function futureContinuous(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "future-continuous",
    kind: "typed",
    blankTemplate,
    answers,
    explanation: "Use future continuous (will be + -ing) to predict an ongoing action.",
  };
}

function futurePerfect(id: string, blankTemplate: string, answers: string[]): TypedExerciseItem {
  return {
    id,
    topicId: TOPIC_ID,
    patternId: "future-perfect",
    kind: "typed",
    blankTemplate,
    answers,
    explanation: "Use future perfect (will have + past participle) to predict something completed by a certain time.",
  };
}

export const items: TypedExerciseItem[] = [
  willSimple("fw-001", "In the future, robots ___ (do) most of our housework.", ["will do"]),
  willSimple("fw-002", "By next year, prices ___ (rise) even more.", ["will rise"]),
  willSimple("fw-003", "I think people ___ (not need) cars in big cities someday.", ["will not need", "won't need"]),
  willSimple("fw-004", "Scientists ___ (find) a cure for the disease eventually.", ["will find"]),
  willSimple("fw-005", "She ___ (not attend) the conference next month.", ["will not attend", "won't attend"]),
  willSimple("fw-006", "We ___ (travel) to Mars within our lifetime.", ["will travel"]),
  willSimple("fw-007", "The company ___ (launch) a new product next year.", ["will launch"]),
  willSimple("fw-008", "I doubt they ___ (win) the championship this season.", ["will not win", "won't win"]),
  futureContinuous("fw-009", "This time next week, I ___ (relax) on a beach.", ["will be relaxing"]),
  futureContinuous("fw-010", "By next year, we ___ (live) in a new house.", ["will be living"]),
  futureContinuous("fw-011", "In ten years, most people ___ (work) remotely.", ["will be working"]),
  futureContinuous("fw-012", "At 8pm tonight, she ___ (fly) to Tokyo.", ["will be flying"]),
  futureContinuous("fw-013", "Soon, cars ___ (drive) themselves.", ["will be driving"]),
  futureContinuous("fw-014", "This time tomorrow, I ___ (sit) on a plane.", ["will be sitting"]),
  futureContinuous("fw-015", "By 2030, many people ___ (use) electric cars.", ["will be using"]),
  futurePerfect("fw-016", "Within 50 years, we ___ (set up) a research center on Mars.", ["will have set up"]),
  futurePerfect("fw-017", "By 2050, a company ___ (build) a resort on the moon.", ["will have built"]),
  futurePerfect("fw-018", "By next year, she ___ (finish) her degree.", ["will have finished"]),
  futurePerfect("fw-019", "By the time you arrive, I ___ (leave) already.", ["will have left"]),
  futurePerfect("fw-020", "By 2040, scientists ___ (discover) a cure for many diseases.", ["will have discovered"]),
  futurePerfect("fw-021", "By the end of the decade, this city ___ (grow) significantly.", ["will have grown"]),
  futurePerfect("fw-022", "By next month, they ___ (complete) the project.", ["will have completed"]),
];
