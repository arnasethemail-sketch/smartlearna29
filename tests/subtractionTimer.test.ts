// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  formatSubtractionTime,
  loadSubtractionBestTime,
  resolveSubtractionBestTime,
  saveSubtractionBestTime,
  SUBTRACTION_BEST_TIME_STORAGE_KEY,
} from "../src/features/subtraction/subtractionTimer";

beforeEach(() => {
  window.localStorage.clear();
});

describe("subtraction round timer", () => {
  it("formats minutes and seconds", () => {
    expect(formatSubtractionTime(5)).toBe("00:05");
    expect(formatSubtractionTime(92)).toBe("01:32");
    expect(formatSubtractionTime(615)).toBe("10:15");
  });

  it("stores only a new faster time", () => {
    expect(resolveSubtractionBestTime(75, null)).toEqual({
      bestTime: 75,
      isNewBestTime: true,
    });
    expect(resolveSubtractionBestTime(60, 75)).toEqual({
      bestTime: 60,
      isNewBestTime: true,
    });
    expect(resolveSubtractionBestTime(90, 75)).toEqual({
      bestTime: 75,
      isNewBestTime: false,
    });
  });

  it("saves a subtraction-specific best time", () => {
    expect(loadSubtractionBestTime()).toBeNull();
    saveSubtractionBestTime(83);
    expect(window.localStorage.getItem(SUBTRACTION_BEST_TIME_STORAGE_KEY)).toBe(
      "83",
    );
    expect(loadSubtractionBestTime()).toBe(83);
  });
});
