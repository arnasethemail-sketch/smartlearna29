import { describe, expect, it } from "vitest";
import {
  formatFractionStars,
  getFractionStarRating,
} from "../src/features/fractions/fractionStars";

describe("fraction star awards", () => {
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
    expect(getFractionStarRating(score)).toBe(expectedStars);
  });

  it("formats filled and empty stars", () => {
    expect(formatFractionStars(5)).toBe("★★★★★");
    expect(formatFractionStars(3)).toBe("★★★☆☆");
    expect(formatFractionStars(1)).toBe("★☆☆☆☆");
  });
});
