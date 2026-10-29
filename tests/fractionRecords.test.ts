// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  formatFractionTime,
  FRACTION_BEST_TIME_STORAGE_KEY,
  loadFractionBestTime,
  resolveFractionBestTime,
  saveFractionBestTime,
} from "../src/features/fractions/fractionRecords";

beforeEach(() => {
  window.localStorage.clear();
});

describe("fraction round records", () => {
  it("formats the round timer", () => {
    expect(formatFractionTime(5)).toBe("00:05");
    expect(formatFractionTime(92)).toBe("01:32");
    expect(formatFractionTime(615)).toBe("10:15");
  });

  it("keeps the fastest completed time", () => {
    expect(resolveFractionBestTime(75, null)).toEqual({
      bestTime: 75,
      isNewBestTime: true,
    });
    expect(resolveFractionBestTime(60, 75)).toEqual({
      bestTime: 60,
      isNewBestTime: true,
    });
    expect(resolveFractionBestTime(90, 75)).toEqual({
      bestTime: 75,
      isNewBestTime: false,
    });
  });

  it("saves and loads the best time locally", () => {
    saveFractionBestTime(83);

    expect(window.localStorage.getItem(FRACTION_BEST_TIME_STORAGE_KEY)).toBe(
      "83",
    );
    expect(loadFractionBestTime()).toBe(83);
  });
});
