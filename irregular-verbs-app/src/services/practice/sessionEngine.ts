import type { AttemptRecord, FieldAttemptResult, PracticeItem, PracticeMode, SelectionStrategy } from "@/domain/practice";
import { ALL_MODES } from "@/domain/practice";
import type { Verb, VerbField } from "@/domain/verb";
import { acceptedAnswersFor } from "@/domain/verb";
import { isMastered } from "@/domain/srs";
import { checkAnswer } from "./answerChecking";
import { generateItem } from "./itemGenerator";
import { pickNextVerb, weakestField, type CardsByVerb } from "./selection";
import { qualityFromAttempt, reviewCard } from "@/services/srs/srsEngine";
import { getProgressRepository, getHistoryRepository, getGamificationRepository } from "@/services/repositories/activeRepositories";
import { computeXpForItem, applyXpAndStreak, type XpBreakdown } from "@/services/gamification/gamificationEngine";
import { verbRepository } from "@/services/repositories/verbRepository";

async function buildCardsByVerb(): Promise<CardsByVerb> {
  const cards = await getProgressRepository().getAll();
  const map: CardsByVerb = new Map();
  for (const card of cards) {
    const list = map.get(card.verbId) ?? [];
    list.push(card);
    map.set(card.verbId, list);
  }
  return map;
}

const NON_MIXED_MODES: PracticeMode[] = ALL_MODES.map((m) => m.id).filter((m) => m !== "mixed-challenge");

function pickAutoMode(): PracticeMode {
  // Mixed Challenge is the default/dominant mode; occasionally surface a focused mode for variety.
  return Math.random() < 0.65 ? "mixed-challenge" : NON_MIXED_MODES[Math.floor(Math.random() * NON_MIXED_MODES.length)];
}

export interface NextItemOptions {
  preferredMode: PracticeMode | "auto-mix";
  selectionStrategy: SelectionStrategy;
  verbs?: Verb[];
}

export async function getNextItem({ preferredMode, selectionStrategy, verbs }: NextItemOptions): Promise<{ item: PracticeItem; verb: Verb }> {
  const pool = verbs ?? verbRepository.getAll();
  const cardsByVerb = await buildCardsByVerb();
  const verb = pickNextVerb(pool, cardsByVerb, selectionStrategy);
  const mode = preferredMode === "auto-mix" ? pickAutoMode() : preferredMode;
  const weak = selectionStrategy === "adaptive" ? weakestField(verb.id, cardsByVerb) : null;
  const item = generateItem(verb.id, mode, weak);
  return { item, verb };
}

export interface SubmitAnswersInput {
  item: PracticeItem;
  verb: Verb;
  answers: Partial<Record<VerbField, string>>;
  hintsUsedByField: Partial<Record<VerbField, number>>;
  responseTimeMs: number;
}

export interface SubmitAnswersOutput {
  results: FieldAttemptResult[];
  allCorrect: boolean;
  xp: XpBreakdown;
  newlyMastered: VerbField[];
}

/** Grades an answered item, updates SRS cards + gamification + history in one pass. */
export async function submitAnswers({ item, verb, answers, hintsUsedByField, responseTimeMs }: SubmitAnswersInput): Promise<SubmitAnswersOutput> {
  const progressRepository = getProgressRepository();
  const historyRepository = getHistoryRepository();
  const gamificationRepository = getGamificationRepository();

  const results: FieldAttemptResult[] = [];
  const newlyMastered: VerbField[] = [];
  let totalHints = 0;

  for (const field of item.askedFields) {
    const userAnswer = answers[field] ?? "";
    const hintsUsed = hintsUsedByField[field] ?? 0;
    totalHints += hintsUsed;

    const accepted = acceptedAnswersFor(verb, field);
    const { correct, matchedAnswer } = checkAnswer(userAnswer, accepted);
    results.push({ field, userAnswer, correct, matchedAnswer });

    const card = await progressRepository.getOrCreate(verb.id, field);
    const wasMastered = isMastered(card);
    const quality = qualityFromAttempt(correct, hintsUsed);
    const updatedCard = reviewCard(card, quality);
    await progressRepository.save(updatedCard);
    if (!wasMastered && isMastered(updatedCard)) newlyMastered.push(field);
  }

  const allCorrect = results.every((r) => r.correct);
  const correctFieldCount = results.filter((r) => r.correct).length;
  const xpEarned = computeXpForItem(correctFieldCount, results.length, totalHints);

  const attempt: AttemptRecord = {
    verbId: verb.id,
    mode: item.mode,
    timestamp: new Date().toISOString(),
    results,
    hintsUsed: totalHints,
    responseTimeMs,
  };
  await historyRepository.addAttempt(attempt, xpEarned);

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
  });
  await gamificationRepository.save(state);

  return { results, allCorrect, xp: result, newlyMastered };
}
