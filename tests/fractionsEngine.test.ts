import { describe, expect, it } from "vitest";
import {
  generateFractionQuestion,
  getFractionPartCount,
  getFractionGridDimensions,
  getRequiredColoredPartCount,
  isFractionSelectionCorrect,
  TOTAL_FRACTION_QUESTIONS,
} from "../src/features/fractions/fractionsEngine";

function sequenceRandom(values: number[]) {
  let index = 0;
  return () => values[index++] ?? values[values.length - 1];
}

describe("fractions engine", () => {
  it("generates valid proper fractions for every shape type", () => {
    const randomValues = [0, 0.25, 0.51, 0.76, 0.999];

    randomValues.forEach((randomValue) => {
      const question = generateFractionQuestion(1, () => randomValue);

      expect(question.numerator).toBeGreaterThanOrEqual(1);
      expect(question.numerator).toBeLessThan(question.denominator);
      expect(question.denominator).toBeGreaterThanOrEqual(2);
    });
  });

  it("generates compatible grid and circle questions", () => {
    const gridQuestion = generateFractionQuestion(
      1,
      sequenceRandom([0.51, 0.999, 0.999]),
    );
    const circleQuestion = generateFractionQuestion(
      1,
      sequenceRandom([0.999, 0.999, 0.999]),
    );

    expect(gridQuestion).toEqual({
      shape: "grid",
      denominator: 5,
      numerator: 4,
      partitionMultiplier: 1,
    });
    expect(getFractionGridDimensions(12)).toEqual({
      rows: 3,
      columns: 4,
    });
    expect(circleQuestion).toEqual({
      shape: "circle",
      denominator: 5,
      numerator: 4,
      partitionMultiplier: 1,
    });
  });

  it("progresses from direct models to equivalent-fraction models", () => {
    const directQuestion = generateFractionQuestion(1, () => 0);
    const doubledQuestion = generateFractionQuestion(6, () => 0);
    const tripledQuestion = generateFractionQuestion(11, () => 0);
    const quadrupledQuestion = generateFractionQuestion(16, () => 0);

    expect(directQuestion.partitionMultiplier).toBe(1);
    expect(getFractionPartCount(directQuestion)).toBe(2);
    expect(getRequiredColoredPartCount(directQuestion)).toBe(1);

    expect(doubledQuestion.partitionMultiplier).toBe(2);
    expect(getFractionPartCount(doubledQuestion)).toBe(4);
    expect(getRequiredColoredPartCount(doubledQuestion)).toBe(2);

    expect(tripledQuestion.partitionMultiplier).toBe(3);
    expect(getFractionPartCount(tripledQuestion)).toBe(6);
    expect(getRequiredColoredPartCount(tripledQuestion)).toBe(3);

    expect(quadrupledQuestion.partitionMultiplier).toBe(4);
    expect(getFractionPartCount(quadrupledQuestion)).toBe(12);
    expect(getRequiredColoredPartCount(quadrupledQuestion)).toBe(4);
  });

  it("supports a 2/5 question drawn as 4 of 10 equal pieces", () => {
    const question = {
      shape: "grid" as const,
      numerator: 2,
      denominator: 5,
      partitionMultiplier: 2,
    };

    expect(getFractionPartCount(question)).toBe(10);
    expect(getRequiredColoredPartCount(question)).toBe(4);
    expect(isFractionSelectionCorrect(4, question)).toBe(true);
    expect(isFractionSelectionCorrect(2, question)).toBe(false);
  });

  it("checks selections by the number of equal parts shaded", () => {
    const question = {
      shape: "horizontal-bar" as const,
      numerator: 3,
      denominator: 5,
      partitionMultiplier: 1,
    };

    expect(isFractionSelectionCorrect(3, question)).toBe(true);
    expect(isFractionSelectionCorrect(2, question)).toBe(false);
    expect(TOTAL_FRACTION_QUESTIONS).toBe(20);
  });
});
