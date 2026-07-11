// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  ADDITION_BEST_TIME_STORAGE_KEY,
  formatAdditionTime,
  loadAdditionBestTime,
  resolveAdditionBestTime,
  saveAdditionBestTime,
} from "../src/features/addition/additionTimer";

beforeEach(() => {
  window.localStorage.clear();
});

describe("addition round timer", () => {
  it("formats elapsed time as minutes and seconds", () => {
    expect(formatAdditionTime(5)).toBe("00:05");
    expect(formatAdditionTime(92)).toBe("01:32");
    expect(formatAdditionTime(615)).toBe("10:15");
  });

  it("uses the first completed round as the initial best time", () => {
    expect(resolveAdditionBestTime(75, null)).toEqual({
      bestTime: 75,
      isNewBestTime: true,
    });
  });

  it("replaces a slower saved time with a faster time", () => {
    expect(resolveAdditionBestTime(60, 75)).toEqual({
      bestTime: 60,
      isNewBestTime: true,
    });
  });

  it("keeps the saved time when the new round is slower", () => {
    expect(resolveAdditionBestTime(90, 75)).toEqual({
      bestTime: 75,
      isNewBestTime: false,
    });
  });

  it("saves and loads the best time from localStorage", () => {
    expect(loadAdditionBestTime()).toBeNull();
    saveAdditionBestTime(83);
    expect(window.localStorage.getItem(ADDITION_BEST_TIME_STORAGE_KEY)).toBe(
      "83",
    );
    expect(loadAdditionBestTime()).toBe(83);
  });
});
