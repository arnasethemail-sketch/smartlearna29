import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapters, graphicCourse, wordsById } from "../src/features/graphic-novel/data";

describe("Authored graphic-novel course content", () => {
  it("ships all 24 chronological chapters and preserves the full six-section worksheet structure", () => {
    expect(chapters.map((chapter) => chapter.number)).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(24);
    expect(graphicCourse.config.sectionOrder).toEqual(["graphicNovelReading", "readingComprehension", "vocabularyAndSpelling", "hamburgerParagraph", "textFeaturesHunt", "cumulativeVocabularyBank"]);
    expect(graphicCourse.vocabulary).toHaveLength(54);
    for (const chapter of chapters) {
      expect(chapter.panels.map((panel) => panel.page)).toEqual([1, 1, 1, 1, 2, 2, 2, 2]);
      expect(chapter.panels.every((panel) => panel.narration && panel.artBrief)).toBe(true);
      expect(chapter.comprehension).toHaveLength(5);
      expect(chapter.vocabularyPractice).toHaveLength(3);
      expect(chapter.vocabularyPractice.every((word) => word.spellingAttempts === 5 && wordsById[word.wordId])).toBe(true);
      expect(chapter.textFeaturesHunt.boxes).toHaveLength(4);
      expect(chapter.textFeaturesHunt.boxes.every((box) => box.prompts.length === 3)).toBe(true);
      expect(chapter.hamburgerParagraph.conclusion).toBe("");
      expect([chapter.hamburgerParagraph.detail1, chapter.hamburgerParagraph.detail2, chapter.hamburgerParagraph.detail3].filter((detail) => !detail)).toHaveLength(1);
    }
    expect(new Set(chapters.flatMap((chapter) => chapter.comprehension.map((question) => question.prompt))).size).toBe(120);
    expect(chapters[23].panels.filter((panel) => panel.narration.startsWith("LOOKING BACK:")).length).toBe(3);
  });

  it("includes only introduced unit vocabulary and valid stable bank mappings", () => {
    for (const chapter of chapters) {
      const expected = chapters.filter((item) => item.unit === chapter.unit && item.number <= chapter.number).flatMap((item) => item.newVocabulary.map((word) => word.id));
      const bank = chapter.cumulativeVocabularyBank;
      expect(bank.wordIds).toEqual(expected);
      expect(bank.definitionChoices.map((choice) => choice.correctWordId).sort()).toEqual([...expected].sort());
      expect(bank.synonymChoices.map((choice) => choice.correctWordId).sort()).toEqual([...expected].sort());
      expect(chapter.newVocabulary.length).toBe(chapter.number % 4 === 0 ? 0 : 3);
    }
  });

  it("keeps the raw transcript and private worksheet paths out of the shipped data", () => {
    const shipped = readFileSync(new URL("../src/features/graphic-novel/course.json", import.meta.url), "utf8");
    for (const forbidden of ["verbatimSection", "original_user_transcript", "reference-only/", "Pasted text(1)", '"source":', '"recapSourceRanges":']) expect(shipped).not.toContain(forbidden);
    expect(graphicCourse.config.worksheetPolicy.teacherBannedWords).toEqual([]);
    expect(graphicCourse.config.feedbackPolicy.noKeywordOnlySemanticGrading).toBe(true);
    expect(graphicCourse.config.worksheetPolicy.racpMeaningsVerifiedFromPhotos).toBe(false);
  });
});
