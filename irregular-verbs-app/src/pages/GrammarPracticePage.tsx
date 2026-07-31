import { useParams } from "react-router-dom";
import type { TopicId } from "@/domain/grammarTopic";
import { GrammarPracticeView } from "@/features/grammar/GrammarPracticeView";

export function GrammarPracticePage() {
  const { topicId } = useParams<{ topicId: string }>();
  return <GrammarPracticeView topicId={topicId as TopicId} />;
}
