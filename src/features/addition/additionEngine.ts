export const TOTAL_ADDITION_QUESTIONS = 20;
export const LEVEL_UP_STREAK = 5;

export type AdditionLevel = 1 | 2 | 3 | 4;

export type AdditionAnswerDigits = [string, string, string, string, string];

export type AdditionQuestion = {
  numbers: number[];
  correctAnswer: number;
  level: AdditionLevel;
};

export const ADDITION_LEVEL_LABELS: Record<AdditionLevel, string> = {
  1: "Level 1: 4-digit + 3-digit",
  2: "Level 2: 4-digit + 4-digit",
  3: "Level 3: 4-digit + 3-digit + 3-digit",
  4: "Level 4: 4-digit + 4-digit + 4-digit",
};

type NumberRange = readonly [minimum: number, maximum: number];

const ADDITION_LEVEL_NUMBER_RANGES: Record<
  AdditionLevel,
  readonly NumberRange[]
> = {
  1: [[1000, 9999], [100, 999]],
  2: [[1000, 9999], [1000, 9999]],
  3: [[1000, 9999], [100, 999], [100, 999]],
  4: [[1000, 9999], [1000, 9999], [1000, 9999]],
};

export const ADDITION_PLACE_LABELS = [
  "Ten-thousands digit",
  "Thousands digit",
  "Hundreds digit",
  "Tens digit",
  "Ones digit",
] as const;

export function createEmptyAdditionDigits(): AdditionAnswerDigits {
  return ["", "", "", "", ""];
}

function randomInteger(
  minimum: number,
  maximum: number,
  random: () => number,
) {
  const randomValue = Math.min(Math.max(random(), 0), 0.999999999);
  return Math.floor(randomValue * (maximum - minimum + 1)) + minimum;
}

export function generateAdditionQuestion(
  level: AdditionLevel,
  random: () => number = Math.random,
): AdditionQuestion {
  const numbers = ADDITION_LEVEL_NUMBER_RANGES[level].map(
    ([minimum, maximum]) => randomInteger(minimum, maximum, random),
  );

  return {
    numbers,
    correctAnswer: numbers.reduce((total, number) => total + number, 0),
    level,
  };
}

export function getNextAdditionLevel(
  currentLevel: AdditionLevel,
  isCorrect: boolean,
  updatedStreak: number,
): AdditionLevel {
  if (!isCorrect) {
    return Math.max(1, currentLevel - 1) as AdditionLevel;
  }

  if (updatedStreak >= LEVEL_UP_STREAK) {
    return Math.min(4, currentLevel + 1) as AdditionLevel;
  }

  return currentLevel;
}

export function parseAdditionAnswer(value: string): number | null {
  const normalizedValue = value.replace(/[\s,]/g, "");

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function combineAdditionDigits(
  digits: AdditionAnswerDigits,
): number | null {
  return parseAdditionAnswer(digits.join(""));
}

export function formatAdditionNumber(value: number) {
  return String(value);
}
