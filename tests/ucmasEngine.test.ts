import { describe, expect, it } from "vitest";
import {
  formatUcmasSpeed,
  generateUcmasQuestion,
  getUcmasSpeedLabel,
  parseUcmasAnswer,
  UCMAS_VALUES_PER_QUESTION,
} from "../src/features/ucmas/ucmasEngine";

describe("UCMAS question engine", () => {
  it("generates 10 hidden calculation values with safe running totals", () => {
    for (let questionIndex = 0; questionIndex < 100; questionIndex += 1) {
      const question = generateUcmasQuestion();
      let runningTotal = 0;

      expect(question.values).toHaveLength(UCMAS_VALUES_PER_QUESTION);
      expect(question.values[0]).toBeGreaterThanOrEqual(1);
      expect(question.values[0]).toBeLessThanOrEqual(9);
      expect(question.values.some((value) => value < 0)).toBe(true);
      expect(question.values.some((value) => value > 0)).toBe(true);

      question.values.forEach((value) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).not.toBe(0);
        expect(value).toBeGreaterThanOrEqual(-9);
        expect(value).toBeLessThanOrEqual(9);
        runningTotal += value;
        expect(runningTotal).toBeGreaterThanOrEqual(0);
      });

      expect(question.correctAnswer).toBe(runningTotal);
    }
  });

  it("always includes subtraction even with a deterministic random source", () => {
    expect(generateUcmasQuestion(() => 0)).toEqual({
      values: [1, -1, 1, -1, 1, -1, 1, -1, 1, -1],
      correctAnswer: 0,
    });
  });

  it("accepts only non-negative whole-number answers", () => {
    expect(parseUcmasAnswer("19")).toBe(19);
    expect(parseUcmasAnswer("1,234")).toBe(1234);
    expect(parseUcmasAnswer(" 1 234 ")).toBe(1234);
    expect(parseUcmasAnswer("-1")).toBeNull();
    expect(parseUcmasAnswer("one")).toBeNull();
  });

  it("provides friendly speed labels", () => {
    expect(getUcmasSpeedLabel(3000)).toBe("Slow");
    expect(getUcmasSpeedLabel(1500)).toBe("Medium");
    expect(getUcmasSpeedLabel(100)).toBe("Fast");
    expect(formatUcmasSpeed(1500)).toBe("Medium · 1.5 seconds");
  });
});
