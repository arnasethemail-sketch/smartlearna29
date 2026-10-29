import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { storyLessons } from "../src/features/story-adventures/content";
import {
  INFORMATIONAL_LESSON_NUMBERS,
  STORY_LESSON_TITLES,
} from "../src/features/story-adventures/lessonTitles";
import {
  countStoryWords,
  validateStoryLessons,
} from "../src/features/story-adventures/validateLessons";

describe("Story Adventures curriculum", () => {
  it("contains 100 fully authored lessons in the required order", () => {
    const report = validateStoryLessons(storyLessons);

    expect(report.errors, report.errors.join("\n")).toEqual([]);
    expect(storyLessons).toHaveLength(100);
    expect(storyLessons.map((lesson) => lesson.title)).toEqual([
      ...STORY_LESSON_TITLES,
    ]);
    expect(new Set(storyLessons.map((lesson) => lesson.id)).size).toBe(100);
    expect(new Set(storyLessons.map((lesson) => lesson.illustration.sceneKey)).size).toBe(100);
  });

  it("keeps every reading between 450 and 620 words with complete activities", () => {
    storyLessons.forEach((lesson) => {
      expect(countStoryWords(lesson)).toBeGreaterThanOrEqual(450);
      expect(countStoryWords(lesson)).toBeLessThanOrEqual(620);
      expect(lesson.pages).toHaveLength(2);
      expect(lesson.vocabulary).toHaveLength(3);
      expect(lesson.comprehension).toHaveLength(5);
      expect(lesson.textFeatures).toHaveLength(4);
      expect(lesson.paragraphTask.sentenceOptions.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("stores credible source links for every informational lesson", () => {
    storyLessons.forEach((lesson) => {
      expect(lesson.informational).toBe(
        INFORMATIONAL_LESSON_NUMBERS.has(lesson.sequence),
      );
      if (lesson.informational) {
        expect(lesson.sourceReferences.length).toBeGreaterThan(0);
        lesson.sourceReferences.forEach((source) => {
          expect(source.url.startsWith("https://")).toBe(true);
        });
      }
    });
  });

  it("has every one of the 100 lesson-specific illustration assets", () => {
    const hashes = new Set<string>();
    storyLessons.forEach((lesson) => {
      const file = resolve(
        process.cwd(),
        "public",
        lesson.illustration.src.replace(/^\//u, ""),
      );
      expect(existsSync(file), file).toBe(true);
      const svg = readFileSync(file, "utf8");
      hashes.add(createHash("sha256").update(svg).digest("hex"));
      expect(svg).toContain(`data-lesson="${lesson.sequence}"`);
      expect(svg).toContain(`data-scene-key="${lesson.illustration.sceneKey}"`);
      expect(svg.match(/data-cue=/gu)?.length ?? 0).toBeGreaterThanOrEqual(3);
    });
    expect(hashes.size).toBe(100);
  });

  it.each([1, 20, 40, 60, 80, 100])(
    "passes the representative lesson %i contract",
    (sequence) => {
      const lesson = storyLessons[sequence - 1];
      expect(lesson.sequence).toBe(sequence);
      expect(lesson.title).toBe(STORY_LESSON_TITLES[sequence - 1]);
      expect(lesson.objective.length).toBeGreaterThan(24);
      expect(lesson.skillTags.length).toBeGreaterThanOrEqual(2);
      expect(lesson.pages.every((page) => page.paragraphs.length > 0)).toBe(true);
      expect(lesson.comprehension.every((question) => question.evidence.length > 0)).toBe(true);
      expect(lesson.paragraphTask.modelParagraph.length).toBeGreaterThan(40);
    },
  );
});
