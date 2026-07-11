import { describe, expect, it } from "vitest";
import {
  combineAdditionDigits,
  generateAdditionQuestion,
  getNextAdditionLevel,
  parseAdditionAnswer,
} from "../src/features/addition/additionEngine";

describe("addition question engine", () => {
  it("generates Level 1 questions within the requested ranges", () => {
    const minimumQuestion = generateAdditionQuestion(1, () => 0);
    const maximumQuestion = generateAdditionQuestion(1, () => 0.999999);

    expect(minimumQuestion).toEqual({
      numbers: [1000, 100],
      correctAnswer: 1100,
      level: 1,
    });
    expect(maximumQuestion.numbers[0]).toBeGreaterThanOrEqual(1000);
    expect(maximumQuestion.numbers[0]).toBeLessThanOrEqual(9999);
    expect(maximumQuestion.numbers[1]).toBeGreaterThanOrEqual(100);
    expect(maximumQuestion.numbers[1]).toBeLessThanOrEqual(999);
    expect(maximumQuestion.correctAnswer).toBe(
      maximumQuestion.numbers.reduce((total, number) => total + number, 0),
    );
  });

  it("generates Level 2 questions with two 4-digit numbers", () => {
    const question = generateAdditionQuestion(2, () => 0);

    expect(question).toEqual({
      numbers: [1000, 1000],
      correctAnswer: 2000,
      level: 2,
    });
  });

  it("generates Level 3 questions with one 4-digit and two 3-digit numbers", () => {
    expect(generateAdditionQuestion(3, () => 0)).toEqual({
      numbers: [1000, 100, 100],
      correctAnswer: 1200,
      level: 3,
    });
  });

  it("generates Level 4 questions with three 4-digit numbers", () => {
    expect(generateAdditionQuestion(4, () => 0)).toEqual({
      numbers: [1000, 1000, 1000],
      correctAnswer: 3000,
      level: 4,
    });
  });

  it("applies level-up, stay, and go-back rules", () => {
    expect(getNextAdditionLevel(1, true, 4)).toBe(1);
    expect(getNextAdditionLevel(1, true, 5)).toBe(2);
    expect(getNextAdditionLevel(1, false, 0)).toBe(1);
    expect(getNextAdditionLevel(2, true, 4)).toBe(2);
    expect(getNextAdditionLevel(2, true, 5)).toBe(3);
    expect(getNextAdditionLevel(2, false, 0)).toBe(1);
    expect(getNextAdditionLevel(3, true, 5)).toBe(4);
    expect(getNextAdditionLevel(3, false, 0)).toBe(2);
    expect(getNextAdditionLevel(4, true, 5)).toBe(4);
    expect(getNextAdditionLevel(4, false, 0)).toBe(3);
  });

  it("accepts plain or comma-formatted whole-number answers", () => {
    expect(parseAdditionAnswer("4765")).toBe(4765);
    expect(parseAdditionAnswer("4,765")).toBe(4765);
    expect(parseAdditionAnswer(" 4 765 ")).toBe(4765);
    expect(parseAdditionAnswer("four thousand")).toBeNull();
  });

  it("combines place-value boxes from left to right", () => {
    expect(combineAdditionDigits(["", "4", "7", "6", "5"])).toBe(4765);
    expect(combineAdditionDigits(["1", "0", "0", "0", "0"])).toBe(
      10000,
    );
    expect(combineAdditionDigits(["", "", "", "", ""])).toBeNull();
  });

});
