import type { TopicDefinition } from "./grammarTopic";

/**
 * Difficulty ranking is a rough CEFR-grounded proposal for the "learning route"
 * mode: irregular verbs are the prerequisite vocabulary for everything else;
 * describing-problems is vocab-driven with no tense complexity so it precedes
 * tense-based topics; modal/hypothetical topics cluster at the top since they
 * layer a judgment on top of an already-past-tense base.
 */
export const TOPIC_REGISTRY: TopicDefinition[] = [
  {
    id: "irregular-verbs",
    category: "verb-forms",
    exerciseKind: "srs-fields",
    difficultyRank: 1,
    patterns: [],
    status: "live",
  },
  {
    id: "describing-problems",
    category: "grammar",
    exerciseKind: "transformation",
    difficultyRank: 2,
    patterns: [
      { id: "adjective-to-noun", titleKey: "topics.describingProblems.patterns.adjectiveToNoun" },
      { id: "noun-to-adjective", titleKey: "topics.describingProblems.patterns.nounToAdjective" },
    ],
    status: "live",
  },
  {
    id: "past-continuous-vs-simple",
    category: "grammar",
    exerciseKind: "typed",
    difficultyRank: 3,
    patterns: [{ id: "interrupted-past", titleKey: "topics.pastContinuousVsSimple.patterns.interruptedPast" }],
    status: "live",
  },
  {
    id: "past-perfect",
    category: "grammar",
    exerciseKind: "typed",
    difficultyRank: 4,
    patterns: [{ id: "before-past-event", titleKey: "topics.pastPerfect.patterns.beforePastEvent" }],
    status: "live",
  },
  {
    id: "past-accomplishments",
    category: "grammar",
    exerciseKind: "typed",
    difficultyRank: 5,
    patterns: [
      { id: "one-off-simple-past", titleKey: "topics.pastAccomplishments.patterns.oneOffSimplePast" },
      { id: "up-to-now-present-perfect", titleKey: "topics.pastAccomplishments.patterns.upToNowPresentPerfect" },
    ],
    status: "live",
  },
  {
    id: "tag-questions",
    category: "grammar",
    exerciseKind: "multiple-choice",
    difficultyRank: 6,
    patterns: [
      { id: "affirmative-negative-tag", titleKey: "topics.tagQuestions.patterns.affirmativeNegative" },
      { id: "negative-affirmative-tag", titleKey: "topics.tagQuestions.patterns.negativeAffirmative" },
    ],
    status: "live",
  },
  {
    id: "future-will",
    category: "grammar",
    exerciseKind: "typed",
    difficultyRank: 7,
    patterns: [
      { id: "will-simple", titleKey: "topics.futureWill.patterns.willSimple" },
      { id: "future-continuous", titleKey: "topics.futureWill.patterns.futureContinuous" },
      { id: "future-perfect", titleKey: "topics.futureWill.patterns.futurePerfect" },
    ],
    status: "live",
  },
  {
    id: "past-modals-certainty",
    category: "grammar",
    exerciseKind: "multiple-choice",
    difficultyRank: 8,
    patterns: [
      { id: "must-have", titleKey: "topics.pastModalsCertainty.patterns.mustHave" },
      { id: "must-not-have", titleKey: "topics.pastModalsCertainty.patterns.mustNotHave" },
      { id: "may-might-have", titleKey: "topics.pastModalsCertainty.patterns.mayMightHave" },
      { id: "could-have", titleKey: "topics.pastModalsCertainty.patterns.couldHave" },
      { id: "couldnt-have", titleKey: "topics.pastModalsCertainty.patterns.couldntHave" },
    ],
    status: "live",
  },
  {
    id: "past-modals-judgment",
    category: "grammar",
    exerciseKind: "multiple-choice",
    difficultyRank: 9,
    patterns: [
      { id: "judging-past-actions", titleKey: "topics.pastModalsJudgment.patterns.judgingPastActions" },
      { id: "suggesting-alternatives", titleKey: "topics.pastModalsJudgment.patterns.suggestingAlternatives" },
    ],
    status: "live",
  },
  {
    id: "regret-hypotheticals",
    category: "grammar",
    exerciseKind: "multiple-choice",
    difficultyRank: 10,
    patterns: [
      { id: "regret-should-have", titleKey: "topics.regretHypotheticals.patterns.regretShouldHave" },
      { id: "hypothetical-would-could-have", titleKey: "topics.regretHypotheticals.patterns.hypotheticalWouldCouldHave" },
    ],
    status: "live",
  },
];

export function getTopicDefinition(topicId: string): TopicDefinition | undefined {
  return TOPIC_REGISTRY.find((t) => t.id === topicId);
}

export function getLiveTopics(): TopicDefinition[] {
  return TOPIC_REGISTRY.filter((t) => t.status === "live");
}

export function getLiveGrammarTopics(): TopicDefinition[] {
  return TOPIC_REGISTRY.filter((t) => t.status === "live" && t.category === "grammar");
}
