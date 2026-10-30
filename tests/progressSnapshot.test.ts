// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applySnapshotToLegacyStorage,
  createEmptyLearningProgressSnapshot,
  LEARNING_PROGRESS_APPLIED_EVENT,
  mergeLearningProgressSnapshots,
  readLegacyProgressSnapshot,
} from "../src/features/progress";
import { createLessonProgress } from "../src/features/story-adventures/progress";
import type {
  LearningProgressSnapshot,
  PracticeAttempt,
} from "../src/features/progress";

function attempt(
  attemptId: string,
  status: PracticeAttempt["status"],
  updatedAt: string,
): PracticeAttempt {
  return {
    attemptId,
    subject: "Math",
    topic: "Addition",
    answered: status === "completed" ? 20 : 4,
    total: 20,
    score: status === "completed" ? 18 : 3,
    status,
    startedAt: "2026-01-01T00:00:00.000Z",
    updatedAt,
    ...(status === "completed" ? { completedAt: updatedAt } : {}),
  };
}

function snapshotAt(updatedAt: string): LearningProgressSnapshot {
  return createEmptyLearningProgressSnapshot(updatedAt);
}

describe("learning progress snapshot", () => {
  beforeEach(() => window.localStorage.clear());

  it("merges story lessons by lastUpdatedAt, best times by minimum, and attempts by id", () => {
    const left = snapshotAt("2026-05-01T00:00:00.000Z");
    left.storyAdventureState.region = "US";
    left.storyAdventureState.progressByLesson.lesson1 = {
      ...createLessonProgress("lesson1"),
      status: "completed",
      lastUpdatedAt: "2026-04-10T00:00:00.000Z",
    };
    left.bestTimesSeconds = {
      addition: 42,
      subtraction: null,
      fractions: 55,
    };
    left.activeAttempts.shared = attempt(
      "shared",
      "in-progress",
      "2026-04-10T00:00:00.000Z",
    );
    left.activeAttempts.local = attempt(
      "local",
      "in-progress",
      "2026-04-11T00:00:00.000Z",
    );

    const right = snapshotAt("2026-06-01T00:00:00.000Z");
    right.storyAdventureState.region = "CA";
    right.storyAdventureState.progressByLesson.lesson1 = {
      ...createLessonProgress("lesson1"),
      status: "in-progress",
      lastUpdatedAt: "2026-03-01T00:00:00.000Z",
    };
    right.storyAdventureState.progressByLesson.lesson2 = {
      ...createLessonProgress("lesson2"),
      status: "in-progress",
      lastUpdatedAt: "2026-05-15T00:00:00.000Z",
    };
    right.bestTimesSeconds = {
      addition: 35,
      subtraction: 48,
      fractions: null,
    };
    right.completedAttempts = [
      attempt("shared", "completed", "2026-05-20T00:00:00.000Z"),
    ];

    const merged = mergeLearningProgressSnapshots(left, right);

    expect(merged.storyAdventureState.region).toBe("CA");
    expect(merged.storyAdventureState.progressByLesson.lesson1.status).toBe(
      "completed",
    );
    expect(merged.storyAdventureState.progressByLesson.lesson2.status).toBe(
      "in-progress",
    );
    expect(merged.bestTimesSeconds).toEqual({
      addition: 35,
      subtraction: 48,
      fractions: 55,
    });
    expect(merged.activeAttempts.local).toBeTruthy();
    expect(merged.activeAttempts.shared).toBeUndefined();
    expect(merged.completedAttempts.map((item) => item.attemptId)).toEqual([
      "shared",
    ]);
  });

  it("applies hosted data to legacy keys once and emits a refresh event", () => {
    const applied = vi.fn();
    window.addEventListener(LEARNING_PROGRESS_APPLIED_EVENT, applied);
    const snapshot = snapshotAt("2026-06-01T00:00:00.000Z");
    snapshot.storyAdventureState.region = "CA";
    snapshot.bestTimesSeconds = {
      addition: 31,
      subtraction: 44,
      fractions: 52,
    };

    expect(applySnapshotToLegacyStorage(snapshot)).toBe(true);
    expect(applied).toHaveBeenCalledTimes(1);
    expect(readLegacyProgressSnapshot()).toMatchObject({
      storyAdventureState: { region: "CA" },
      bestTimesSeconds: {
        addition: 31,
        subtraction: 44,
        fractions: 52,
      },
    });

    expect(applySnapshotToLegacyStorage(snapshot)).toBe(false);
    expect(applied).toHaveBeenCalledTimes(1);
    window.removeEventListener(LEARNING_PROGRESS_APPLIED_EVENT, applied);
  });
});
