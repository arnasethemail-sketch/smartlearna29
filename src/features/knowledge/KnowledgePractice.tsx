import { MultipleChoicePractice } from "../english/EnglishPractice";
import {
  getKnowledgeSubject,
  knowledgeQuestionBanks,
  type KnowledgeTopicName,
} from "./knowledgeContent";

type KnowledgePracticeProps = {
  topic: KnowledgeTopicName;
  onBackToTopics: () => void;
};

export function KnowledgePractice({
  topic,
  onBackToTopics,
}: KnowledgePracticeProps) {
  return (
    <MultipleChoicePractice
      subject={getKnowledgeSubject(topic)}
      topic={topic}
      questions={knowledgeQuestionBanks[topic]}
      onBackToTopics={onBackToTopics}
    />
  );
}
