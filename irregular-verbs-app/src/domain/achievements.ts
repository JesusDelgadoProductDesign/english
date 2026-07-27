import type { Achievement } from "./gamification";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Answer your first 10 questions.",
    check: (ctx) => ctx.totalAttempts >= 10,
  },
  {
    id: "century",
    title: "Century",
    description: "Reach 100 correct answers.",
    check: (ctx) => ctx.totalCorrect >= 100,
  },
  {
    id: "on-a-roll",
    title: "On a Roll",
    description: "Keep a 3-day study streak.",
    check: (ctx) => ctx.currentStreakDays >= 3,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Keep a 7-day study streak.",
    check: (ctx) => ctx.currentStreakDays >= 7,
  },
  {
    id: "verb-scholar",
    title: "Verb Scholar",
    description: "Master 25 verbs.",
    check: (ctx) => ctx.masteredCount >= 25,
  },
  {
    id: "verb-master",
    title: "Verb Master",
    description: "Master every verb in the deck.",
    check: (ctx) => ctx.totalVerbs > 0 && ctx.masteredCount >= ctx.totalVerbs,
  },
  {
    id: "rising-star",
    title: "Rising Star",
    description: "Reach level 5.",
    check: (ctx) => ctx.level >= 5,
  },
];
