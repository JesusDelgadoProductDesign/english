import type { TopicId } from "@/domain/grammarTopic";
import type { GrammarExerciseItem } from "@/domain/grammarExercise";
import { getItemBank } from "@/domain/grammarTopics";
import { isMastered } from "@/domain/srs";
import { checkAnswer } from "./answerChecking";
import { pickPattern } from "./patternSelection";
import {
  getGrammarProgressRepository,
  getGamificationRepository,
  getProgressRepository,
} from "@/services/repositories/activeRepositories";
import { computeXpForItem, applyXpAndStreak, type XpBreakdown } from "@/services/gamification/gamificationEngine";
import { verbRepository } from "@/services/repositories/verbRepository";
import { recordXp } from "@/services/leaderboard/leaderboardService";

export interface NextGrammarItemOptions {
  topicId: TopicId;
  patternFilter?: string[];
}

export async function getNextGrammarItem({ topicId, patternFilter }: NextGrammarItemOptions): Promise<{ item: GrammarExerciseItem }> {
  const bank = getItemBank(topicId);
  if (bank.length === 0) throw new Error(`No exercise items available for topic "${topicId}" yet.`);

  const stats = await getGrammarProgressRepository().getAll();
  const patternId = pickPattern(bank, stats, patternFilter);
  const candidates = bank.filter((i) => i.patternId === patternId);
  const item = candidates[Math.floor(Math.random() * candidates.length)];
  return { item };
}

export type GrammarAnswer = { kind: "typed"; text: string } | { kind: "multiple-choice"; choiceId: string };

export interface SubmitGrammarAnswerInput {
  item: GrammarExerciseItem;
  answer: GrammarAnswer;
  responseTimeMs: number;
}

export interface SubmitGrammarAnswerOutput {
  correct: boolean;
  correctAnswerText: string;
  explanation: string;
  xp: XpBreakdown;
}

function gradeAnswer(item: GrammarExerciseItem, answer: GrammarAnswer): { correct: boolean; correctAnswerText: string } {
  if (item.kind === "typed") {
    const userText = answer.kind === "typed" ? answer.text : "";
    const { correct } = checkAnswer(userText, item.answers);
    return { correct, correctAnswerText: item.answers[0] };
  }

  const chosenId = answer.kind === "multiple-choice" ? answer.choiceId : "";
  const correctChoice = item.choices.find((c) => c.id === item.correctChoiceId);
  return { correct: chosenId === item.correctChoiceId, correctAnswerText: correctChoice?.text ?? "" };
}

/** Grades a grammar exercise, updates per-pattern accuracy + gamification (XP/streak/leaderboard stay unified with verb practice). */
export async function submitGrammarAnswer({ item, answer }: SubmitGrammarAnswerInput): Promise<SubmitGrammarAnswerOutput> {
  const { correct, correctAnswerText } = gradeAnswer(item, answer);
  const now = new Date();

  const grammarProgressRepository = getGrammarProgressRepository();
  await grammarProgressRepository.recordAttempt(item.topicId, item.patternId, correct, now);

  const xpEarned = computeXpForItem(correct ? 1 : 0, 1, 0);

  const progressRepository = getProgressRepository();
  const gamificationRepository = getGamificationRepository();
  const allCards = await progressRepository.getAll();
  const masteredCount = new Set(allCards.filter(isMastered).map((c) => c.verbId)).size;
  const totalAttempts = allCards.reduce((sum, c) => sum + c.totalAttempts, 0);
  const totalCorrect = allCards.reduce((sum, c) => sum + c.totalCorrect, 0);

  const gamification = await gamificationRepository.get();
  const { state, result } = applyXpAndStreak(gamification, xpEarned, {
    totalAttempts,
    totalCorrect,
    masteredCount,
    totalVerbs: verbRepository.getAll().length,
  }, now);
  await gamificationRepository.save(state);

  try {
    await recordXp(xpEarned);
  } catch (err) {
    console.error("Failed to record leaderboard XP:", err);
  }

  return { correct, correctAnswerText, explanation: item.explanation, xp: result };
}
