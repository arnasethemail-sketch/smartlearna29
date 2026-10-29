import { describe, expect, it } from "vitest";
import {
  formatAdditionStars,
  getAdditionStarRating,
} from "../src/features/addition/additionStars";

describe("addition star awards", () => {
  it.each([
    [20, 5],
    [18, 5],
    [17, 4],
    [14, 4],
    [13, 3],
    [9, 3],
    [8, 2],
    [1, 2],
    [0, 1],
  ])("awards %i correct answers %i stars", (score, expectedStars) => {
    expect(getAdditionStarRating(score)).toBe(expectedStars);
  });

  it("formats filled and empty stars", () => {
    expect(formatAdditionStars(5)).toBe("\u2605".repeat(5));
    expect(formatAdditionStars(3)).toBe(
      `${"\u2605".repeat(3)}${"\u2606".repeat(2)}`,
    );
    expect(formatAdditionStars(1)).toBe(
      `${"\u2605"}${"\u2606".repeat(4)}`,
    );
  });
});
