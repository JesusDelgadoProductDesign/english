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

export type GrammarAnswer =
  | { kind: "typed"; text: string }
  | { kind: "multiple-choice"; choiceId: string }
  | { kind: "transformation"; text: string };

export interface SubmitGrammarAnswerInput {
  item: GrammarExerciseItem;
  answer: GrammarAnswer;
  responseTimeMs: number;
}

/** A sentence with its key answer segment isolated, so the UI can render it emphasized without re-searching the text. */
export interface FilledSentence {
  before: string;
  answer: string;
  after: string;
}

export interface SubmitGrammarAnswerOutput {
  correct: boolean;
  correctAnswerText: string;
  correctSentence: FilledSentence;
  userSentence: FilledSentence | null;
  explanation: string;
  xp: XpBreakdown;
}

function gradeAnswer(
  item: GrammarExerciseItem,
  answer: GrammarAnswer,
): { correct: boolean; correctAnswerText: string; userAnswerText: string } {
  if (item.kind === "typed" || item.kind === "transformation") {
    const userText = answer.kind === "typed" || answer.kind === "transformation" ? answer.text : "";
    const { correct } = checkAnswer(userText, item.answers);
    return { correct, correctAnswerText: item.answers[0], userAnswerText: userText };
  }

  const chosenId = answer.kind === "multiple-choice" ? answer.choiceId : "";
  const correctChoice = item.choices.find((c) => c.id === item.correctChoiceId);
  const chosenChoice = item.choices.find((c) => c.id === chosenId);
  return {
    correct: chosenId === item.correctChoiceId,
    correctAnswerText: correctChoice?.text ?? "",
    userAnswerText: chosenChoice?.text ?? "",
  };
}

/** The sentence template for an item — the one place its blank marker lives, regardless of exercise kind. */
function templateFor(item: GrammarExerciseItem): string {
  if (item.kind === "typed") return item.blankTemplate;
  if (item.kind === "transformation") return item.targetTemplate;
  return item.prompt;
}

/**
 * Fills the blank with the given value, also stripping an immediately-following
 * "(verb)" hint like "___ (drive)" — that hint is only meaningful in the
 * question prompt, not once the answer has replaced the blank.
 */
function fillBlank(template: string, value: string): FilledSentence {
  const withHint = template.match(/___\s*\([^)]*\)/);
  if (withHint) {
    const idx = template.indexOf(withHint[0]);
    return { before: template.slice(0, idx), answer: value, after: template.slice(idx + withHint[0].length) };
  }
  const idx = template.indexOf("___");
  if (idx === -1) return { before: template, answer: value, after: "" };
  return { before: template.slice(0, idx), answer: value, after: template.slice(idx + 3) };
}

/** Grades a grammar exercise, updates per-pattern accuracy + gamification (XP/streak/leaderboard stay unified with verb practice). */
export async function submitGrammarAnswer({ item, answer }: SubmitGrammarAnswerInput): Promise<SubmitGrammarAnswerOutput> {
  const { correct, correctAnswerText, userAnswerText } = gradeAnswer(item, answer);
  const template = templateFor(item);
  const correctSentence = fillBlank(template, correctAnswerText);
  const userSentence = correct ? null : fillBlank(template, userAnswerText);
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

  return { correct, correctAnswerText, correctSentence, userSentence, explanation: item.explanation, xp: result };
}
