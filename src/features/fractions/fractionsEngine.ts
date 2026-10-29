export const TOTAL_FRACTION_QUESTIONS = 20;

export type FractionShapeType =
  | "horizontal-bar"
  | "vertical-bar"
  | "grid"
  | "circle";

export type FractionQuestion = {
  numerator: number;
  denominator: number;
  shape: FractionShapeType;
  partitionMultiplier: number;
};

const SHAPE_TYPES: FractionShapeType[] = [
  "horizontal-bar",
  "vertical-bar",
  "grid",
  "circle",
];

type FractionDifficulty = {
  denominators: number[];
  partitionMultiplier: number;
};

const FRACTION_DIFFICULTIES: FractionDifficulty[] = [
  // Questions 1-5: learn the direct fraction model.
  { denominators: [2, 3, 4, 5], partitionMultiplier: 1 },
  // Questions 6-10: recognize halves, thirds, fourths, and fifths
  // when every original part has been split in two.
  { denominators: [2, 3, 4, 5], partitionMultiplier: 2 },
  // Questions 11-15: every original part is split into three pieces.
  { denominators: [2, 3, 4, 5], partitionMultiplier: 3 },
  // Questions 16-20: mastery models with up to 20 picture parts.
  { denominators: [3, 4, 5], partitionMultiplier: 4 },
];

const GRID_DIMENSIONS: Record<number, { rows: number; columns: number }> = {
  4: { rows: 2, columns: 2 },
  6: { rows: 2, columns: 3 },
  8: { rows: 2, columns: 4 },
  9: { rows: 3, columns: 3 },
  10: { rows: 2, columns: 5 },
  12: { rows: 3, columns: 4 },
  15: { rows: 3, columns: 5 },
  16: { rows: 4, columns: 4 },
  20: { rows: 4, columns: 5 },
};

function pickRandom<T>(items: T[], random: () => number): T {
  const index = Math.min(
    items.length - 1,
    Math.floor(Math.max(0, random()) * items.length),
  );

  return items[index];
}

function getFractionDifficulty(questionNumber: number) {
  if (questionNumber <= 5) {
    return FRACTION_DIFFICULTIES[0];
  }

  if (questionNumber <= 10) {
    return FRACTION_DIFFICULTIES[1];
  }

  if (questionNumber <= 15) {
    return FRACTION_DIFFICULTIES[2];
  }

  return FRACTION_DIFFICULTIES[3];
}

export function generateFractionQuestion(
  questionNumber = 1,
  random: () => number = Math.random,
): FractionQuestion {
  const difficulty = getFractionDifficulty(questionNumber);
  const shape = pickRandom(SHAPE_TYPES, random);
  const denominator = pickRandom(difficulty.denominators, random);
  const validNumerators = Array.from(
    { length: denominator - 1 },
    (_, index) => index + 1,
  ).filter((numerator) => greatestCommonDivisor(numerator, denominator) === 1);
  const numerator = pickRandom(validNumerators, random);

  return {
    numerator,
    denominator,
    shape,
    partitionMultiplier: difficulty.partitionMultiplier,
  };
}

function greatestCommonDivisor(first: number, second: number): number {
  return second === 0
    ? Math.abs(first)
    : greatestCommonDivisor(second, first % second);
}

export function getFractionPartCount(question: FractionQuestion) {
  return question.denominator * question.partitionMultiplier;
}

export function getRequiredColoredPartCount(question: FractionQuestion) {
  return question.numerator * question.partitionMultiplier;
}

export function getFractionGridDimensions(denominator: number) {
  return GRID_DIMENSIONS[denominator] ?? { rows: 1, columns: denominator };
}

export function isFractionSelectionCorrect(
  selectedPartCount: number,
  question: FractionQuestion,
) {
  return selectedPartCount === getRequiredColoredPartCount(question);
}
