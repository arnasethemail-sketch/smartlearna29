// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  createInitialStoryState,
  createLessonProgress,
  loadStoryState,
  saveStoryState,
  STORY_PROGRESS_STORAGE_KEY,
} from "../src/features/story-adventures/progress";

describe("Story Adventures progress", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with no fake progress records", () => {
    expect(createInitialStoryState()).toEqual({
      schemaVersion: 1,
      region: "US",
      textScale: "standard",
      progressByLesson: {},
    });
  });

  it("persists real lesson work in localStorage", () => {
    const progress = createLessonProgress("story-001");
    progress.status = "in-progress";
    progress.currentStep = "comprehension";
    progress.comprehensionAnswers.q1 = "The blue footprints led to the library.";
    const state = {
      ...createInitialStoryState(),
      region: "CA" as const,
      progressByLesson: { [progress.lessonId]: progress },
    };

    saveStoryState(state);

    expect(window.localStorage.getItem(STORY_PROGRESS_STORAGE_KEY)).toBeTruthy();
    expect(loadStoryState()).toEqual(state);
  });

  it("falls back safely when stored data is invalid", () => {
    window.localStorage.setItem(STORY_PROGRESS_STORAGE_KEY, "not-json");
    expect(loadStoryState()).toEqual(createInitialStoryState());
  });
});
