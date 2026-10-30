import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hotelStories } from "../src/features/midnight-hotel";

function narrativeWordCount(story: (typeof hotelStories)[number]) {
  return story.sections.flatMap((section) => section.paragraphs).join(" ")
    .match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

describe("Midnight Hotel reading collection", () => {
  it("contains ten complete, ordered stories with substantial narrative in four readable parts", () => {
    expect(hotelStories).toHaveLength(10);
    expect(hotelStories.map((story) => story.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(hotelStories.map((story) => story.id)).size).toBe(10);
    expect(new Set(hotelStories.map((story) => story.title)).size).toBe(10);

    for (const story of hotelStories) {
      expect(story.sections, story.title).toHaveLength(4);
      expect(new Set(story.sections.map((section) => section.title)).size, story.title).toBe(4);
      expect(narrativeWordCount(story), story.title).toBeGreaterThanOrEqual(800);
      expect(narrativeWordCount(story), story.title).toBeLessThanOrEqual(1100);
      expect(story.sections.every((section) => section.title.trim() && section.paragraphs.length > 0 && section.paragraphs.every((paragraph) => paragraph.trim())), story.title).toBe(true);
    }
  });

  it("provides a distinct, shipped illustration and descriptive alternative text for each story", () => {
    expect(new Set(hotelStories.map((story) => story.illustration.src)).size).toBe(10);
    for (const story of hotelStories) {
      expect(story.illustration.src).toBe(`/midnight-hotel/story-${String(story.number).padStart(2, "0")}.webp`);
      expect(story.illustration.alt.length, story.title).toBeGreaterThan(40);
      expect(existsSync(join(process.cwd(), "public", story.illustration.src.slice(1))), story.illustration.src).toBe(true);
    }
  });
});
