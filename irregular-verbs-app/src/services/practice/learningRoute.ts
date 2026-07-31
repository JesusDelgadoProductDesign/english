import type { TopicDefinition } from "@/domain/grammarTopic";
import { getLiveTopics } from "@/domain/topicRegistry";
import { accuracyFor } from "@/domain/grammarProgress";
import { isMastered } from "@/domain/srs";
import { getGrammarProgressRepository, getProgressRepository } from "@/services/repositories/activeRepositories";
import { verbRepository } from "@/services/repositories/verbRepository";

/** Fraction of verbs that must be mastered before the learning route advances past irregular verbs. */
const VERB_ADVANCE_THRESHOLD = 0.5;
const GRAMMAR_ACCURACY_THRESHOLD = 0.8;
const GRAMMAR_MIN_ATTEMPTS = 5;

async function isVerbTopicMastered(): Promise<boolean> {
  const cards = await getProgressRepository().getAll();
  if (cards.length === 0) return false;
  const masteredVerbIds = new Set(cards.filter(isMastered).map((c) => c.verbId));
  const totalVerbs = verbRepository.getAll().length;
  return totalVerbs > 0 && masteredVerbIds.size / totalVerbs >= VERB_ADVANCE_THRESHOLD;
}

async function isGrammarTopicMastered(topic: TopicDefinition): Promise<boolean> {
  const stats = await getGrammarProgressRepository().getAll();
  const relevant = stats.filter((s) => s.topicId === topic.id);
  if (relevant.length < topic.patterns.length) return false;
  return relevant.every((s) => s.totalAttempts >= GRAMMAR_MIN_ATTEMPTS && accuracyFor(s) >= GRAMMAR_ACCURACY_THRESHOLD);
}

async function isTopicMastered(topic: TopicDefinition): Promise<boolean> {
  return topic.id === "irregular-verbs" ? isVerbTopicMastered() : isGrammarTopicMastered(topic);
}

/** Walks live topics easiest-to-hardest, returning the first one not yet mastered — or the hardest, once all are. */
export async function getNextTopicInRoute(): Promise<TopicDefinition> {
  const liveTopics = getLiveTopics().sort((a, b) => a.difficultyRank - b.difficultyRank);
  for (const topic of liveTopics) {
    if (!(await isTopicMastered(topic))) return topic;
  }
  return liveTopics[liveTopics.length - 1];
}
