import { describe, expect, it } from "vitest";
import { englishQuestionBanks } from "../src/features/english/englishContent";
import { knowledgeQuestionBanks } from "../src/features/knowledge/knowledgeContent";

describe("subject question banks", () => {
  it("provides 20 questions for every English topic", () => {
    Object.values(englishQuestionBanks).forEach((questions) => {
      expect(questions).toHaveLength(20);
    });
  });

  it("keeps every spelling answer and spelled-out explanation consistent", () => {
    englishQuestionBanks.Spelling.forEach((question) => {
      expect(question.choices).toHaveLength(4);
      expect(question.choices).toContain(question.answer);
      expect(new Set(question.choices).size).toBe(question.choices.length);
      expect(question.explanation).toBe(
        `The correct spelling is ${question.answer.split("").join("-")}.`,
      );
    });

    const favoriteQuestion = englishQuestionBanks.Spelling.find(
      (question) => question.answer === "favorite",
    );
    expect(favoriteQuestion?.choices).toEqual([
      "favorite",
      "faverite",
      "favrite",
      "favorit",
    ]);
  });

  it("provides 20 questions for every Science and Social Studies topic", () => {
    Object.values(knowledgeQuestionBanks).forEach((questions) => {
      expect(questions).toHaveLength(20);
    });
  });
});
