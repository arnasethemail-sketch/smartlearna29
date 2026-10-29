import { describe, expect, it } from "vitest";
import { englishQuestionBanks } from "../src/features/english/englishContent";
import { knowledgeQuestionBanks } from "../src/features/knowledge/knowledgeContent";

describe("subject question banks", () => {
  it("provides 20 questions for every English topic", () => {
    Object.values(englishQuestionBanks).forEach((questions) => {
      expect(questions).toHaveLength(20);
    });
  });

  it("provides 20 questions for every Science and Social Studies topic", () => {
    Object.values(knowledgeQuestionBanks).forEach((questions) => {
      expect(questions).toHaveLength(20);
    });
  });
});
