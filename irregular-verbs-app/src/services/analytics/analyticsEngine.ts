import { verbRepository } from "@/services/repositories/verbRepository";
import { getGamificationRepository, getHistoryRepository, getProgressRepository, getSettingsRepository } from "@/services/repositories/activeRepositories";
import { todayKey, type DailyActivity } from "@/services/repositories/historyTypes";
import { isMastered } from "@/domain/srs";
import type { SrsCard } from "@/domain/srs";
import { isDue } from "@/services/srs/srsEngine";
import type { Verb } from "@/domain/verb";

export interface VerbMasterySummary {
  verb: Verb;
  averageConfidence: number;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
}

export interface DashboardStats {
  progress: {
    totalVerbs: number;
    masteredVerbs: number;
    remainingVerbs: number;
    todayAttempts: number;
    todayGoal: number;
  };
  performance: {
    accuracy: number;
    totalAttempts: number;
    averageResponseTimeMs: number;
    totalStudyTimeMs: number;
    currentStreakDays: number;
  };
  learning: {
    weakest: VerbMasterySummary[];
    strongest: VerbMasterySummary[];
    mostReviewed: VerbMasterySummary[];
    leastReviewed: VerbMasterySummary[];
  };
  review: {
    dueToday: number;
    upcoming7Days: number;
    reviewQueueSize: number;
  };
  charts: {
    last30Days: DailyActivity[];
    xpProgression: { date: string; xp: number }[];
    accuracyOverTime: { date: string; accuracy: number }[];
  };
}

function summarize(verb: Verb, cards: SrsCard[]): VerbMasterySummary {
  const totalAttempts = cards.reduce((s, c) => s + c.totalAttempts, 0);
  const totalCorrect = cards.reduce((s, c) => s + c.totalCorrect, 0);
  const averageConfidence = cards.length ? cards.reduce((s, c) => s + c.confidence, 0) / cards.length : 0;
  return {
    verb,
    averageConfidence,
    totalAttempts,
    totalCorrect,
    accuracy: totalAttempts ? totalCorrect / totalAttempts : 0,
  };
}

function last30Dates(): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    dates.push(todayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  return dates;
}

export async function computeDashboardStats(): Promise<DashboardStats> {
  const progressRepository = getProgressRepository();
  const historyRepository = getHistoryRepository();
  const gamificationRepository = getGamificationRepository();
  const settingsRepository = getSettingsRepository();

  const verbs = verbRepository.getAll();
  const [allCards, daily, gamification, dailyGoal, attempts] = await Promise.all([
    progressRepository.getAll(),
    historyRepository.getDailyActivity(),
    gamificationRepository.get(),
    settingsRepository.get().then((s) => s.dailyGoal),
    historyRepository.getAttempts(),
  ]);

  const cardsByVerb = new Map<string, SrsCard[]>();
  for (const card of allCards) {
    const list = cardsByVerb.get(card.verbId) ?? [];
    list.push(card);
    cardsByVerb.set(card.verbId, list);
  }

  const summaries = verbs
    .map((verb) => summarize(verb, cardsByVerb.get(verb.id) ?? []))
    .filter((s) => s.totalAttempts > 0);

  const masteredVerbIds = new Set(allCards.filter(isMastered).map((c) => c.verbId));

  const byWeakness = [...summaries].sort((a, b) => a.averageConfidence - b.averageConfidence);
  const byStrength = [...summaries].sort((a, b) => b.averageConfidence - a.averageConfidence);
  const byReviewCount = [...summaries].sort((a, b) => b.totalAttempts - a.totalAttempts);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueToday = allCards.filter((c) => isDue(c, now)).length;
  const upcoming7Days = allCards.filter((c) => {
    const next = new Date(c.nextReviewAt);
    return next > now && next <= in7Days;
  }).length;

  const dates = last30Dates();
  const last30 = dates.map((d) => daily[d] ?? { date: d, attempts: 0, correct: 0, xpEarned: 0, studyTimeMs: 0 });

  let cumulativeXp = Math.max(0, gamification.xp - last30.reduce((s, d) => s + d.xpEarned, 0));
  const xpProgression = last30.map((d) => {
    cumulativeXp += d.xpEarned;
    return { date: d.date, xp: cumulativeXp };
  });

  const accuracyOverTime = last30.map((d) => ({
    date: d.date,
    accuracy: d.attempts ? d.correct / d.attempts : 0,
  }));

  const totalAttempts = allCards.reduce((s, c) => s + c.totalAttempts, 0);
  const totalCorrect = allCards.reduce((s, c) => s + c.totalCorrect, 0);
  const todayEntry = daily[todayKey(now)];
  const averageResponseTimeMs = attempts.length ? attempts.reduce((s, a) => s + a.responseTimeMs, 0) / attempts.length : 0;

  return {
    progress: {
      totalVerbs: verbs.length,
      masteredVerbs: masteredVerbIds.size,
      remainingVerbs: verbs.length - masteredVerbIds.size,
      todayAttempts: todayEntry?.attempts ?? 0,
      todayGoal: dailyGoal,
    },
    performance: {
      accuracy: totalAttempts ? totalCorrect / totalAttempts : 0,
      totalAttempts,
      averageResponseTimeMs,
      totalStudyTimeMs: Object.values(daily).reduce((s, d) => s + d.studyTimeMs, 0),
      currentStreakDays: gamification.currentStreakDays,
    },
    learning: {
      weakest: byWeakness.slice(0, 5),
      strongest: byStrength.slice(0, 5),
      mostReviewed: byReviewCount.slice(0, 5),
      leastReviewed: [...byReviewCount].reverse().slice(0, 5),
    },
    review: {
      dueToday,
      upcoming7Days,
      reviewQueueSize: dueToday,
    },
    charts: {
      last30Days: last30,
      xpProgression,
      accuracyOverTime,
    },
  };
}
