export const TOTAL_SUBTRACTION_QUESTIONS = 20;
export const SUBTRACTION_LEVEL_UP_STREAK = 5;

export type SubtractionLevel = 1 | 2 | 3 | 4;

export type SubtractionAnswerDigits = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type SubtractionQuestion = {
  numbers: [number, number];
  correctAnswer: number;
  level: SubtractionLevel;
};

export const SUBTRACTION_LEVEL_LABELS: Record<SubtractionLevel, string> = {
  1: "Level 1: 4-digit − 3-digit",
  2: "Level 2: 5-digit − 4-digit",
  3: "Level 3: 6-digit − 5-digit",
  4: "Level 4: 7-digit − 6-digit",
};

type NumberRange = readonly [minimum: number, maximum: number];

const SUBTRACTION_LEVEL_NUMBER_RANGES: Record<
  SubtractionLevel,
  readonly [NumberRange, NumberRange]
> = {
  1: [[1000, 9999], [100, 999]],
  2: [[10000, 99999], [1000, 9999]],
  3: [[100000, 999999], [10000, 99999]],
  4: [[1000000, 9999999], [100000, 999999]],
};

export const SUBTRACTION_PLACE_LABELS = [
  "Millions digit",
  "Hundred-thousands digit",
  "Ten-thousands digit",
  "Thousands digit",
  "Hundreds digit",
  "Tens digit",
  "Ones digit",
] as const;

export function createEmptySubtractionDigits(): SubtractionAnswerDigits {
  return ["", "", "", "", "", "", ""];
}

function randomInteger(
  minimum: number,
  maximum: number,
  random: () => number,
) {
  const randomValue = Math.min(Math.max(random(), 0), 0.999999999);
  return Math.floor(randomValue * (maximum - minimum + 1)) + minimum;
}

export function generateSubtractionQuestion(
  level: SubtractionLevel,
  random: () => number = Math.random,
): SubtractionQuestion {
  const ranges = SUBTRACTION_LEVEL_NUMBER_RANGES[level];
  const numbers = ranges.map(([minimum, maximum]) =>
    randomInteger(minimum, maximum, random),
  ) as [number, number];

  return {
    numbers,
    correctAnswer: numbers[0] - numbers[1],
    level,
  };
}

export function getNextSubtractionLevel(
  currentLevel: SubtractionLevel,
  isCorrect: boolean,
  updatedStreak: number,
): SubtractionLevel {
  if (!isCorrect) {
    return Math.max(1, currentLevel - 1) as SubtractionLevel;
  }

  if (updatedStreak >= SUBTRACTION_LEVEL_UP_STREAK) {
    return Math.min(4, currentLevel + 1) as SubtractionLevel;
  }

  return currentLevel;
}

export function parseSubtractionAnswer(value: string): number | null {
  const normalizedValue = value.replace(/[\s,]/g, "");

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function combineSubtractionDigits(
  digits: SubtractionAnswerDigits,
): number | null {
  return parseSubtractionAnswer(digits.join(""));
}

export function formatSubtractionNumber(value: number) {
  return String(value);
}
