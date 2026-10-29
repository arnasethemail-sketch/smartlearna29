import { describe, expect, it } from "vitest";
import {
  combineSubtractionDigits,
  generateSubtractionQuestion,
  getNextSubtractionLevel,
  parseSubtractionAnswer,
} from "../src/features/subtraction/subtractionEngine";

describe("subtraction question engine", () => {
  it("generates all four levels with the larger number first", () => {
    expect(generateSubtractionQuestion(1, () => 0)).toEqual({
      numbers: [1000, 100],
      correctAnswer: 900,
      level: 1,
    });
    expect(generateSubtractionQuestion(2, () => 0)).toEqual({
      numbers: [10000, 1000],
      correctAnswer: 9000,
      level: 2,
    });
    expect(generateSubtractionQuestion(3, () => 0)).toEqual({
      numbers: [100000, 10000],
      correctAnswer: 90000,
      level: 3,
    });
    expect(generateSubtractionQuestion(4, () => 0)).toEqual({
      numbers: [1000000, 100000],
      correctAnswer: 900000,
      level: 4,
    });
  });

  it("keeps generated numbers in each level's digit ranges", () => {
    const levelFour = generateSubtractionQuestion(4, () => 0.999999);

    expect(levelFour.numbers[0]).toBeGreaterThanOrEqual(1000000);
    expect(levelFour.numbers[0]).toBeLessThanOrEqual(9999999);
    expect(levelFour.numbers[1]).toBeGreaterThanOrEqual(100000);
    expect(levelFour.numbers[1]).toBeLessThanOrEqual(999999);
    expect(levelFour.correctAnswer).toBe(
      levelFour.numbers[0] - levelFour.numbers[1],
    );
    expect(levelFour.correctAnswer).toBeGreaterThanOrEqual(0);
  });

  it("levels up after five correct and moves back after a miss", () => {
    expect(getNextSubtractionLevel(1, true, 4)).toBe(1);
    expect(getNextSubtractionLevel(1, true, 5)).toBe(2);
    expect(getNextSubtractionLevel(1, false, 0)).toBe(1);
    expect(getNextSubtractionLevel(2, true, 5)).toBe(3);
    expect(getNextSubtractionLevel(2, false, 0)).toBe(1);
    expect(getNextSubtractionLevel(3, true, 5)).toBe(4);
    expect(getNextSubtractionLevel(3, false, 0)).toBe(2);
    expect(getNextSubtractionLevel(4, true, 5)).toBe(4);
    expect(getNextSubtractionLevel(4, false, 0)).toBe(3);
  });

  it("parses and combines seven right-to-left place-value boxes", () => {
    expect(parseSubtractionAnswer("9,000")).toBe(9000);
    expect(parseSubtractionAnswer(" 9 000 ")).toBe(9000);
    expect(parseSubtractionAnswer("nine thousand")).toBeNull();
    expect(
      combineSubtractionDigits(["", "", "", "9", "0", "0", "0"]),
    ).toBe(9000);
    expect(
      combineSubtractionDigits(["9", "0", "0", "0", "0", "0", "0"]),
    ).toBe(9000000);
    expect(
      combineSubtractionDigits(["", "", "", "", "", "", ""]),
    ).toBeNull();
  });
});
